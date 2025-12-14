import { getReceitas } from "../api/receitas";

interface FetchingReceitasComFiltrosParams {
  selectedReceitasCategories: Array<{ id: string; nome: string }>;
  inicioStr: string;
  terminoStr: string;
  inicioStrPrev: string;
  terminoStrPrev: string;
}

export const fetchingReceitasComFiltros = async ({
  selectedReceitasCategories,
  inicioStr,
  terminoStr,
  inicioStrPrev,
  terminoStrPrev,
}: FetchingReceitasComFiltrosParams) => {
  const t = selectedReceitasCategories?.map(async (categoria) => {
    const receitasPorCategoria = await getReceitas(
      inicioStr,
      terminoStr,
      categoria.id
    );

    const receitasAnterioresPorCategoria = await getReceitas(
      inicioStrPrev,
      terminoStrPrev,
      categoria.id
    );

    return {
      categoriaId: categoria.id,
      categoriaNome: categoria.nome,
      // itens: receitasPorCategoria.itens || [],
      // itens_totais: receitasPorCategoria.itens_totais || 0,
      totais: receitasPorCategoria.totais || {},
      totaisAnterior: receitasAnterioresPorCategoria.totais || {},
    };
  });

  return Promise.all(t);
};
