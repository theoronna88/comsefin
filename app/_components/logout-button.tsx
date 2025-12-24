"use client";

import { signOut } from "next-auth/react";
import { Button } from "./ui/button";
import { LogOut } from "lucide-react";
import { useAsyncAction } from "../_hooks/use-async-action";

interface LogoutButtonProps {
  variant?:
    | "default"
    | "destructive"
    | "outline"
    | "secondary"
    | "ghost"
    | "link";
  size?: "default" | "sm" | "lg" | "icon";
  className?: string;
}

export function LogoutButton({
  variant = "outline",
  size = "sm",
  className,
}: LogoutButtonProps) {
  const { execute, isLoading } = useAsyncAction();

  const handleLogout = () => {
    execute(async () => {
      // Limpar todos os cookies relacionados à autenticação
      const cookiesToClear = [
        "TokenContaAzul",
        "__Host-next-auth.csrf-token",
        "__Secure-next-auth.callback-url",
        "__Secure-next-auth.session-token.0",
        "__Secure-next-auth.session-token.1",
        "next-auth.csrf-token",
        "next-auth.callback-url",
        "next-auth.session-token",
      ];

      // Remove cada cookie
      cookiesToClear.forEach((cookieName) => {
        // Remove com path=/
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        // Remove sem path (para cookies do domínio raiz)
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC;`;
        // Remove com Secure flag
        document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; Secure;`;
      });

      await signOut({
        callbackUrl: "/",
        redirect: true,
      });
    });
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleLogout}
      disabled={isLoading}
      className={className}
    >
      <LogOut className="h-4 w-4 mr-2" />
      {isLoading ? "Saindo..." : "Sair"}
    </Button>
  );
}
