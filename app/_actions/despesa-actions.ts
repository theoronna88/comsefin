import { getDespesas } from "../api/despesas";

interface FetchingDespesasComFiltrosParams {
  selectedDespesasCategories: Array<{ id: string; nome: string }>;
  inicioStr: string;
  terminoStr: string;
  inicioStrPrev: string;
  terminoStrPrev: string;
}

export const fetchingDespesasComFiltros = async ({
  selectedDespesasCategories,
  inicioStr,
  terminoStr,
  inicioStrPrev,
  terminoStrPrev,
}: FetchingDespesasComFiltrosParams) => {
  const t = selectedDespesasCategories?.map(async (categoria) => {
    const despesasPorCategoria = await getDespesas(
      inicioStr,
      terminoStr,
      categoria.id
    );

    const despesasAnterioresPorCategoria = await getDespesas(
      inicioStrPrev,
      terminoStrPrev,
      categoria.id
    );

    return {
      categoriaId: categoria.id,
      categoriaNome: categoria.nome,
      // itens: despesasPorCategoria.itens || [],
      // itens_totais: despesasPorCategoria.itens_totais || 0,
      totais: despesasPorCategoria.totais || {},
      totaisAnterior: despesasAnterioresPorCategoria.totais || {},
    };
  });

  return Promise.all(t);
};
