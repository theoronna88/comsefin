"use client";

import { ChartConfig } from "@/components/ui/chart";
import MultiBarChart from "./multibar-chart";

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

interface Categoria {
  id: number;
  nome: string;
  despesas?: [];
  despesasPrev?: [];
  total?: number;
  totalPrev?: number;
  receitas?: [];
  receitasPrev?: [];
  totalReceitas?: number;
  totalReceitasPrev?: number;
}

interface YearVsYearProps {
  centrosDeCusto: Array<{
    id: number;
    codigo: string;
    nome: string;
    categorias?: Categoria[];
  }>;
  searching: boolean;
  year: string;
}

const YearVsYear = ({ centrosDeCusto, searching, year }: YearVsYearProps) => {
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
        centro: centro.nome,
        atual: totalReceitasAtual ?? 0,
        anterior: totalReceitasAnterior ?? 0,
      };
    })
    .filter((item) => item.atual !== 0 && item.anterior !== 0);

  // console.log("chartDataAtual: ", chartDataAtual);
  // console.log("centrosDeCusto: ", centrosDeCusto);

  return (
    <div className="*:data-[slot=card]:shadow-xs @xl/main:grid-cols-3 @5xl/main:grid-cols-4 grid grid-cols-2 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card lg:px-6">
      <MultiBarChart
        chartData={chartReceitaData}
        chartConfig={chartConfig}
        year={year}
        prevYear={Number(year) - 1}
        searching={searching}
        title={
          year !== ""
            ? `Receitas ${year} x ${Number(year) - 1}`
            : "Receitas Ano x Ano"
        }
      />

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
      />
    </div>
  );
};

export default YearVsYear;
