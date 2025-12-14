import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/authOptions";

/**
 * Obtém o access token do Conta Azul a partir da sessão do NextAuth
 * Para uso em Server Components e Server Actions
 */
export async function getContaAzulToken(): Promise<string | null> {
  const session = await getServerSession(authOptions);

  if (!session) {
    return null;
  }

  // Verifica se há erro no refresh do token
  if (session.error === "RefreshAccessTokenError") {
    console.error("Erro: Token expirado e não foi possível renovar");
    return null;
  }

  return session.accessToken || null;
}

/**
 * Verifica se a sessão está válida e o token não expirou
 */
export async function isSessionValid(): Promise<boolean> {
  const session = await getServerSession(authOptions);

  if (!session || session.error) {
    return false;
  }

  return !!session.accessToken;
}
