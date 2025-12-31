# Plano de Implementação: Drag-and-Drop com Grupos Estáticos

## Objetivo

O objetivo deste plano é implementar a funcionalidade de arrastar e soltar (drag-and-drop) para que os usuários possam organizar `Categorias` (vindas da API da **Conta Azul**) em `Grupos de Despesas` pré-definidos.

**Pontos Chave:**

1.  As **Categorias** vêm da Conta Azul e não são armazenadas em nosso banco de dados.
2.  Os **Grupos de Despesas** também não são armazenados no banco. Eles são uma lista estática definida no arquivo `app/_lib/types.ts` (constante `GRUPOS_DESPESAS_GRUPOPNG`).
3.  A única informação que será salva em nosso banco de dados é a **associação** global: qual `ID de Categoria` (da Conta Azul) pertence a qual `ID de Grupo` (estático) e qual a sua `ordem` dentro desse grupo. A organização é a mesma para todos os usuários.

Este guia detalha as etapas para um desenvolvedor implementar essa funcionalidade.

---

### Passo 1: Configurar o Banco de Dados

Precisamos de uma única tabela para armazenar a organização customizada.

1.  **Modificar o Schema do Prisma:**
    Abra o arquivo `prisma/schema.prisma`. Defina um modelo `CategoriaAgrupada` para persistir a relação entre o ID da categoria da Conta Azul, o ID do grupo estático e a ordem.

    ```prisma
    // prisma/schema.prisma

    // Tabela para armazenar a organização das categorias da Conta Azul em grupos estáticos
    model CategoriaAgrupada {
      id                  String @id @default(cuid())
      contaAzulCategoryId String // ID da categoria que vem da API da Conta Azul
      grupoId             String // ID do grupo estático (ex: "pessoal", "investimentos")
      ordem               Int    // Ordem da categoria dentro do seu grupo
    }
    ```

    **Importante:** Não é necessário um modelo `GrupoCategoria` no Prisma, pois os grupos são estáticos. A organização é global e não por usuário.

2.  **Criar a Migration:**
    Execute o comando abaixo para criar a tabela `CategoriaAgrupada` no banco de dados.

    ```bash
    npx prisma migrate dev --name add_categoria_agrupada
    ```

3.  **Commit das Mudanças:**
    Faça o commit das alterações do banco de dados.

    ```bash
    git add prisma/schema.prisma prisma/migrations/
    git commit -m "feat(db): Adiciona model CategoriaAgrupada para persistir organização"
    ```

---

### Passo 2: Criar as Server Actions

O backend precisa de funções para salvar e resetar a organização.

1.  **Criar/Modificar o Arquivo de Actions:**
    Use o arquivo `app/_actions/categoria-actions.ts`.

2.  **Adicionar a Ação de Salvar Organização:**
    Esta função receberá o estado da organização do frontend e o persistirá no banco de dados. A estratégia é apagar todos os dados antigos e recriar a organização a cada salvamento.

    ```typescript
    // app/_actions/categoria-actions.ts

    "use server";

    import { prisma } from "@/app/_lib/prisma";
    import { revalidatePath } from "next/cache";

    interface GrupoComCategorias {
      groupId: string | null; // ID do grupo estático ou null se desagrupado
      contaAzulCategoryIds: string[];
    }

    export async function salvarOrganizacaoCategorias(
      grupos: GrupoComCategorias[]
    ) {
      try {
        const createOps: any[] = [];

        // 1. Apaga toda a organização existente
        const deleteOp = prisma.categoriaAgrupada.deleteMany({});

        // 2. Prepara a criação das novas associações
        for (const grupo of grupos) {
          if (grupo.groupId) {
            // Apenas salva categorias que estão em um grupo
            for (let i = 0; i < grupo.contaAzulCategoryIds.length; i++) {
              const catId = grupo.contaAzulCategoryIds[i];

              createOps.push(
                prisma.categoriaAgrupada.create({
                  data: {
                    contaAzulCategoryId: catId,
                    grupoId: grupo.groupId,
                    ordem: i,
                  },
                })
              );
            }
          }
        }

        // Executa a deleção e a criação em uma única transação
        await prisma.$transaction([deleteOp, ...createOps]);

        revalidatePath("/user/categorias");
        return { success: true };
      } catch (error) {
        console.error("Erro ao salvar organização das categorias:", error);
        return {
          success: false,
          message: "Não foi possível salvar a organização.",
        };
      }
    }
    ```

