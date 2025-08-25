"use client";

import { signOut } from "next-auth/react";
import { Button } from "./ui/button";
import { LogOut } from "lucide-react";

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
  const handleLogout = async () => {
    try {
      // Limpar cookie local
      document.cookie =
        "TokenContaAzul=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

      // Deletar dados do Redis
      const response = await fetch("/api/get-redis-data", { method: "POST" });

      if (response.ok) {
        const data = await response.json();
        console.log("Dados do Redis removidos:", data.message);
      } else {
        console.error("Erro ao remover dados do Redis:", response.statusText);
      }
    } catch (error) {
      console.error("Erro durante o logout:", error);
    } finally {
      // Sempre executar o signOut, mesmo se houver erro na limpeza do Redis
      await signOut({
        callbackUrl: "/login",
        redirect: true,
      });
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleLogout}
      className={className}
    >
      <LogOut className="h-4 w-4 mr-2" />
      Sair
    </Button>
  );
}
