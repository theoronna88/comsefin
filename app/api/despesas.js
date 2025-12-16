"use server";
import { redirect } from "next/navigation";
import { getContaAzulToken } from "@/app/_lib/conta-azul-auth";

export async function getDespesas(
  dataVencimentoDe,
  dataVencimentoAte,
  categorias,
  centrosDeCusto
) {
  const queryParams = {
    pagina: "1",
    tamanho_pagina: "5000",
    data_vencimento_de: dataVencimentoDe,
    data_vencimento_ate: dataVencimentoAte,
    status: "ACQUITTED",
  };

  // console.log("getDespesas - categorias:", categorias);
  // console.log("getDespesas - centrosDeCusto:", centrosDeCusto);

  if (categorias && categorias.length > 0) {
    queryParams.ids_categorias = categorias;
  }
  if (centrosDeCusto && centrosDeCusto.length > 0) {
    queryParams.ids_centros_de_custo = centrosDeCusto;
  }

  const query = new URLSearchParams(queryParams).toString();

  const accessToken = await getContaAzulToken();

  if (!accessToken) {
    console.error("Token de acesso não encontrado na sessão.");
    redirect("/");
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

  // console.log("getDespesas - data:", data);

  return data;
}
