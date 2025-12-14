"use server";
import { redirect } from "next/navigation";
import { getContaAzulToken } from "@/app/_lib/conta-azul-auth";

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

  console.log("Token response:", resultText);

  return JSON.parse(resultText);
}

export async function getCentroCusto() {
  const query = new URLSearchParams({
    pagina: "1",
    tamanho_pagina: "50",
  }).toString();

  const accessToken = await getContaAzulToken();

  if (!accessToken) {
    redirect("/");
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

  const accessToken = await getContaAzulToken();
  if (!accessToken) {
    redirect("/");
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

export async function getCategorias(tipo) {
  let query = null;
  const busca = null;
  if (tipo === null || tipo === undefined) {
    query = new URLSearchParams({
      pagina: "1",
      tamanho_pagina: "100",
      permite_apenas_filhos: "false",
      campo_ordenado_ascendente: "NOME",
    }).toString();
  } else {
    if (busca) {
      query = new URLSearchParams({
        pagina: "1",
        tamanho_pagina: "50",
        permite_apenas_filhos: "false",
        nome: busca,
        tipo,
      }).toString();
    } else {
      query = new URLSearchParams({
        pagina: "1",
        tamanho_pagina: "50",
        permite_apenas_filhos: "false",
        tipo,
      }).toString();
    }
  }

  const accessToken = await getContaAzulToken();

  if (!accessToken) {
    redirect("/");
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
