import PieChartCard from "./graphs/pie-chart";

interface CategoriaComTotais {
  categoriaNome: string;
  totalReceitas?: number;
  totais: {
    pago: {
      valor: number;
    };
  };
}

interface PercentualCategoriasPieProps {
  categorias: CategoriaComTotais[];
  searching: boolean;
  year: string;
  title: string;
}

export function PercentualCategoriasPie({
  categorias,
  searching,
  year,
  title,
}: PercentualCategoriasPieProps) {
  function getCategoriaColor(categoriaNome: string, year: string) {
    if (
      categoriaNome.includes("Contribuição") &&
      categoriaNome.includes(year)
    ) {
      return "#3792b3";
    }

    const anoCategoria = categoriaNome.match(/\d+/)?.[0];
    if (anoCategoria && Number(anoCategoria) < Number(year)) {
      return "#134053"; // roxo para anos anteriores
    }

    if (
      categoriaNome.includes("Aplicação") ||
      categoriaNome.includes("Investimento") ||
      categoriaNome.includes("Rendimento") ||
      categoriaNome.includes("Aplicações") ||
      categoriaNome.includes("Rendimentos")
    ) {
      return "#256a67";
    }
    return "#c8ccb4"; // cinza para "Outros"
  }

  const chartConfig = categorias.reduce(
    (acc, categoria) => {
      const value = Number(categoria.totalReceitas ?? 0);
      if (value >= 0) {
        acc[categoria.categoriaNome] = {
          label: categoria.categoriaNome,
          color: getCategoriaColor(categoria.categoriaNome, year),
          value: categoria.totais.pago.valor,
        };
      }
      return acc;
    },
    {} as Record<string, { label: string; color: string; value: number }>,
  );

  return (
    <>
      {" "}
      <div className="">
        <PieChartCard
          searching={searching}
          chartConfig={chartConfig}
          title={`${title} ${year}`}
        />
      </div>
    </>
  );
}
