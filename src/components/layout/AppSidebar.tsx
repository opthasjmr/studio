"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  // SidebarProvider, // Removed
  SidebarFooter,
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
  ScanEye, 
  ClipboardList, // Added ClipboardList
} from "lucide-react";
import type React from 'react';
import { useState } from 'react';
import { siteConfig } from "@/config/site";


interface NavItem {
  href: string;
  icon: React.ElementType;
  label: string;
  roles: string[];
  children?: NavItem[];
}


const navItems = siteConfig.sidebarNav.map(item => ({
  ...item,
  // Map string icon names from config to actual Lucide components
  icon: (() => {
    switch (item.icon) {
      case "LayoutDashboard": return LayoutDashboard;
      case "Users": return Users;
      case "CalendarDays": return CalendarDays;
      case "ScanEye": return ScanEye;
      case "FileText": return FileText;
      case "DollarSign": return DollarSign;
      case "BarChart2": return BarChart2;
      case "Video": return Video;
      case "Settings": return Settings;
      case "ClipboardList": return ClipboardList;
      default: return LayoutDashboard; // Fallback icon
    }
  })(),
  children: item.children ? item.children.map(child => ({
    ...child,
    icon: (() => {
      switch (child.icon) {
        case "CalendarDays": return CalendarDays;
        // Add other child icons if needed
        default: return CalendarDays;
      }
    })()
  })) : undefined,
}));


export function AppSidebar() {
  const { user, role } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { toggleSidebar, state, setOpenMobile } = useSidebar();
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});

  const handleSignOut = async () => {
    await signOutUser();
    if(setOpenMobile) setOpenMobile(false); 
    router.push("/login");
  };

  const toggleSubmenu = (label: string) => {
    setOpenSubmenus(prev => ({ ...prev, [label]: !prev[label] }));
  };

  if (!user) return null; 

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
                     if(setOpenMobile) setOpenMobile(false); 
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
                           if(setOpenMobile) setOpenMobile(false); 
                        }}
                       >
                        <Link href={subItem.href}>
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

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  return ( // SidebarProvider is now in AppProviders
      <div className="flex min-h-screen">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
            <div className="flex-1 overflow-y-auto">
                 {children}
            </div>
        </main>
      </div>
  );
}
