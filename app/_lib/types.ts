"use server";

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
  id: number;
  codigo: string;
  nome: string;
  ativo?: boolean;
}

/**
 * Categoria da Conta Azul
 */
export interface Categoria {
  id: number | string;
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
