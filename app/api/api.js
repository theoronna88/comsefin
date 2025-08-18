"use server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import redis from "../_lib/redis";

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

  const sessionId = cookies().get("sessionId")?.value;
  if (!sessionId) {
    throw new Error("Session não encontrado nos cookies.");
  }
  const accessToken = await redis.get(`session:${sessionId}`);

  if (!accessToken) {
    throw new Error("Token de acesso não encontrado no Redis.");
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

  const sessionId = cookies().get("sessionId")?.value;
  if (!sessionId) {
    throw new Error("Session não encontrado nos cookies.");
  }
  const accessToken = await redis.get(`session:${sessionId}`);
  if (!accessToken) {
    throw new Error("Token de acesso não encontrado no Redis.");
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

  const sessionId = cookies().get("sessionId")?.value;
  if (!sessionId) {
    throw new Error("Session não encontrado nos cookies.");
  }
  const accessToken = await redis.get(`session:${sessionId}`);

  if (!accessToken) {
    throw new Error("Token de acesso não encontrado no Redis.");
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

  const sessionId = cookies().get("sessionId")?.value;
  if (!sessionId) {
    throw new Error("Session não encontrado nos cookies.");
  }
  const accessToken = await redis.get(`session:${sessionId}`);

  if (!accessToken) {
    console.error("Token de acesso não encontrado no Redis.");
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

  const sessionId = cookies().get("sessionId")?.value;
  if (!sessionId) {
    throw new Error("Session não encontrado nos cookies.");
  }
  const accessToken = await redis.get(`session:${sessionId}`);

  if (!accessToken) {
    console.error("Token de acesso não encontrado no Redis.");
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
