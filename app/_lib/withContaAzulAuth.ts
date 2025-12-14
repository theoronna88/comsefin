import { cookies } from "next/headers";
import { AuthenticationError } from "./errors";

/**
 * Obtém o token da Conta Azul dos cookies.
 *
 * @throws {AuthenticationError} Se o token não existir
 * @returns O token de acesso
 *
 * @example
 * const token = getContaAzulToken();
 * // Use o token para fazer chamadas à API
 */
export function getContaAzulToken(): string {
  const accessToken = cookies().get("tokenContaAzul")?.value;

  if (!accessToken) {
    throw new AuthenticationError(
      "Token da Conta Azul não encontrado. Faça login novamente."
    );
  }

  return accessToken;
}

/**
 * Wrapper que valida o token antes de executar a função protegida.
 * Centraliza a lógica de autenticação em um único lugar.
 *
 * @param handler - Função que será executada com o token válido
 * @returns O resultado da função handler
 *
 * @example
 * const result = await withContaAzulAuth(async (token) => {
 *   const response = await fetch(url, {
 *     headers: { Authorization: `Bearer ${token}` }
 *   });
 *   return response.json();
 * });
 */
export async function withContaAzulAuth<T>(
  handler: (token: string) => Promise<T>
): Promise<T> {
  const token = getContaAzulToken();
  return handler(token);
}
