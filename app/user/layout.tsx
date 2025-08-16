import { AppSidebar } from "../_components/app-sidebar";
import { SiteHeader } from "../_components/site-header";
import { SidebarInset, SidebarProvider } from "../_components/ui/sidebar";

const LoggedLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <>
          <SiteHeader />
          {children}
        </>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default LoggedLayout;
