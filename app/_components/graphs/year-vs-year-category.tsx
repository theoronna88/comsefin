"use client";

import { ChartConfig } from "@/app/_components/ui/chart";
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

const YearVsYearCategory = ({
  totaisReceita,
  todasCategorias,
  categorias,
  searching,
  year,
  title,
}) => {
  const chartReceitaData = totaisReceita.map((categoriaTotal) => {
    return {
      categoria: categoriaTotal.categoriaNome,
      atual: categoriaTotal.totais.pago.valor,
      anterior: categoriaTotal.totaisAnterior.pago.valor
        ? categoriaTotal.totaisAnterior.pago.valor
        : 0,
    };
  });

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
    </div>
  );
};

export default YearVsYearCategory;
