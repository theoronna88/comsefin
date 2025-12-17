"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useCallback, useRef } from "react";

/**
 * Hook para acessar o token do Conta Azul no client-side
 * Automaticamente redireciona para login se o token expirar
 */
export function useContaAzulAuth() {
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const isLoggingOut = useRef(false);

  // Função para forçar logout
  const forceLogout = useCallback(async () => {
    if (isLoggingOut.current) return;
    isLoggingOut.current = true;

    console.log("[useContaAzulAuth] Forçando logout...");
    await signOut({ callbackUrl: "/" });
  }, []);

  // Verifica se o token está expirado
  const isTokenExpired = useCallback(() => {
    if (!session) return false;

    // Verifica erro na sessão
    if (
      session.error === "RefreshAccessTokenError" ||
      session.error === "TokenExpiredError"
    ) {
      return true;
    }

    // Verifica timestamp de expiração
    if (
      session.accessTokenExpires &&
      Date.now() >= session.accessTokenExpires
    ) {
      return true;
    }

    return false;
  }, [session]);

  useEffect(() => {
    // Se houver erro de refresh token ou token expirado, faz logout e redireciona
    if (
      session?.error === "RefreshAccessTokenError" ||
      session?.error === "TokenExpiredError"
    ) {
      forceLogout();
    }
  }, [session?.error, forceLogout]);

  // Função para verificar e atualizar token manualmente
  const refreshSession = useCallback(async () => {
    if (status !== "authenticated") return false;

    try {
      const updatedSession = await update();

      if (updatedSession?.error) {
        forceLogout();
        return false;
      }

      return true;
    } catch (error) {
      console.error("[useContaAzulAuth] Erro ao atualizar sessão:", error);
      return false;
    }
  }, [status, update, forceLogout]);

  return {
    accessToken: session?.accessToken,
    isAuthenticated:
      status === "authenticated" && !session?.error && !isTokenExpired(),
    isLoading: status === "loading",
    error: session?.error,
    session,
    isTokenExpired,
    refreshSession,
    forceLogout,
  };
}

/**
 * Hook para verificar se o usuário está autenticado
 * Redireciona para a página inicial se não estiver
 */
export function useRequireAuth() {
  const { isAuthenticated, isLoading, error, isTokenExpired, forceLogout } =
    useContaAzulAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/");
    }
  }, [isAuthenticated, isLoading, router]);

  useEffect(() => {
    if (!isLoading && isTokenExpired()) {
      console.log("[useRequireAuth] Token expirado, forçando logout...");
      forceLogout();
    }
  }, [isLoading, isTokenExpired, forceLogout]);

  return { isAuthenticated, isLoading, error };
}
