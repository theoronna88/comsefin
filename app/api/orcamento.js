"use server";
import { prisma } from "../_lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";
import { redirect } from "next/navigation";
import { jwtDecode } from "jwt-decode";

/**
 * Obtém o userId (sub) do JWT do Conta Azul a partir da sessão
 * @returns {Promise<string>} O userId do usuário logado
 * @throws {Error} Se a sessão for inválida ou o token estiver expirado
 */
async function getAuthenticatedUserId() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/");
  }

  if (session.error === "RefreshAccessTokenError") {
    redirect("/");
  }

  if (!session.accessToken) {
    redirect("/");
  }

  try {
    // Decodifica o JWT para obter o sub (userId do Conta Azul)
    const decoded = jwtDecode(session.accessToken);

    if (!decoded.sub) {
      throw new Error("Token inválido: sub não encontrado");
    }

    // Verifica se o token expirou
    if (decoded.exp && decoded.exp * 1000 < Date.now()) {
      redirect("/");
    }

    return decoded.sub;
  } catch (error) {
    console.error("Erro ao decodificar token:", error);
    redirect("/");
  }
}

export async function saveBudget(data) {
  // Verifica sessão e obtém userId
  const userId = await getAuthenticatedUserId();

  //Verifica se é atualização ou criação
  if (data.id) {
    try {
      // Verifica se o orçamento pertence ao usuário
      const currentBudget = await prisma.orcamentos.findFirst({
        where: { id: data.id },
      });

      if (!currentBudget) {
        throw new Error("Orçamento não encontrado ou não pertence ao usuário.");
      }

      //O ano só pode ser atualizado se não existir outro orçamento com o mesmo ano para este usuário
      const existingBudget = await prisma.orcamentos.findFirst({
        where: { ano: Number(data.ano), userId },
      });
      if (existingBudget && existingBudget.id !== data.id) {
        throw new Error("Orçamento para este ano já existe.");
      }
      //Atualiza o orçamento existente
      await prisma.orcamentos.update({
        where: { id: data.id },
        data: { ano: Number(data.ano) },
      });
      //Atualiza os valores do orçamento
      for (const categoria of data.categorias) {
        // Usar categoriaId como código único
        const catCodigo = categoria.categoriaId;
        const catNome = categoria.nome || categoria.categoriaId;

        const existingItem = await prisma.itensOrcamento.findFirst({
          where: {
            codigo: catCodigo,
          },
        });
        let item = null;
        if (!existingItem) {
          item = await prisma.itensOrcamento.create({
            data: {
              descricao: catNome,
              codigo: catCodigo,
              status: true,
            },
          });
        } else {
          // Atualiza o nome/descrição caso tenha mudado
          await prisma.itensOrcamento.update({
            where: { id: existingItem.id },
            data: { descricao: catNome },
          });
        }
        const existingValue = await prisma.valoresOrcamento.findFirst({
          where: {
            orcamentoId: data.id,
            itemId: existingItem ? existingItem.id : item.id,
          },
        });
        if (existingValue) {
          await prisma.valoresOrcamento.update({
            where: { id: existingValue.id },
            data: { valor: Number(categoria.valor) },
          });
        } else {
          await prisma.valoresOrcamento.create({
            data: {
              orcamentoId: data.id,
              itemId: existingItem ? existingItem.id : item.id,
              valor: Number(categoria.valor),
            },
          });
        }
      }
    } catch (error) {
      console.error("Erro ao atualizar o orçamento:", error);
      throw new Error("Erro ao atualizar o orçamento.");
    }
    return;
  }

  // Verifica se já existe orçamento para este ano E para este usuário
  const existingBudget = await prisma.orcamentos.findFirst({
    where: {
      ano: Number(data.ano),
      userId,
    },
  });
  if (existingBudget) {
    throw new Error("Orçamento para este ano já existe.");
  }

  //Cria um novo orçamento para o ano selecionado, atrelado ao usuário
  const rOrcamento = await prisma.orcamentos.create({
    data: {
      ano: Number(data.ano),
      userId, // Atrelando ao usuário do Conta Azul
    },
  });

  //Verifica se os itens do orçamento já existem e cria novos itens
  for (const categoria of data.categorias) {
    // Usar categoriaId como código único
    const catCodigo = categoria.categoriaId;
    const catNome = categoria.nome || categoria.categoriaId;

    const existingItem = await prisma.itensOrcamento.findFirst({
      where: {
        codigo: catCodigo,
      },
    });

    let item = null;
    if (!existingItem) {
      item = await prisma.itensOrcamento.create({
        data: {
          descricao: catNome,
          codigo: catCodigo,
          status: true,
        },
      });
    } else {
      // Atualiza o nome/descrição caso tenha mudado
      await prisma.itensOrcamento.update({
        where: { id: existingItem.id },
        data: { descricao: catNome },
      });
    }

    //Cria Valores do Orçamento
    await prisma.valoresOrcamento.create({
      data: {
        orcamentoId: rOrcamento.id,
        itemId: existingItem ? existingItem.id : item.id,
        valor: Number(categoria.valor),
      },
    });
  }
}

export async function getBudget() {
  // Verifica sessão e obtém userId
  // const userId = await getAuthenticatedUserId();

  // Retorna apenas os orçamentos do usuário logado
  const budgets = await prisma.orcamentos.findMany({
    // where: { userId },
    include: {
      valores: { include: { item: true } },
    },
    orderBy: { ano: "desc" },
  });
  return budgets;
}

export async function getBudgetByYear(year) {
  // Verifica sessão e obtém userId
  const userId = await getAuthenticatedUserId();

  // Retorna o orçamento do ano apenas se pertencer ao usuário
  const budget = await prisma.orcamentos.findFirst({
    where: { ano: Number(year), userId },
    include: {
      valores: { include: { item: true } },
    },
  });
  return budget;
}

export async function deleteBudget(id) {
  // Verifica sessão e obtém userId
  const userId = await getAuthenticatedUserId();

  try {
    // Verifica se o orçamento pertence ao usuário antes de deletar
    const budget = await prisma.orcamentos.findFirst({
      where: { id, userId },
    });

    if (!budget) {
      throw new Error("Orçamento não encontrado ou não pertence ao usuário.");
    }

    //Deleta os valores do orçamento
    await prisma.valoresOrcamento.deleteMany({
      where: { orcamentoId: id },
    });
    //Deleta o orçamento
    await prisma.orcamentos.delete({
      where: { id },
    });
  } catch (error) {
    console.error("Erro ao deletar o orçamento:", error);
    throw new Error("Erro ao deletar o orçamento.");
  }

  return;
}
