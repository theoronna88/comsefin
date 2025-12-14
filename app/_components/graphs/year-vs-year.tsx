"use client";

import { ChartConfig } from "@/app/_components/ui/chart";
import MultiBarChart from "./multibar-chart";
import type { CentroCustoComCategorias } from "@/app/_lib/types";

const chartConfig = {
  atual: {
    label: "Atual",
    color: "#2563eb",
  },
  anterior: {
    label: "Anterior",
    color: "#60a5fa",
  },
} satisfies ChartConfig;

interface YearVsYearProps {
  centrosDeCusto: CentroCustoComCategorias[];
  searching: boolean;
  year: string;
  title?: string;
}

const YearVsYear = ({
  centrosDeCusto,
  searching,
  year,
  title,
}: YearVsYearProps) => {
  // console.log("YearVsYear - centrosDeCusto: ", centrosDeCusto);
  /*
  const chartDataAtual = centrosDeCusto
    .map((centro) => {
      const totalAtual = centro.categorias?.reduce((soma, categoria) => {
        return soma + (categoria.total ?? 0);
      }, 0);
      

      const totalAnterior = centro.categorias?.reduce((soma, categoria) => {
        return soma + (categoria.totalPrev ?? 0);
      }, 0);

      return {
        centro: centro.nome,
        atual: totalAtual ?? 0,
        anterior: totalAnterior ?? 0,
      };
    })
    .filter((item) => item.atual !== 0 && item.anterior !== 0);
    */

  const chartReceitaData = centrosDeCusto
    .filter((centro) => {
      const codigoNum = Number(centro.codigo);
      return codigoNum >= 1 && codigoNum <= 4;
    })
    .map((centro) => {
      const totalReceitasAtual = centro.categorias?.reduce(
        (soma, categoria) => {
          return soma + (categoria.totalReceitas ?? 0);
        },
        0
      );
      const totalReceitasAnterior = centro.categorias?.reduce(
        (soma, categoria) => {
          return soma + (categoria.totalReceitasPrev ?? 0);
        },
        0
      );
      return {
        categoria: centro.nome,
        atual: totalReceitasAtual ?? 0,
        anterior: totalReceitasAnterior ?? 0,
      };
    })
    .filter((item) => item.atual !== 0 && item.anterior !== 0);

  // console.log("chartDataAtual: ", chartDataAtual);
  // console.log("centrosDeCusto: ", centrosDeCusto);

  return (
    <div className="w-3/4 mx-auto">
      <MultiBarChart
        chartData={chartReceitaData}
        chartConfig={chartConfig}
        year={year}
        prevYear={Number(year) - 1}
        searching={searching}
        title={
          year !== ""
            ? `${title} ${year} x ${Number(year) - 1}`
            : `${title} Ano x Ano`
        }
      />
      {/*}
      <MultiBarChart
        chartData={chartDataAtual}
        chartConfig={chartConfig}
        year={year}
        prevYear={Number(year) - 1}
        searching={searching}
        title={
          year !== ""
            ? `Despesas ${year} x ${Number(year) - 1}`
            : "Despesas Ano x Ano"
        }
      /> */}
    </div>
  );
};

export default YearVsYear;
