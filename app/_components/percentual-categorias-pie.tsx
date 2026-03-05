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

    if (
      categoriaNome.includes("Ressarcimentos") ||
      categoriaNome.includes("Ressarcimento") ||
      categoriaNome.includes("Devolução") ||
      categoriaNome.includes("Devoluções")
    ) {
      return "#e67e22"; // laranja para ressarcimentos
    }

    if (categoriaNome.includes("Máster")) {
      return "#7b2d8e"; // roxo para máster
    }

    if (
      categoriaNome.includes("Descontos") ||
      categoriaNome.includes("Desconto")
    ) {
      return "#1abc9c"; // turquesa para descontos
    }

    if (categoriaNome.includes("Juros") || categoriaNome.includes("Juro")) {
      return "#e74c3c"; // vermelho para juros
    }

    if (categoriaNome.includes("Fretes") || categoriaNome.includes("Frete")) {
      return "#d4a017"; // cinza para fretes
    }

    if (
      categoriaNome.includes("Integralização") ||
      categoriaNome.includes("Integralizações")
    ) {
      return "#1a1a1a"; // preto para integralizações
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
