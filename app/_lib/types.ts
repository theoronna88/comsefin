export interface Categoria {
  id: string;
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

export interface CentroCusto {
  id: string;
  codigo: string;
  nome: string;
  categorias?: Categoria[];
}

export interface Despesa {
  id: string;
  total: number;
  status_traduzido: string;
}

// Tipos de Grupos de Despesas para organização
export interface GrupoDespesa {
  id: string;
  nome: string;
  cor: string;
  categorias: Categoria[];
}

export interface CategoriaAgrupada extends Categoria {
  grupoId: string | null;
}

// Grupos padrão de despesas baseados no PDF
export const GRUPOS_DESPESAS_PADRAO: Omit<GrupoDespesa, "categorias">[] = [
  { id: "despesas-fixas", nome: "Despesas Fixas", cor: "#3b82f6" },
  { id: "despesas-variaveis", nome: "Despesas Variáveis", cor: "#22c55e" },
  { id: "investimentos", nome: "Investimentos", cor: "#a855f7" },
  { id: "pessoal", nome: "Pessoal", cor: "#f97316" },
  { id: "impostos", nome: "Impostos e Taxas", cor: "#ef4444" },
  { id: "outros", nome: "Outros", cor: "#6b7280" },
];

// Grupos baseados na imagem Grupo.png (exemplos capturados: Imóveis, Intangível, Hardware & Software)
export const GRUPOS_DESPESAS_GRUPOPNG: Omit<GrupoDespesa, "categorias">[] = [
  { id: "planos-acoes", nome: "Planos de Ações", cor: "#0ea5e9" },
  {
    id: "presidencia-diretoria",
    nome: "Presidência e Diretoria",
    cor: "#1d4ed8",
  },
  {
    id: "servicos-contratados-pj",
    nome: "Serviços Contratados - PJ",
    cor: "#22c55e",
  },
  { id: "pessoal", nome: "Pessoal", cor: "#f59e0b" },
  { id: "operacionais", nome: "Operacionais", cor: "#a855f7" },
  { id: "tributarias", nome: "Tributárias", cor: "#ef4444" },
  { id: "investimentos", nome: "Investimentos", cor: "#6b7280" },
];
