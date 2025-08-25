import { AppSidebar } from "../_components/app-sidebar";
import { SiteHeader } from "../_components/site-header";
import { SidebarInset, SidebarProvider } from "../_components/ui/sidebar";
import { Toaster } from "../_components/ui/sonner";

const LoggedLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <>
          <SiteHeader />
          {children}
          <Toaster />
        </>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default LoggedLayout;
