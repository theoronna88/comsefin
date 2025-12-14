import { TotalPieExercicio } from "@/app/_components/total-pie";
import YearVsYear from "@/app/_components/graphs/year-vs-year";
import { ChartAreaInteractive } from "@/app/_components/graphs/chart-area-interactive";
import type {
  DespesaReceita,
  CentroCustoComCategorias,
} from "@/app/_lib/types";

interface ReceitasContainerProps {
  centrosDeCusto: CentroCustoComCategorias[];
  searching: boolean;
  year: string;
  receitas12months: DespesaReceita[];
}

const ReceitasContainer = ({
  centrosDeCusto,
  searching,
  year,
  receitas12months,
}: ReceitasContainerProps) => {
  return (
    <>
      <TotalPieExercicio
        centrosDeCusto={centrosDeCusto}
        searching={searching}
        year={year}
        title="Total de Receita Exercício"
      />

      <YearVsYear
        centrosDeCusto={centrosDeCusto}
        searching={searching}
        year={year}
        title="Receitas"
      />
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive values={receitas12months} title="Receitas" />
      </div>
      {/*<DataTable data={data} />*/}
    </>
  );
};

export default ReceitasContainer;
