"use client";

import * as React from "react";
import {
  ArrowUpCircleIcon,
  LandmarkIcon,
  LayoutDashboardIcon,
} from "lucide-react";

import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar";
import { useSession } from "next-auth/react";

const data2 = {
  user: {
    name: "shadcn",
    email: "m@example.com",
    avatar: "/avatars/shadcn.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/user/dashboard",
      icon: LayoutDashboardIcon,
    },
    /*
    {
      title: "Centros de Custos",
      url: "/user/centro-custo",
      icon: ListIcon,
    },
    
    {
      title: "Categorias",
      url: "/user/categorias",
      icon: BarChartIcon,
    },*/
    {
      title: "Orçamento de Exercício",
      url: "/user/budget",
      icon: LandmarkIcon,
    },
    /*
    {
      title: "Despesas",
      url: "/user/despesa",
      icon: ArrowUpCircleIcon,
    },
    */
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  // recuperar dados do usuário pela sessao
  const { data: session, status } = useSession();
  const [userData, setUserData] = React.useState(null);

  React.useEffect(() => {
    console.log("Sessão atualizada:", session);
    console.log("Status da sessão:", status);

    if (status === "authenticated" && session) {
      // Aqui você pode extrair os dados do usuário da sessão
      const user = session;
      setUserData(user);
      console.log("Dados da sessão:", user);
    } else {
      setUserData(null);
    }
  }, [status, session]);

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <ArrowUpCircleIcon className="h-5 w-5" />
                <span className="text-base font-semibold">COMSEFAZ</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data2.navMain} />
      </SidebarContent>
    </Sidebar>
  );
}
