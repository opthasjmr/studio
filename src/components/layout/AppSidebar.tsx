
"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { SiteLogo } from "@/components/SiteLogo";
// import { Button } from "@/components/ui/button"; // Not used directly here anymore
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
  ClipboardList,
  Wand2,
  FlaskConical,
  CalendarPlus,
} from "lucide-react";
import type React from 'react';
import { useState, useEffect } from 'react';
import { siteConfig } from "@/config/site";


interface NavItemConfig {
  title: string;
  href: string;
  icon: string; // Icon name as string from config
  roles: string[];
  children?: NavItemConfig[];
}

interface NavItem {
  href: string;
  icon: React.ElementType;
  label: string;
  roles: string[];
  children?: NavItem[];
}

const mapIconNameToComponent = (iconName: string): React.ElementType => {
  switch (iconName) {
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
    case "Wand2": return Wand2;
    case "FlaskConical": return FlaskConical;
    case "CalendarPlus": return CalendarPlus;
    default: return LayoutDashboard; // Fallback icon
  }
};

const navItems: NavItem[] = siteConfig.sidebarNav.map((item: NavItemConfig) => ({
  href: item.href,
  icon: mapIconNameToComponent(item.icon),
  label: item.title,
  roles: item.roles,
  children: item.children ? item.children.map(child => ({
    href: child.href,
    icon: mapIconNameToComponent(child.icon),
    label: child.title,
    roles: child.roles,
  })) : undefined,
}));


export function AppSidebar() {
  const { user, role } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { state, setOpenMobile } = useSidebar(); // Removed toggleSidebar, used by Header
  const [openSubmenus, setOpenSubmenus] = useState<Record<string, boolean>>({});

  const handleSignOut = async () => {
    await signOutUser();
    if (setOpenMobile) setOpenMobile(false);
    router.push("/login");
  };

  const toggleSubmenu = (label: string) => {
    setOpenSubmenus(prev => ({ ...prev, [label]: !prev[label] }));
  };
  
  // Close submenu when sidebar collapses
  useEffect(() => {
    if (state === "collapsed") {
      setOpenSubmenus({});
    }
  }, [state]);


  if (!user) return null;

  const filteredNavItems = navItems.filter(item => role && item.roles.includes(role));

  return (
    <Sidebar collapsible="icon" variant="sidebar" side="left">
      <SidebarHeader className="items-center">
        {state === "expanded" && <SiteLogo />}
        {/* SidebarTrigger is for desktop, mobile toggle is in AppHeader */}
        <SidebarTrigger className="ml-auto hidden md:flex" /> 
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
                    if (setOpenMobile) setOpenMobile(false);
                    router.push(item.href);
                  }
                }}
                isActive={!item.children && pathname === item.href} // Exact match for parent items
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
                        asChild // Use asChild to make the whole button a Link
                        isActive={pathname.startsWith(subItem.href)} // Use startsWith for sub-items
                        onClick={() => {
                           if (setOpenMobile) setOpenMobile(false);
                        }}
                       >
                        <Link href={subItem.href}>
                          {/* <subItem.icon className="mr-2 h-4 w-4" /> Optional: icon for sub-item */}
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
  return (
      <div className="flex min-h-screen bg-muted/40"> {/* Added background color */}
        <AppSidebar />
        <main className="flex-1 flex flex-col overflow-hidden"> {/* Prevent double scrollbars potentially */}
            {/* Content area will scroll if it overflows */}
            <div className="flex-1 overflow-y-auto"> 
                 {children}
            </div>
        </main>
      </div>
  );
}
