import ChartMultibar from "./graphs/chart-multibar";
import { ChartConfig } from "./ui/chart";

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
  orcamentoAtual?: number;
}

interface DespesasContainerProps {
  centrosDeCusto: Array<{
    id: number;
    codigo: string;
    nome: string;
    categorias?: Categoria[];
  }>;
  year: string;
  despesas12months: Array<{
    date: string;
    totalDespesa: number;
  }>;
  searching: boolean;
}

const DespesasContainer = ({
  centrosDeCusto,
  year,
  despesas12months,
  searching,
}: DespesasContainerProps) => {
  // Debug mostrar os dados recebidos
  console.log("Lista de centros de custo:", centrosDeCusto);
  // console.log("Despesas 12 meses:", despesas12months);
  console.log("Dados de despesas:", despesas12months);
  console.log("searching:", searching);

  const chartConfig = {
    despesa: {
      label: "Despesa",
      color: "#2563eb",
    },
    orcamento: {
      label: "Orçado",
      color: "#60a5fa",
    },
  } satisfies ChartConfig;

  const dataCentroCusto = function () {
    const temp = [];
    for (const centro of centrosDeCusto) {
      let totalOrcamento = 0;
      let totalDespesa = 0;

      if (!centro.categorias) continue;
      for (const cat of centro.categorias) {
        totalOrcamento += cat.orcamentoAtual || 0;
        totalDespesa += cat.total || 0;
      }

      temp.push({
        centro: centro.nome,
        orcamento: totalOrcamento,
        despesa: totalDespesa,
      });
    }
    return temp;
  };

  /*

  const data = function () {
    const temp = [];
    for (let centro of centrosDeCusto) {
      for (let cat of centro.categorias) {
        temp.push({
          centro: centro.nome,
          categoria: cat.nome,
          orcamento: cat.orcamentoAtual,
          despesa: cat.total,
        });
      }
    }
    return temp;
  };

  */

  return (
    <div className="w-3/4 mx-auto">
      {/* Gráfico de barras para despesas por centro de custo  */}
      <ChartMultibar
        title={`Total de Despesas do Exercício ${year}`}
        chartConfig={chartConfig}
        data={dataCentroCusto()}
      />
    </div>
  );
};

export default DespesasContainer;
