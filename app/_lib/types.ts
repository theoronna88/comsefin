import { Decimal } from "@prisma/client/runtime/library";

// ==========================================
// TIPOS DO PRISMA (baseados no schema.prisma)
// ==========================================

/**
 * Representa um orçamento anual
 */
export interface Orcamento {
  id: string;
  ano: number;
  createdAt: Date;
  updatedAt: Date;
  valores?: ValorOrcamento[];
}

/**
 * Representa um item de orçamento (categoria)
 */
export interface ItemOrcamento {
  id: string;
  codigo: string;
  descricao: string;
  status: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Representa o valor de um item no orçamento
 */
export interface ValorOrcamento {
  id: string;
  valor: Decimal;
  createdAt: Date;
  orcamentoId: string;
  itemId: string;
  item?: ItemOrcamento;
}

// ==========================================
// TIPOS DA API CONTA AZUL
// ==========================================

/**
 * Resposta paginada padrão da API Conta Azul
 */
export interface ContaAzulPaginatedResponse<T> {
  itens: T[];
  pagina?: number;
  tamanho_pagina?: number;
  total?: number;
}

/**
 * Centro de custo da Conta Azul
 */
export interface CentroCusto {
  id: string;
  codigo: string;
  nome: string;
  ativo?: boolean;
}

/**
 * Categoria da Conta Azul
 */
export interface Categoria {
  id: string;
  nome: string;
  tipo: string;
  categoria_pai?: string | null;
}

/**
 * Despesa ou Receita da Conta Azul
 */
export interface DespesaReceita {
  id: number;
  total: number;
  status_traduzido: string;
  data_vencimento?: string;
  descricao?: string;
  nao_pago?: number;
  pago?: number;
}

/**
 * Pessoa da Conta Azul
 */
export interface Pessoa {
  id: number;
  nome: string;
}

// ==========================================
// TIPOS DE ENTRADA/SAÍDA DAS FUNÇÕES
// ==========================================

/**
 * Categoria com valor para entrada no orçamento
 */
export interface BudgetCategoriaInput {
  nome: string;
  valor: number;
}

/**
 * Dados de entrada para criar/atualizar orçamento
 */
export interface BudgetInput {
  id?: string;
  ano: number | string;
  categorias: BudgetCategoriaInput[];
}

/**
 * Resposta do endpoint de token OAuth
 */
export interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in: number;
}

// ==========================================
// TIPOS DE TOTAIS E AGREGAÇÕES
// ==========================================

/**
 * Totais de despesas/receitas por status
 */
export interface TotaisPorStatus {
  pago?: number;
  pendente?: number;
  vencido?: number;
  total?: number;
}

// ==========================================
// TIPOS ESTENDIDOS PARA O DASHBOARD
// ==========================================

/**
 * Categoria com dados agregados de despesas/receitas
 * Usado no dashboard para exibir totais e comparativos
 */
export interface CategoriaComDados extends Categoria {
  despesas?: DespesaReceita[];
  despesasPrev?: DespesaReceita[];
  total?: number;
  totalPrev?: number;
  receitas?: DespesaReceita[];
  receitasPrev?: DespesaReceita[];
  totalReceitas?: number;
  totalReceitasPrev?: number;
  orcamentoAtual?: number;
}

/**
 * Centro de custo com categorias associadas
 * Usado no dashboard para agrupar despesas/receitas
 */
export interface CentroCustoComCategorias extends CentroCusto {
  categorias?: CategoriaComDados[];
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

/*
- Operacionais: 2f6bc8
- Pessoal: 2f6bc8
- PJ : 1b3c79
- Presidencia: 8891a0
- Plano de acoes: 1b3c79
- Invés: c55a11
- Trib: 4642e3

*/

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
  { id: "planos-acoes", nome: "Planos de Ações", cor: "#11224d" },
  {
    id: "presidencia-diretoria",
    nome: "Presidência e Diretoria",
    cor: "#8891a0",
  },
  {
    id: "servicos-contratados-pj",
    nome: "Serviços Contratados - PJ",
    cor: "#1b3c79",
  },
  { id: "pessoal", nome: "Pessoal", cor: "#4c9ab3" },
  { id: "operacionais", nome: "Operacionais", cor: "#2f6bc8" },
  { id: "tributarias", nome: "Tributárias", cor: "#4642e3" },
  { id: "investimentos", nome: "Investimentos", cor: "#c55a11" },
];
