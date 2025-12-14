import PieChartCard from "./graphs/pie-chart";

interface TotalPieExercicioProps {
  centrosDeCusto: Array<{
    id: number;
    codigo: string;
    nome: string;
    categorias?: Array<{
      id: number;
      nome: string;
      total?: number;
      totalPrev?: number;
      totalReceitas?: number;
      totalReceitasPrev?: number;
    }>;
  }>;
  searching: boolean;
  year: string;
  title?: string;
}

export function TotalPieExercicio({
  centrosDeCusto,
  searching,
  year,
  title,
}: TotalPieExercicioProps) {
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

  const chartConfig = centrosDeCusto.reduce((acc, centro, idx) => {
    const value = Number(
      centro.categorias?.reduce(
        (sum, cat) => sum + (cat.totalReceitas ?? 0),
        0
      ) ?? 0
    );
    if (value >= 0) {
      acc[centro.nome] = {
        label: centro.nome,
        color: colors[idx % colors.length],
        value,
      };
    }
    return acc;
  }, {} as Record<string, { label: string; color: string; value: number }>);

  // console.log("Sections - chartConfig: ", chartConfig);
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
      {/*
 <div className="*:data-[slot=card]:shadow-xs @xl/main:grid-cols-3 @5xl/main:grid-cols-4 grid grid-cols-2 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card lg:px-6">
      <PieChartCard
        searching={searching}
        chartConfig={chartConfig}
        title={`${title} ${year}`}
      />
    </div> */}
    </>
  );
}
