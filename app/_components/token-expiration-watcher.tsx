"use client";

import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useCallback } from "react";

// Intervalo de verificação do token (5 minutos)
// Mais adequado para Vercel free tier e reduz custos
const CHECK_INTERVAL = 5 * 60 * 1000;

// Páginas públicas que não precisam de verificação
const PUBLIC_PATHS = ["/", "/login", "/conta-azul", "/conta-azul/callback"];

/**
 * Componente que monitora a expiração do token do Conta Azul
 * e redireciona automaticamente para o login quando necessário.
 *
 * Este componente:
 * - Verifica o token periodicamente (a cada 5 minutos)
 * - Verifica quando a janela ganha foco (usuário volta à aba)
 * - Verifica quando a aba fica visível novamente
 * - Faz logout automático quando o token expira ou há erro
 */
export function TokenExpirationWatcher({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status, update } = useSession();
  const pathname = usePathname();
  const isRedirecting = useRef(false);

  // Verifica se estamos em uma página protegida
  const isProtectedPage = !PUBLIC_PATHS.some(
    (path) => pathname === path || pathname?.startsWith(path + "/")
  );

  // Função para forçar logout e redirecionar
  const forceLogout = useCallback(async () => {
    if (isRedirecting.current) return;
    isRedirecting.current = true;

    await signOut({
      callbackUrl: "/",
      redirect: true,
    });
  }, []);

  // Verifica se o token está expirado ou tem erro
  const checkTokenValidity = useCallback(async () => {
    if (status !== "authenticated" || !isProtectedPage) return;

    // Verifica se há erro na sessão (token expirado, refresh falhou, etc.)
    if (
      session?.error === "RefreshAccessTokenError" ||
      session?.error === "TokenExpiredError"
    ) {
      forceLogout();
      return;
    }

    // Verifica se o token expirou baseado no timestamp
    if (
      session?.accessTokenExpires &&
      Date.now() >= session.accessTokenExpires
    ) {
      // Tenta atualizar a sessão primeiro
      const updatedSession = await update();

      // Se ainda há erro após atualização, faz logout
      if (updatedSession?.error) {
        forceLogout();
      }
      return;
    }

    // Verifica se não há token de acesso
    if (!session?.accessToken) {
      forceLogout();
      return;
    }
  }, [session, status, isProtectedPage, update, forceLogout]);

  // Verificação periódica do token
  useEffect(() => {
    if (!isProtectedPage) return;

    // Verificação inicial
    checkTokenValidity();

    // Configura intervalo de verificação
    const interval = setInterval(() => {
      checkTokenValidity();
    }, CHECK_INTERVAL);

    return () => clearInterval(interval);
  }, [checkTokenValidity, isProtectedPage]);

  // Verifica quando a janela ganha foco
  useEffect(() => {
    if (!isProtectedPage) return;

    const handleFocus = () => {
      checkTokenValidity();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        checkTokenValidity();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [checkTokenValidity, isProtectedPage]);

  // Monitora mudanças de erro na sessão
  useEffect(() => {
    if (session?.error && isProtectedPage) {
      forceLogout();
    }
  }, [session?.error, isProtectedPage, forceLogout]);

  return <>{children}</>;
}
