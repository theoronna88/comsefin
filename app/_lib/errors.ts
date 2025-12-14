/**
 * Classe base para todos os erros da aplicação.
 * Permite diferenciar erros operacionais (esperados) de erros de programação (bugs).
 */
export class AppError extends Error {
  /** Código HTTP apropriado para este erro */
  public readonly statusCode: number;

  /** Se true, é um erro esperado. Se false, é um bug. */
  public readonly isOperational: boolean;

  constructor(
    message: string,
    statusCode: number = 500,
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.name = this.constructor.name;

    // Necessário para que instanceof funcione corretamente
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Erro quando o usuário não está autenticado.
 * HTTP 401 - Unauthorized
 *
 * @example
 * throw new AuthenticationError("Sessão expirada. Faça login novamente.");
 */
export class AuthenticationError extends AppError {
  constructor(message: string = "Token de acesso não encontrado.") {
    super(message, 401);
  }
}

/**
 * Erro quando o usuário não tem permissão para a ação.
 * HTTP 403 - Forbidden
 *
 * @example
 * throw new AuthorizationError("Você não tem permissão para deletar este orçamento.");
 */
export class AuthorizationError extends AppError {
  constructor(message: string = "Você não tem permissão para esta ação.") {
    super(message, 403);
  }
}

/**
 * Erro de validação de dados de entrada.
 * HTTP 400 - Bad Request
 *
 * @example
 * throw new ValidationError("O campo 'ano' é obrigatório.");
 */
export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400);
  }
}

/**
 * Erro quando um recurso não é encontrado.
 * HTTP 404 - Not Found
 *
 * @example
 * throw new NotFoundError("Orçamento não encontrado.");
 */
export class NotFoundError extends AppError {
  constructor(message: string = "Recurso não encontrado.") {
    super(message, 404);
  }
}

/**
 * Erro de conflito, como tentar criar um recurso que já existe.
 * HTTP 409 - Conflict
 *
 * @example
 * throw new ConflictError("Já existe um orçamento para o ano 2024.");
 */
export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409);
  }
}

/**
 * Erro ao comunicar com APIs externas (Conta Azul, etc).
 * HTTP 502 - Bad Gateway
 *
 * @example
 * throw new ExternalAPIError("Falha ao conectar com a API da Conta Azul.");
 */
export class ExternalAPIError extends AppError {
  constructor(message: string = "Erro ao comunicar com serviço externo.") {
    super(message, 502);
  }
}

/**
 * Erro de banco de dados.
 * HTTP 500 - Internal Server Error
 *
 * @example
 * throw new DatabaseError("Erro ao salvar o orçamento.");
 */
export class DatabaseError extends AppError {
  constructor(message: string = "Erro ao acessar o banco de dados.") {
    super(message, 500);
  }
}

/**
 * Função utilitária para tratar erros de forma segura.
 * - Loga o erro real no servidor para debugging
 * - Retorna mensagem genérica para o cliente (não expõe detalhes)
 *
 * @param error - O erro capturado
 * @returns Um AppError com mensagem segura
 *
 * @example
 * try {
 *   await prisma.orcamentos.create({ ... });
 * } catch (error) {
 *   throw handleError(error);
 * }
 */
export function handleError(error: unknown): AppError {
  // Se já for um AppError nosso, retorna diretamente
  if (error instanceof AppError) {
    return error;
  }

  // Se for um erro padrão do JavaScript/TypeScript
  if (error instanceof Error) {
    // Log detalhado para debugging (só aparece no servidor)
    console.error("[handleError]", {
      name: error.name,
      message: error.message,
      stack: error.stack,
    });

    // Retorna mensagem genérica para o cliente
    return new AppError(
      "Ocorreu um erro interno. Por favor, tente novamente mais tarde."
    );
  }

  // Erro completamente desconhecido
  console.error("[handleError] Erro desconhecido:", error);
  return new AppError("Ocorreu um erro inesperado.");
}
