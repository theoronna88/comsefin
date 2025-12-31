"use server";

import { prisma } from "../_lib/prisma";

interface GrupoComCategorias {
  groupId: string | null; // ID do grupo estático ou null se desagrupado
  contaAzulCategoryIds: string[];
}

export async function salvarOrganizacaoCategorias(
  grupos: GrupoComCategorias[]
) {
  console.log("[SERVER] salvarOrganizacaoCategorias chamado");
  console.log("[SERVER] Grupos recebidos:", JSON.stringify(grupos, null, 2));

  try {
    const createOps: ReturnType<typeof prisma.categoriaAgrupada.create>[] = [];

    const deleteOp = prisma.categoriaAgrupada.deleteMany({});

    for (const grupo of grupos) {
      if (grupo.groupId) {
        console.log(`[SERVER] Processando grupo: ${grupo.groupId} com ${grupo.contaAzulCategoryIds.length} categorias`);
        for (let i = 0; i < grupo.contaAzulCategoryIds.length; i++) {
          const catId = grupo.contaAzulCategoryIds[i];
          console.log(`[SERVER] Adicionando categoria: ${catId} no grupo ${grupo.groupId} com ordem ${i}`);

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

    console.log(`[SERVER] Total de operações de criação: ${createOps.length}`);
    console.log("[SERVER] Executando transação...");

    await prisma.$transaction([deleteOp, ...createOps]);

    console.log("[SERVER] Transação concluída com sucesso!");

    // Verificar o que foi salvo
    const savedData = await prisma.categoriaAgrupada.findMany();
    console.log("[SERVER] Dados salvos no banco:", JSON.stringify(savedData, null, 2));

    return { success: true };
  } catch (error) {
    console.error("[SERVER] Erro ao salvar organização das categorias:", error);
    return {
      success: false,
      message: "Não foi possível salvar a organização.",
    };
  }
}

export async function resetarOrganizacaoCategorias() {
  try {
    await prisma.categoriaAgrupada.deleteMany({});
    return { success: true };
  } catch (error) {
    console.error("Erro ao resetar organização:", error);
    return {
      success: false,
      message: "Não foi possível resetar a organização.",
    };
  }
}

export interface CategoriaOrganizacaoSalva {
  id: string;
  contaAzulCategoryId: string;
  grupoId: string;
  ordem: number;
}

export async function getOrganizacaoCategorias(): Promise<
  CategoriaOrganizacaoSalva[]
> {
  try {
    const organizacao = await prisma.categoriaAgrupada.findMany({
      orderBy: [{ grupoId: "asc" }, { ordem: "asc" }],
    });
    return organizacao;
  } catch (error) {
    console.error("Erro ao buscar organização das categorias:", error);
    return [];
  }
}
