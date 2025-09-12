import ChartMultibar from "./graphs/chart-multibar";
import { ChartConfig } from "./ui/chart";

const DespesasContainer = ({
  centrosDeCusto,
  year,
  despesas12months,
  searching,
}) => {
  // Debug mostrar os dados recebidos
  console.log("Lista de centros de custo:", centrosDeCusto);
  // console.log("Despesas 12 meses:", despesas12months);

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
    for (let centro of centrosDeCusto) {
      let totalOrcamento = 0;
      let totalDespesa = 0;

      for (let cat of centro.categorias) {
        totalOrcamento += cat.orcamentoAtual;
        totalDespesa += cat.total;
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
