"use server";
import { redirect } from "next/navigation";

export async function getContaFinanceira({ nome, accessToken }) {
  const queryParams = {
    pagina: "1",
    tamanho_pagina: "1",
    nome: nome,
  };
  const query = new URLSearchParams(queryParams).toString();

  // const accessToken = await getContaAzulToken();

  if (!accessToken) {
    console.error("Token de acesso não encontrado na sessão.");
    redirect("/");
  }

  const response = await fetch(
    `${process.env.NEXT_API_URL}/conta-financeira?${query}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  const data = await response.json();

  return data.itens[0].id;
}
