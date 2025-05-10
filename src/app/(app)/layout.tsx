
import { AppHeader } from "@/components/layout/AppHeader";
import { DashboardLayout } from "@/components/layout/AppSidebar";
import type React from "react";

export default function AppWithSidebarLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardLayout>
        {/* AppHeader is now part of the main scrollable content area if DashboardLayout doesn't fix it */}
        <AppHeader /> 
        <div className="flex-1 p-0 md:p-6 lg:p-8 bg-muted/40"> {/* Add padding for content area, remove for full-width pages */}
         {children}
        </div>
    </DashboardLayout>
  );
}

