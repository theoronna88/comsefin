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
      // Deletar dados do Redis (se necessário)
      await fetch("/api/get-redis-data", { method: "POST" });
    } catch {
      // Ignorar erros na limpeza
    } finally {
      // Sempre executar o signOut e redirecionar para a página inicial
      await signOut({
        callbackUrl: "/",
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
