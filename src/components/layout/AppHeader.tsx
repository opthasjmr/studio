"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/config/site";
import { useAuth } from "@/contexts/AuthContext";
import { signOutUser } from "@/lib/auth-actions";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { User as UserIcon, LogOut, LayoutDashboard, ScanEye, Send, Search, Bell, PanelLeft } from "lucide-react";
import { SiteLogo } from "@/components/SiteLogo";
import { useSidebar } from "@/components/ui/sidebar"; 

export function AppHeader() {
  const { user } = useAuth();
  const router = useRouter();
  const { toggleSidebar, isMobile, open: sidebarOpen } = useSidebar(); 

  const handleSignOut = async () => {
    await signOutUser();
    router.push("/login");
  };

  const getInitials = (name?: string | null) => {
    if (!name) return "NV";
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between space-x-4">
        <div className="flex items-center">
          {isMobile && user && ( /* Show sidebar toggle only on mobile and if user is logged in */
            <Button variant="ghost" size="icon" onClick={toggleSidebar} className="mr-2 md:hidden">
              <PanelLeft className="h-6 w-6" />
              <span className="sr-only">Toggle Sidebar</span>
            </Button>
          )}
          {
            (() => {
              if (!user) { // Public page, always show SiteLogo
                return <SiteLogo />;
              }
              // Authenticated page: show if mobile OR if desktop and sidebar is collapsed
              if (isMobile || !sidebarOpen) {
                return <SiteLogo />;
              }
              return null; // Hide SiteLogo if desktop and sidebar is open
            })()
          }
        </div>
        
        {/* Global Search Bar - Visible on larger screens */}
        <div className="hidden md:flex flex-1 max-w-md items-center space-x-2">
          <Search className="h-5 w-5 text-muted-foreground" />
          <Input 
            type="search" 
            placeholder="Search patients, appointments..." 
            className="h-9"
          />
        </div>

        <div className="flex items-center space-x-2 sm:space-x-4">
           {/* Notifications Icon - Placeholder */}
          {user && (
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1 right-1 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="sr-only">Notifications</span>
            </Button>
          )}

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.photoURL || undefined} alt={user.displayName || user.email || "User"} />
                    <AvatarFallback>{getInitials(user.displayName || user.email)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.displayName || user.email}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  <span>Dashboard</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => router.push('/analyze-scan')}>
                  <ScanEye className="mr-2 h-4 w-4" />
                  <span>Analyze Scan</span>
                </DropdownMenuItem>
                 <DropdownMenuItem onClick={() => router.push('/contact')}>
                  <Send className="mr-2 h-4 w-4" />
                  <span>Request Demo</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
             {/* Show main nav links from siteConfig if not using sidebar primarily for these */}
            <nav className="hidden items-center space-x-6 text-sm font-medium md:flex">
                {siteConfig.mainNav
                .filter(item => !item.authRequired) // Show only non-auth links for logged-out users
                .map((item) => (
                    <Link
                    key={item.href}
                    href={item.href}
                    className="text-foreground/60 transition-colors hover:text-foreground/80"
                    >
                    {item.title}
                    </Link>
                ))}
            </nav>
              <Button variant="ghost" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
