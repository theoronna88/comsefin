import { useEffect, useState } from "react";
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
}: DespesasContainerProps) => {
  const [sortedCentros, setSortedCentros] = useState<Array<{
    id: number;
    codigo: string;
    nome: string;
    categorias?: Categoria[];
  }>>([]);

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

  useEffect(() => {
    const filteredCentros = centrosDeCusto.filter(
      (centro) => Number(centro.codigo) > 5
    );
    setSortedCentros(
      filteredCentros.sort((a, b) => Number(a.codigo) - Number(b.codigo))
    );
  }, [centrosDeCusto, sortedCentros]);

  const dataCentroCusto = function (sortedCentros: Array<{
    id: number;
    codigo: string;
    nome: string;
    categorias?: Categoria[];
  }>) {
    const temp = [];
    /*
    const filteredCentros = centrosDeCusto.filter(
      (centro) => Number(centro.codigo) > 5
    );
    const sortedCentros = filteredCentros.sort(
      (a, b) => Number(a.codigo) - Number(b.codigo)
    ); */
    for (const centro of sortedCentros) {
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

  const dataProjetosInstitucionais = function () {
    const temp = [];

    const centro = centrosDeCusto.find((c) => c.codigo === "6");
    if (centro && centro.categorias) {
      for (const cat of centro.categorias) {
        if (cat.nome.startsWith("6.1.1 ") || cat.nome.startsWith("6.1.2 ")) {
          temp.push({
            categoria: cat.nome,
            orcamento: cat.orcamentoAtual || 0,
            despesa: cat.total || 0,
          });
        }
      }
    }

    return temp;
  };

  const dataEventosInstitucionais = function () {
    const temp = [];
    const centro = centrosDeCusto.find((c) => c.codigo === "6");
    if (centro && centro.categorias) {
      for (const cat of centro.categorias) {
        if (cat.nome.startsWith("6.2.")) {
          temp.push({
            categoria: cat.nome,
            orcamento: cat.orcamentoAtual || 0,
            despesa: cat.total || 0,
          });
        }
      }
    }
    return temp;
  };

  const dataReunioesOrdinarias = function () {
    const temp = [];
    const centro = centrosDeCusto.find((c) => c.codigo === "6");
    if (centro && centro.categorias) {
      for (const cat of centro.categorias) {
        if (cat.nome.startsWith("6.3.1.")) {
          temp.push({
            categoria: cat.nome,
            orcamento: cat.orcamentoAtual || 0,
            despesa: cat.total || 0,
          });
        }
      }
    }
    return temp;
  };

  const dataReunioesExtraordinarias = function () {
    const temp = [];
    const centro = centrosDeCusto.find((c) => c.codigo === "6");
    if (centro && centro.categorias) {
      for (const cat of centro.categorias) {
        if (cat.nome.startsWith("6.3.2.")) {
          temp.push({
            categoria: cat.nome,
            orcamento: cat.orcamentoAtual || 0,
            despesa: cat.total || 0,
          });
        }
      }
    }
    return temp;
  };

  const dataReunioesAdministrativas = function () {
    const temp = [];
    const centro = centrosDeCusto.find((c) => c.codigo === "6");
    if (centro && centro.categorias) {
      for (const cat of centro.categorias) {
        if (cat.nome.startsWith("6.3.3.")) {
          temp.push({
            categoria: cat.nome,
            orcamento: cat.orcamentoAtual || 0,
            despesa: cat.total || 0,
          });
        }
      }
    }
    return temp;
  };

  const dataPresidencia = function () {
    const temp = [];
    const centro = centrosDeCusto.find((c) => c.codigo === "7");
    if (centro && centro.categorias) {
      for (const cat of centro.categorias) {
        if (cat.nome.startsWith("7.")) {
          temp.push({
            categoria: cat.nome,
            orcamento: cat.orcamentoAtual || 0,
            despesa: cat.total || 0,
          });
        }
      }
    }
    return temp;
  };

  const dataServicosPJ = function () {
    const temp = [];
    const centro = centrosDeCusto.find((c) => c.codigo === "8");
    if (centro && centro.categorias) {
      for (const cat of centro.categorias) {
        if (cat.nome.startsWith("8.")) {
          temp.push({
            categoria: cat.nome,
            orcamento: cat.orcamentoAtual || 0,
            despesa: cat.total || 0,
          });
        }
      }
    }
    return temp;
  };

  const dataPessoal = function () {
    const temp = [];
    const centro = centrosDeCusto.find((c) => c.codigo === "9");
    if (centro && centro.categorias) {
      for (const cat of centro.categorias) {
        if (cat.nome.startsWith("9.")) {
          temp.push({
            categoria: cat.nome,
            orcamento: cat.orcamentoAtual || 0,
            despesa: cat.total || 0,
          });
        }
      }
    }
    return temp;
  };

  const dataOperacional = function () {
    const temp = [];
    const centro = centrosDeCusto.find((c) => c.codigo === "10");
    if (centro && centro.categorias) {
      for (const cat of centro.categorias) {
        if (cat.nome.startsWith("10.")) {
          temp.push({
            categoria: cat.nome,
            orcamento: cat.orcamentoAtual || 0,
            despesa: cat.total || 0,
          });
        }
      }
    }
    return temp;
  };

  const dataTributarias = function () {
    const temp = [];
    const centro = centrosDeCusto.find((c) => c.codigo === "11");
    if (centro && centro.categorias) {
      for (const cat of centro.categorias) {
        if (cat.nome.startsWith("11.")) {
          temp.push({
            categoria: cat.nome,
            orcamento: cat.orcamentoAtual || 0,
            despesa: cat.total || 0,
          });
        }
      }
    }
    return temp;
  };

  const dataInvestimentos = function () {
    const temp = [];
    const centro = centrosDeCusto.find((c) => c.codigo === "12");
    if (centro && centro.categorias) {
      for (const cat of centro.categorias) {
        if (cat.nome.startsWith("12.")) {
          temp.push({
            categoria: cat.nome,
            orcamento: cat.orcamentoAtual || 0,
            despesa: cat.total || 0,
          });
        }
      }
    }
    return temp;
  };

  return (
    <div className="w-3/4 mx-auto flex gap-4 flex-col">
      {/* Gráfico de barras para despesas por centro de custo  */}
      <ChartMultibar
        title={`Total de Despesas do Exercício ${year}`}
        chartConfig={chartConfig}
        data={dataCentroCusto(sortedCentros)}
      />

      {/* Gráfico de barras segmentado por categoria inicial 6.1 */}
      <ChartMultibar
        title={`Despesas por Categoria Projetos Institucionais - Exercício ${year}`}
        chartConfig={chartConfig}
        data={dataProjetosInstitucionais()}
      />

      {/* Gráfico de barras segmentado por categoria inicial 6.2 */}
      <ChartMultibar
        title={`Despesas por Categoria Eventos Institucionais - Exercício ${year}`}
        chartConfig={chartConfig}
        data={dataEventosInstitucionais()}
      />

      {/* Gráfico de barras segmentado por categoria inicial 6.3.1 */}
      <ChartMultibar
        title={`Despesas por Categoria Reuniões Ordinárias - Exercício ${year}`}
        chartConfig={chartConfig}
        data={dataReunioesOrdinarias()}
      />

      {/* Gráfico de barras segmentado por categoria inicial 6.3.2 */}
      <ChartMultibar
        title={`Despesas por Categoria Reuniões Extraordinárias - Exercício ${year}`}
        chartConfig={chartConfig}
        data={dataReunioesExtraordinarias()}
      />

      {/* Gráfico de barras segmentado por categoria inicial 6.3.3 */}
      <ChartMultibar
        title={`Despesas por Categoria Reuniões Administrativas - Exercício ${year}`}
        chartConfig={chartConfig}
        data={dataReunioesAdministrativas()}
      />

      {/* Gráfico de barras segmentado por categoria inicial 7 */}
      <ChartMultibar
        title={`Despesas por Categoria Presidência - Exercício ${year}`}
        chartConfig={chartConfig}
        data={dataPresidencia()}
      />

      {/* Gráfico de barras segmentado por categoria inicial 8 */}
      <ChartMultibar
        title={`Despesas por Categoria Serviços PJ - Exercício ${year}`}
        chartConfig={chartConfig}
        data={dataServicosPJ()}
      />

      {/* Gráfico de barras segmentado por categoria inicial 9 */}
      <ChartMultibar
        title={`Despesas por Categoria Pessoal - Exercício ${year}`}
        chartConfig={chartConfig}
        data={dataPessoal()}
      />

      {/* Gráfico de barras segmentado por categoria inicial 10 */}
      <ChartMultibar
        title={`Despesas por Categoria Operacional - Exercício ${year}`}
        chartConfig={chartConfig}
        data={dataOperacional()}
      />

      {/* Gráfico de barras segmentado por categoria inicial 11 */}
      <ChartMultibar
        title={`Despesas por Categoria Tributárias - Exercício ${year}`}
        chartConfig={chartConfig}
        data={dataTributarias()}
      />

      {/* Gráfico de barras segmentado por categoria inicial 12 */}
      <ChartMultibar
        title={`Despesas por Categoria Investimentos - Exercício ${year}`}
        chartConfig={chartConfig}
        data={dataInvestimentos()}
      />
    </div>
  );
};

export default DespesasContainer;
