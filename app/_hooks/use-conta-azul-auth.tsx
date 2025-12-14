"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Hook para acessar o token do Conta Azul no client-side
 * Automaticamente redireciona para login se o token expirar
 */
export function useContaAzulAuth() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    // Se houver erro de refresh token, faz logout e redireciona
    if (session?.error === "RefreshAccessTokenError") {
      signOut({ callbackUrl: "/" });
    }
  }, [session?.error, router]);

  return {
    accessToken: session?.accessToken,
    isAuthenticated: status === "authenticated" && !session?.error,
    isLoading: status === "loading",
    error: session?.error,
    session,
  };
}

/**
 * Hook para verificar se o usuário está autenticado
 * Redireciona para a página inicial se não estiver
 */
export function useRequireAuth() {
  const { isAuthenticated, isLoading, error } = useContaAzulAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, router]);

  return { isAuthenticated, isLoading, error };
}
