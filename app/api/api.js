"use server";
import { redirect } from "next/navigation";
import { prisma } from "../_lib/prisma";

export async function getApiUrl() {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.NEXT_CLIENT_ID || "",
    redirect_uri: process.env.NEXT_REDIRECT_URI || "",
    scope: "openid profile aws.cognito.signin.user.admin",
    state: crypto.randomUUID(),
  });
  return redirect(`${process.env.NEXT_AUTH_URL}?${params.toString()}`);
}

export async function getToken(authorizationCode) {
  const basicAuth = Buffer.from(
    `${process.env.NEXT_CLIENT_ID}:${process.env.NEXT_CLIENT_SECRET}`
  ).toString("base64");

  const params = new URLSearchParams({
    client_id: process.env.NEXT_CLIENT_ID || "",
    client_secret: process.env.NEXT_CLIENT_SECRET || "",
    grant_type: "authorization_code",
    code: authorizationCode,
    redirect_uri: process.env.NEXT_REDIRECT_URI || "",
  });

  const response = await fetch(process.env.NEXT_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: params.toString(),
  });

  const resultText = await response.text();

  if (!response.ok) {
    throw new Error(
      `Token request failed: ${response.status} - ${response.statusText}`
    );
  }

  return JSON.parse(resultText);
}

export async function getCentroCusto() {
  const query = new URLSearchParams({
    pagina: "1",
    tamanho_pagina: "50",
  }).toString();

  const accessToken = cookies().get("tokenContaAzul")?.value;

  if (!accessToken) {
    throw new Error("Token de acesso não encontrado nos cookies.");
  }

  const response = await fetch(
    `${process.env.NEXT_API_URL}/centro-de-custo?${query}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const data = await response.json();

  return data;
}

export async function getPessoa() {
  const params = new URLSearchParams({
    pagina: "1",
    tamanho_pagina: "1000",
  }).toString();

  const accessToken = cookies().get("tokenContaAzul")?.value;
  if (!accessToken) {
    throw new Error("Token de acesso não encontrado nos cookies.");
  }
  const response = await fetch(`${process.env.NEXT_API_URL}/pessoa?${params}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
  const data = await response.json();
  return data;
}

export async function getCategorias(busca) {
  let query = null;
  if (busca) {
    query = new URLSearchParams({
      pagina: "1",
      tamanho_pagina: "50",
      permite_apenas_filhos: "false",
      nome: busca,
    }).toString();
  } else {
    query = new URLSearchParams({
      pagina: "1",
      tamanho_pagina: "50",
      permite_apenas_filhos: "false",
    }).toString();
  }

  const accessToken = cookies().get("tokenContaAzul")?.value;

  if (!accessToken) {
    throw new Error("Token de acesso não encontrado nos cookies.");
  }

  const response = await fetch(
    `${process.env.NEXT_API_URL}/categorias?${query}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const data = await response.json();

  return data;
}

export async function getDespesas(
  dataVencimentoDe,
  dataVencimentoAte,
  categorias,
  centrosDeCusto
) {
  const queryParams = {
    pagina: "1",
    tamanho_pagina: "1000",
    data_vencimento_de: dataVencimentoDe,
    data_vencimento_ate: dataVencimentoAte,
  };

  if (categorias && categorias.length > 0) {
    queryParams.ids_categorias = categorias;
  }
  if (centrosDeCusto && centrosDeCusto.length > 0) {
    queryParams.ids_centros_de_custo = centrosDeCusto;
  }

  const query = new URLSearchParams(queryParams).toString();

  const accessToken = cookies().get("tokenContaAzul")?.value;

  if (!accessToken) {
    console.error("Token de acesso não encontrado nos cookies.");
    redirect({ url: process.env.NEXT_REDIRECT_URI || "http://localhost:3000" });
  }

  const response = await fetch(
    `${process.env.NEXT_API_URL}/financeiro/eventos-financeiros/contas-a-pagar/buscar?${query}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const data = await response.json();

  return data;
}

export async function getReceitas(
  dataVencimentoDe,
  dataVencimentoAte,
  categorias,
  centrosDeCusto
) {
  const queryParams = {
    pagina: "1",
    tamanho_pagina: "1000",
    data_vencimento_de: dataVencimentoDe,
    data_vencimento_ate: dataVencimentoAte,
  };
  if (categorias && categorias.length > 0) {
    queryParams.ids_categorias = categorias;
  }
  if (centrosDeCusto && centrosDeCusto.length > 0) {
    queryParams.ids_centros_de_custo = centrosDeCusto;
  }
  const query = new URLSearchParams(queryParams).toString();

  const accessToken = cookies().get("tokenContaAzul")?.value;

  if (!accessToken) {
    console.error("Token de acesso não encontrado nos cookies.");
    redirect({ url: process.env.NEXT_REDIRECT_URI || "http://localhost:3000" });
  }

  const response = await fetch(
    `${process.env.NEXT_API_URL}/financeiro/eventos-financeiros/contas-a-receber/buscar?${query}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const data = await response.json();

  return data;
}

export async function saveBudget(data) {
  console.log("Dados recebidos no servidor:", data);
  //Verifica se é atualização ou criação
  if (data.id) {
    try {
      //O ano só pode ser atualizado se não existir outro orçamento com o mesmo ano
      const existingBudget = await prisma.orcamentos.findFirst({
        where: { ano: Number(data.ano) },
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
        const catCodigo = categoria.nome.split(" ")[0];
        const existingItem = await prisma.itensOrcamento.findFirst({
          where: {
            descricao: categoria.nome,
            codigo: catCodigo,
          },
        });
        let item = null;
        if (!existingItem) {
          item = await prisma.itensOrcamento.create({
            data: {
              descricao: categoria.nome,
              codigo: catCodigo,
              status: true,
            },
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

  const existingBudget = await prisma.orcamentos.findUnique({
    where: {
      ano: Number(data.ano),
    },
  });
  if (existingBudget) {
    throw new Error("Orçamento para este ano já existe.");
    return "Orçamento para este ano já existe.";
  }

  //Cria um novo orçamento para o ano selecionado
  const rOrcamento = await prisma.orcamentos.create({
    data: {
      ano: Number(data.ano),
    },
  });

  //Verifica se os itens do orçamento já existem e cria novos itens
  for (const categoria of data.categorias) {
    const catCodigo = categoria.nome.split(" ")[0];
    const existingItem = await prisma.itensOrcamento.findFirst({
      where: {
        descricao: categoria.nome,
        codigo: catCodigo,
      },
    });

    let item = null;
    if (!existingItem) {
      item = await prisma.itensOrcamento.create({
        data: {
          descricao: categoria.nome,
          codigo: catCodigo,
          status: true,
        },
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
  const budgets = await prisma.orcamentos.findMany({
    include: {
      valores: { include: { item: true } },
    },
    orderBy: { ano: "desc" },
  });
  return budgets;
}

export async function getBudgetByYear(year) {
  console.log("getBudgetByYear - year:", year);
  const budget = await prisma.orcamentos.findFirst({
    where: { ano: Number(year) },
    include: {
      valores: { include: { item: true } },
    },
  });
  console.log("getBudgetByYear - return: ", budget);
  return budget;
}

export async function deleteBudget(id) {
  try {
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
