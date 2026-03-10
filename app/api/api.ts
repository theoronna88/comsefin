"use server";

import { redirect } from "next/navigation";
import { prisma } from "../_lib/prisma";
import { getContaAzulToken } from "../_lib/conta-azul-auth";
import {
  AppError,
  ConflictError,
  DatabaseError,
  ExternalAPIError,
  AuthenticationError,
  handleError,
} from "../_lib/errors";
import type {
  BudgetInput,
  Categoria,
  CentroCusto,
  ContaAzulPaginatedResponse,
  DespesaReceita,
  Orcamento,
  Pessoa,
  TokenResponse,
} from "../_lib/types";

const ids_contas_financeiras = process.env.NEXT_PUBLIC_IDS_CONTAS_FINANCEIRAS
  ? process.env.NEXT_PUBLIC_IDS_CONTAS_FINANCEIRAS
  : "";

// ==========================================
// FUNÇÕES DE AUTENTICAÇÃO
// ==========================================

/**
 * Redireciona para a URL de autenticação OAuth da Conta Azul
 */
export async function getApiUrl(): Promise<never> {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.NEXT_CLIENT_ID || "",
    redirect_uri: process.env.NEXT_REDIRECT_URI || "",
    scope: "openid profile aws.cognito.signin.user.admin",
    state: crypto.randomUUID(),
  });

  return redirect(`${process.env.NEXT_AUTH_URL}?${params.toString()}`);
}

/**
 * Obtém o token de acesso usando o código de autorização OAuth
 *
 * @param authorizationCode - Código de autorização recebido do OAuth
 * @returns Token de acesso e refresh token
 */
