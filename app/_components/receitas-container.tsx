import { TotalPieExercicio } from "@/app/_components/total-pie";
import YearVsYear from "@/app/_components/graphs/year-vs-year";
import { ChartAreaInteractive } from "@/app/_components/graphs/chart-area-interactive";

interface ReceitasContainerProps {
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
  receitas12months: Array<{
    id: number;
    total: number;
    descricao: string;
    status_traduzido: string;
    nao_pago: number;
    pago: number;
    data_vencimento: string;
  }>;
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
