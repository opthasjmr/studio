
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
        <AppHeader /> 
        {/* AppHeader can be part of the main content area now, or DashboardLayout can be modified to include it within its structure if fixed positioning is needed above sidebar */}
        <div className="flex-1 p-0"> {/* Ensure main content takes remaining space and remove default padding if page itself handles it */}
         {children}
        </div>
    </DashboardLayout>
  );
}
