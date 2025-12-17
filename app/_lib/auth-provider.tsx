"use client";

import { SessionProvider } from "next-auth/react";
import { TokenExpirationWatcher } from "../_components/token-expiration-watcher";

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  return (
    <SessionProvider
      // Atualiza a sessão a cada 5 minutos para verificar expiração
      refetchInterval={5 * 60}
      // Atualiza quando a janela ganha foco
      refetchOnWindowFocus={true}
    >
      <TokenExpirationWatcher>{children}</TokenExpirationWatcher>
    </SessionProvider>
  );
}
