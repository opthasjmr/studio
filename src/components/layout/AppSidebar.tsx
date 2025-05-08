
"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { SiteLogo } from "@/components/SiteLogo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { signOutUser } from "@/lib/auth-actions";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  FileText,
  DollarSign,
  BarChart2,
  Video,
  Settings,
  LogOut,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type React from 'react';
import { useState } from 'react';

interface NavItem {
  href: string;
  icon: React.ElementType;
  label: string;
  roles: string[];
  children?: NavItem[];
}

const navItems: NavItem[] = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", roles: ["admin", "doctor", "receptionist", "patient"] },
  { href: "/patients", icon: Users, label: "Patients", roles: ["admin", "doctor", "receptionist"] },
  { 
    href: "/appointments", 
    icon: CalendarDays, 
    label: "Appointments", 
    roles: ["admin", "doctor", "receptionist", "patient"],
    children: [
      { href: "/appointments", icon: CalendarDays, label: "View All", roles: ["admin", "doctor", "receptionist", "patient"] },
      { href: "/appointments/new", icon: CalendarDays, label: "Schedule New", roles: ["admin", "doctor", "receptionist"] },
    ]
  },
  { href: "/emr", icon: FileText, label: "EMR / Records", roles: ["admin", "doctor"], }, // Placeholder
  { href: "/billing", icon: DollarSign, label: "Billing", roles: ["admin", "receptionist"], }, // Placeholder
  { href: "/reports", icon: BarChart2, label: "Reports", roles: ["admin", "doctor"], }, // Placeholder
  { href: "/telemedicine", icon: Video, label: "Telemedicine", roles: ["admin", "doctor", "patient"], }, // Placeholder
  { href: "/settings", icon: Settings, label: "Settings", roles: ["admin"], }, // Placeholder
];

export function AppSidebar() {
  const { user, role } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { toggleSidebar, state, setOpenMobile } = useSidebar();
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});

  const handleSignOut = async () => {
    await signOutUser();
    if(setOpenMobile) setOpenMobile(false); // Close mobile sidebar on logout
    router.push("/login");
  };

  const toggleSubmenu = (label: string) => {
    setOpenSubmenus(prev => ({ ...prev, [label]: !prev[label] }));
  };

  if (!user) return null; // Sidebar should only show for logged-in users

  const filteredNavItems = navItems.filter(item => role && item.roles.includes(role));

  return (
    <Sidebar collapsible="icon" variant="sidebar" side="left">
      <SidebarHeader className="items-center">
        {state === "expanded" && <SiteLogo />}
        <SidebarTrigger className="ml-auto md:hidden" />
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {filteredNavItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton
                onClick={() => {
                  if (item.children) {
                    toggleSubmenu(item.label);
                  } else {
                     if(setOpenMobile) setOpenMobile(false); // Close mobile sidebar on nav
                    router.push(item.href);
                  }
                }}
                isActive={!item.children && pathname.startsWith(item.href)}
                tooltip={item.label}
                className="justify-start"
              >
                <item.icon className="h-5 w-5" />
                {item.label}
                {item.children && (openSubmenus[item.label] ? <ChevronUp className="ml-auto h-4 w-4" /> : <ChevronDown className="ml-auto h-4 w-4" />)}
              </SidebarMenuButton>
              {item.children && openSubmenus[item.label] && state === 'expanded' && (
                <SidebarMenuSub>
                  {item.children.filter(child => role && child.roles.includes(role)).map(subItem => (
                    <SidebarMenuSubItem key={subItem.label}>
                      <SidebarMenuSubButton 
                        asChild 
                        isActive={pathname === subItem.href}
                        onClick={() => {
                           if(setOpenMobile) setOpenMobile(false); // Close mobile sidebar on nav
                        }}
                       >
                        <Link href={subItem.href}>
                          {/* <subItem.icon className="h-4 w-4 mr-2" /> */}
                          {subItem.label}
                        </Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              )}
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleSignOut} tooltip="Log Out" className="justify-start">
              <LogOut className="h-5 w-5" />
              Log Out
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

// Wrapper component for pages using the sidebar
export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider defaultOpen={true}> {/* Control default state here */}
      <div className="flex min-h-screen">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
            {/* Top Nav placeholder (to be AppHeader) */}
             {/* <AppHeader /> */}
            <div className="flex-1 overflow-y-auto">
                 {children}
            </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