export async function getToken(
  authorizationCode: string,
): Promise<TokenResponse> {
  const basicAuth = Buffer.from(
    `${process.env.NEXT_CLIENT_ID}:${process.env.NEXT_CLIENT_SECRET}`,
  ).toString("base64");

  const params = new URLSearchParams({
    client_id: process.env.NEXT_CLIENT_ID || "",
    client_secret: process.env.NEXT_CLIENT_SECRET || "",
    grant_type: "authorization_code",
    code: authorizationCode,
    redirect_uri: process.env.NEXT_REDIRECT_URI || "",
  });

  try {
    const response = await fetch(process.env.NEXT_TOKEN_URL!, {
      method: "POST",
      headers: {
        Authorization: `Basic ${basicAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: params.toString(),
    });

    const resultText = await response.text();

    if (!response.ok) {
      throw new ExternalAPIError(
        `Falha ao obter token: ${response.status} - ${response.statusText}`,
      );
    }
    console.log("[getToken] Resposta do token:", resultText);
    return JSON.parse(resultText) as TokenResponse;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw handleError(error);
  }
}

// ==========================================
// FUNÇÕES DA API CONTA AZUL
// ==========================================

/**
 * Busca os centros de custo da Conta Azul
 *
 * @returns Lista paginada de centros de custo
 */
export async function getCentroCusto(): Promise<
  ContaAzulPaginatedResponse<CentroCusto>
> {
  try {
    const accessToken = await getContaAzulToken();

    if (!accessToken) {
      throw new AuthenticationError(
        "Token da Conta Azul não encontrado. Faça login novamente.",
      );
    }

    const query = new URLSearchParams({
      pagina: "1",
      tamanho_pagina: "50",
    }).toString();

    const response = await fetch(
      `${process.env.NEXT_API_URL}/centro-de-custo?${query}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!response.ok) {
      throw new ExternalAPIError("Falha ao buscar centros de custo.");
    }

    return response.json() as Promise<ContaAzulPaginatedResponse<CentroCusto>>;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw handleError(error);
  }
}

/**
 * Busca as pessoas cadastradas na Conta Azul
 *
 * @returns Lista paginada de pessoas
 */
export async function getPessoa(): Promise<ContaAzulPaginatedResponse<Pessoa>> {
  try {
    const accessToken = await getContaAzulToken();

    if (!accessToken) {
      throw new AuthenticationError(
        "Token da Conta Azul não encontrado. Faça login novamente.",
      );
    }

    const params = new URLSearchParams({
      pagina: "1",
      tamanho_pagina: "1000",
    }).toString();

    const response = await fetch(
      `${process.env.NEXT_API_URL}/pessoa?${params}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!response.ok) {
      throw new ExternalAPIError("Falha ao buscar pessoas.");
    }

    return response.json() as Promise<ContaAzulPaginatedResponse<Pessoa>>;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw handleError(error);
  }
}

/**
 * Busca as categorias da Conta Azul
 *
 * @param tipo - Termo opcional para filtrar categorias por nome
 * @returns Lista paginada de categorias
 */
export async function getCategorias(
  tipo?: string,
): Promise<ContaAzulPaginatedResponse<Categoria>> {
  try {
    const accessToken = await getContaAzulToken();

    if (!accessToken) {
      throw new AuthenticationError(
        "Token da Conta Azul não encontrado. Faça login novamente.",
      );
    }

    const queryParams: Record<string, string> = {
      pagina: "1",
      tamanho_pagina: "100",
      permite_apenas_filhos: "false",
    };

    if (tipo) {
      queryParams.tipo = tipo;
    }

    const query = new URLSearchParams(queryParams).toString();

    const response = await fetch(
      `${process.env.NEXT_API_URL}/categorias?${query}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!response.ok) {
      throw new ExternalAPIError("Falha ao buscar categorias.");
    }

    return response.json() as Promise<ContaAzulPaginatedResponse<Categoria>>;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw handleError(error);
  }
}

/**
 * Busca as despesas (contas a pagar) da Conta Azul
 *
 * @param dataVencimentoDe - Data inicial do período (formato: YYYY-MM-DD)
 * @param dataVencimentoAte - Data final do período (formato: YYYY-MM-DD)
 * @param categorias - IDs das categorias para filtrar (opcional)
 * @param centrosDeCusto - IDs dos centros de custo para filtrar (opcional)
 * @returns Lista paginada de despesas
 */
export async function getDespesas(
  dataVencimentoDe: string,
  dataVencimentoAte: string,
  categorias?: string | (string | number)[],
  centrosDeCusto?: string | (string | number)[],
): Promise<ContaAzulPaginatedResponse<DespesaReceita>> {
  try {
    const accessToken = await getContaAzulToken();

    if (!accessToken) {
      throw new AuthenticationError(
        "Token da Conta Azul não encontrado. Faça login novamente.",
      );
    }

    const queryParams: Record<string, string> = {
      pagina: "1",
      tamanho_pagina: "1000",
      data_vencimento_de: dataVencimentoDe,
      data_vencimento_ate: dataVencimentoAte,
      ids_contas_financeiras: ids_contas_financeiras,
    };

    if (
      categorias &&
      (Array.isArray(categorias) ? categorias.length > 0 : categorias)
    ) {
      queryParams.ids_categorias = Array.isArray(categorias)
        ? categorias.join(",")
        : String(categorias);
    }
    if (
      centrosDeCusto &&
      (Array.isArray(centrosDeCusto)
        ? centrosDeCusto.length > 0
        : centrosDeCusto)
    ) {
      queryParams.ids_centros_de_custo = Array.isArray(centrosDeCusto)
        ? centrosDeCusto.join(",")
        : String(centrosDeCusto);
    }

    const query = new URLSearchParams(queryParams).toString();

    const response = await fetch(
      `${process.env.NEXT_API_URL}/financeiro/eventos-financeiros/contas-a-pagar/buscar?${query}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!response.ok) {
      throw new ExternalAPIError("Falha ao buscar despesas.");
    }

    return response.json() as Promise<
      ContaAzulPaginatedResponse<DespesaReceita>
    >;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw handleError(error);
  }
}

/**
 * Busca as receitas (contas a receber) da Conta Azul
 *
 * @param dataVencimentoDe - Data inicial do período (formato: YYYY-MM-DD)
 * @param dataVencimentoAte - Data final do período (formato: YYYY-MM-DD)
 * @param categorias - IDs das categorias para filtrar (opcional)
 * @param centrosDeCusto - IDs dos centros de custo para filtrar (opcional)
 * @returns Lista paginada de receitas
 */
export async function getReceitas(
  dataVencimentoDe: string,
  dataVencimentoAte: string,
  categorias?: string | (string | number)[],
  centrosDeCusto?: string | (string | number)[],
): Promise<ContaAzulPaginatedResponse<DespesaReceita>> {
  try {
    const accessToken = await getContaAzulToken();

    if (!accessToken) {
      throw new AuthenticationError(
        "Token da Conta Azul não encontrado. Faça login novamente.",
      );
    }

    const queryParams: Record<string, string> = {
      pagina: "1",
      tamanho_pagina: "1000",
      data_vencimento_de: dataVencimentoDe,
      data_vencimento_ate: dataVencimentoAte,
      ids_contas_financeiras: ids_contas_financeiras,
    };

    if (
      categorias &&
      (Array.isArray(categorias) ? categorias.length > 0 : categorias)
    ) {
      queryParams.ids_categorias = Array.isArray(categorias)
        ? categorias.join(",")
        : String(categorias);
    }
    if (
      centrosDeCusto &&
      (Array.isArray(centrosDeCusto)
        ? centrosDeCusto.length > 0
        : centrosDeCusto)
    ) {
      queryParams.ids_centros_de_custo = Array.isArray(centrosDeCusto)
        ? centrosDeCusto.join(",")
        : String(centrosDeCusto);
    }

    const query = new URLSearchParams(queryParams).toString();

    const response = await fetch(
      `${process.env.NEXT_API_URL}/financeiro/eventos-financeiros/contas-a-receber/buscar?${query}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    );

    if (!response.ok) {
      throw new ExternalAPIError("Falha ao buscar receitas.");
    }

    return response.json() as Promise<
      ContaAzulPaginatedResponse<DespesaReceita>
    >;
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw handleError(error);
  }
}

// ==========================================
// FUNÇÕES DE ORÇAMENTO (PRISMA)
// ==========================================

/**
 * Salva ou atualiza um orçamento no banco de dados
 * Utiliza transação para garantir consistência dos dados
 *
 * @param data - Dados do orçamento a ser salvo
 * @throws {ConflictError} Se já existir um orçamento para o ano
 * @throws {DatabaseError} Se houver erro ao salvar
 */
export async function saveBudget(data: BudgetInput): Promise<void> {
  try {
    // Verifica se é atualização ou criação
    if (data.id) {
      // ATUALIZAÇÃO - Verifica se o ano já existe em outro orçamento
      const existingBudget = await prisma.orcamentos.findFirst({
        where: { ano: Number(data.ano) },
      });

      if (existingBudget && existingBudget.id !== data.id) {
        throw new ConflictError(
          `Já existe um orçamento para o ano ${data.ano}.`,
        );
      }

      // Usa transação para garantir consistência
      await prisma.$transaction(async (tx) => {
        // Atualiza o orçamento
        await tx.orcamentos.update({
          where: { id: data.id },
          data: { ano: Number(data.ano) },
        });

        // Atualiza os valores
        for (const categoria of data.categorias) {
          const catCodigo = categoria.nome.split(" ")[0];

          let existingItem = await tx.itensOrcamento.findFirst({
            where: {
              descricao: categoria.nome,
              codigo: catCodigo,
            },
          });

          if (!existingItem) {
            existingItem = await tx.itensOrcamento.create({
              data: {
                descricao: categoria.nome,
                codigo: catCodigo,
                status: true,
              },
            });
          }

          const existingValue = await tx.valoresOrcamento.findFirst({
            where: {
              orcamentoId: data.id,
              itemId: existingItem.id,
            },
          });

          if (existingValue) {
            await tx.valoresOrcamento.update({
              where: { id: existingValue.id },
              data: { valor: Number(categoria.valor) },
            });
          } else {
            await tx.valoresOrcamento.create({
              data: {
                orcamentoId: data.id!,
                itemId: existingItem.id,
                valor: Number(categoria.valor),
              },
            });
          }
        }
      });

      return;
    }

    // CRIAÇÃO - Verifica se já existe orçamento para o ano
    const existingBudget = await prisma.orcamentos.findFirst({
      where: { ano: Number(data.ano) },
    });

    if (existingBudget) {
      throw new ConflictError(`Já existe um orçamento para o ano ${data.ano}.`);
    }

    // Usa transação para garantir consistência
    await prisma.$transaction(async (tx) => {
      const rOrcamento = await tx.orcamentos.create({
        data: { ano: Number(data.ano) },
      });

      for (const categoria of data.categorias) {
        const catCodigo = categoria.nome.split(" ")[0];

        let existingItem = await tx.itensOrcamento.findFirst({
          where: {
            descricao: categoria.nome,
            codigo: catCodigo,
          },
        });

        if (!existingItem) {
          existingItem = await tx.itensOrcamento.create({
            data: {
              descricao: categoria.nome,
              codigo: catCodigo,
              status: true,
            },
          });
        }

        await tx.valoresOrcamento.create({
          data: {
            orcamentoId: rOrcamento.id,
            itemId: existingItem.id,
            valor: Number(categoria.valor),
          },
        });
      }
    });
  } catch (error) {
    if (error instanceof AppError) throw error;
    console.error("[saveBudget] Erro:", error);
    throw new DatabaseError("Erro ao salvar o orçamento. Tente novamente.");
  }
}

/**
 * Busca todos os orçamentos do banco de dados
 *
 * @returns Lista de orçamentos ordenados por ano (decrescente)
 */
export async function getBudget(): Promise<Orcamento[]> {
  try {
    const budgets = await prisma.orcamentos.findMany({
      include: {
        valores: { include: { item: true } },
      },
      orderBy: { ano: "desc" },
    });
    return budgets;
  } catch (error) {
    console.error("[getBudget] Erro:", error);
    throw new DatabaseError("Erro ao buscar orçamentos.");
  }
}

/**
 * Busca um orçamento específico por ano
 *
 * @param year - Ano do orçamento
 * @returns O orçamento encontrado ou null
 */
export async function getBudgetByYear(
  year: number | string,
): Promise<Orcamento | null> {
  try {
    const budget = await prisma.orcamentos.findFirst({
      where: { ano: Number(year) },
      include: {
        valores: { include: { item: true } },
      },
    });
    return budget;
  } catch (error) {
    console.error("[getBudgetByYear] Erro:", error);
    throw new DatabaseError("Erro ao buscar orçamento por ano.");
  }
}

/**
 * Deleta um orçamento e seus valores associados
 * Utiliza transação para garantir consistência
 *
 * @param id - ID do orçamento a ser deletado
 * @throws {DatabaseError} Se houver erro ao deletar
 */
export async function deleteBudget(id: string): Promise<void> {
  try {
    // Usa transação para garantir que ambas operações são executadas
    await prisma.$transaction(async (tx) => {
      // Deleta os valores primeiro (por causa da FK)
      await tx.valoresOrcamento.deleteMany({
        where: { orcamentoId: id },
      });

      // Deleta o orçamento
      await tx.orcamentos.delete({
        where: { id },
      });
    });
  } catch (error) {
    console.error("[deleteBudget] Erro:", error);
    throw new DatabaseError("Erro ao deletar o orçamento. Tente novamente.");
  }
}
