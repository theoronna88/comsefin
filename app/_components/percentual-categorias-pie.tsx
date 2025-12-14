import PieChartCard from "./graphs/pie-chart";

export function PercentualCategoriasPie({
  categorias,
  searching,
  year,
  title,
}) {
  const colors = [
    "#2563eb", // azul
    "#10b981", // verde
    "#f59e42", // laranja
    "#ef4444", // vermelho
    "#a21caf", // roxo
    "#eab308", // amarelo
    "#14b8a6", // teal
    "#6366f1", // indigo
  ];

  const chartConfig = categorias.reduce((acc, categoria, idx) => {
    const value = Number(categoria.totalReceitas ?? 0);
    if (value >= 0) {
      acc[categoria.categoriaNome] = {
        label: categoria.categoriaNome,
        color: colors[idx % colors.length],
        value: categoria.totais.pago.valor,
      };
    }
    return acc;
  }, {} as Record<string, { label: string; color: string; value: number }>);

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