3.  **Adicionar a Ação de Resetar Organização:**
    Esta função simplesmente apaga todos os registros de `CategoriaAgrupada`.

    ```typescript
    // app/_actions/categoria-actions.ts

    export async function resetarOrganizacaoCategorias() {
      try {
        await prisma.categoriaAgrupada.deleteMany({});
        revalidatePath("/user/categorias");
        return { success: true };
      } catch (error) {
        console.error("Erro ao resetar organização:", error);
        return {
          success: false,
          message: "Não foi possível resetar a organização.",
        };
      }
    }
    ```

4.  **Commit das Mudanças:**

    ```bash
    git add app/_actions/categoria-actions.ts
    git commit -m "feat(actions): Cria server actions para gerenciar organização de categorias"
    ```

---

### Passo 3: Integrar o Frontend

O frontend irá ler os grupos estáticos, carregar a organização salva e chamar as actions.

1.  **Modificar o Componente Principal (ex: `category-group-manager.tsx`):**
    Este componente irá orquestrar a lógica no lado do cliente.

2.  **Carregar Dados e Construir o Estado Inicial:**

    - Importe os grupos estáticos de `types.ts`.
    - Em um Server Component, busque as categorias da Conta Azul e as associações (`CategoriaAgrupada`) do nosso banco.
    - Combine os dados para montar o estado inicial da UI.

    ```tsx
    // Em seu componente de página ou gerenciador
    import { GRUPOS_DESPESAS_GRUPOPNG } from "@/app/_lib/types";
    import { salvarOrganizacaoCategorias } from "@/app/_actions/categoria-actions";
    import { useTransition } from "react";

    // ...

    // Lógica para carregar e combinar os dados (em um Server Component ou hook)
    async function getInitialState() {
      // 1. Grupos vêm do arquivo de tipos
      const grupos = GRUPOS_DESPESAS_GRUPOPNG;

      // 2. Busque as categorias da API da Conta Azul
      const categoriasDaContaAzul = await fetchCategoriasFromContaAzul(); // Não precisa mais de userId

      // 3. Busque a organização salva no nosso DB (é global)
      const organizacaoSalva = await prisma.categoriaAgrupada.findMany({});

      // 4. Monte o estado inicial para a UI de drag-and-drop
      const estadoInicial = {
        "sem-grupo": { id: null, nome: "Categorias não Agrupadas", items: [] },
        ...Object.fromEntries(grupos.map((g) => [g.id, { ...g, items: [] }])),
      };

      categoriasDaContaAzul.forEach((cat) => {
        const assoc = organizacaoSalva.find(
          (o) => o.contaAzulCategoryId === cat.id
        );
        if (assoc && estadoInicial[assoc.grupoId]) {
          estadoInicial[assoc.grupoId].items.push({
            ...cat,
            ordem: assoc.ordem,
          });
        } else {
          estadoInicial["sem-grupo"].items.push(cat);
        }
      });

      // Ordena os items dentro de cada grupo
      Object.values(estadoInicial).forEach((g) =>
        g.items.sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0))
      );

      return estadoInicial;
    }
    ```

3.  **Chamar a Action no `onDragEnd`:**
    Após o usuário arrastar e soltar, atualize o estado da UI e chame a `server action`.

    ```tsx
    // Dentro do seu componente React
    const [isPending, startTransition] = useTransition();

    const handleDragEnd = (novoEstado) => {
      // Atualiza a UI otimistamente
      setEstado(novoEstado);

      // Prepara o payload para a action
      const payload = Object.entries(novoEstado).map(
        ([groupId, groupData]) => ({
          groupId: groupId === "sem-grupo" ? null : groupId,
          contaAzulCategoryIds: groupData.items.map((item) => item.id),
        })
      );

      // Chama a action
      startTransition(async () => {
        await salvarOrganizacaoCategorias(payload);
        // Exibir toast de sucesso/erro
      });
    };
    ```

4.  **Commit das Mudanças:**

    ```bash
    git add . // Adicione os arquivos relevantes
    git commit -m "feat(ui): Implementa drag-and-drop com grupos estáticos e persistência"
    ```

---

### Passo 4: Implementar o Diálogo de Confirmação para o Reset

A chamada da action `resetarOrganizacaoCategorias` não precisa mais de `userId`.

```tsx
// Lógica do botão de reset
import { resetarOrganizacaoCategorias } from "@/app/_actions/categoria-actions";

// ...
const handleReset = () => {
  startResetTransition(async () => {
    await resetarOrganizacaoCategorias();
  });
};
// O JSX do AlertDialog permanece o mesmo...
```

Com estas etapas, a funcionalidade estará completa e alinhada com todos os requisitos especificados.

Passo 1 [x]
Passo 2 [x]
Passo 3 []
Passo 4 []
