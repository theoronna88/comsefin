"use client";
import { Separator } from "./ui/separator";
import { SidebarTrigger } from "./ui/sidebar";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { LogoutButton } from "./logout-button";

export function SiteHeader() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const pageTitles: Record<string, string> = {
    "/user": "Dashboard",
    "/user/dashboard": "Dashboard",
    "/user/centro-custo": "Centro de Custo",
    "/user/categorias": "Categorias",
    "/user/receita": "Receitas",
    "/user/despesa": "Despesas",
    "/user/pessoa": "Pessoas",
    "/user/budget": "Orçamento",
  };

  const title = pageTitles[pathname] || "Sistema";

  const getUserInitials = (name?: string | null) => {
    if (!name) return "U";
    const words = name.split(" ");
    if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />
        <h1 className="text-base font-medium">{title}</h1>

        {/* User Info and Logout */}
        <div className="ml-auto flex items-center gap-3">
          {session?.user && (
            <>
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-blue-100 text-blue-700 text-xs">
                    {getUserInitials(session.user.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block">
                  <p className="text-sm font-medium">
                    {session.user.name || "Usuário"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {session.user.email || session.user.id}
                  </p>
                </div>
              </div>
              <Separator
                orientation="vertical"
                className="data-[orientation=vertical]:h-6"
              />
              <LogoutButton />
            </>
          )}
        </div>
      </div>
    </header>
  );
}
