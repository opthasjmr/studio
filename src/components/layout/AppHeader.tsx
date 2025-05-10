
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
import { User as UserIcon, LogOut, LayoutDashboard, ScanEye, Send, Search, Bell, PanelLeft, Settings, Users, CalendarDays, FileText, DollarSign, BarChart2, Video, Wand2, FlaskConical, SkipForward, ClipboardList } from "lucide-react";
import { SiteLogo } from "@/components/SiteLogo";
import { useSidebar } from "@/components/ui/sidebar"; 

export function AppHeader() {
  const { user, role } = useAuth(); // Added role from useAuth
  const router = useRouter();
  const { toggleSidebar, isMobile, open: sidebarOpen, setOpenMobile } = useSidebar(); 

  const handleSignOut = async () => {
    await signOutUser();
    if(setOpenMobile) setOpenMobile(false); // Close mobile sidebar on logout
    router.push("/login");
  };

  const getInitials = (name?: string | null) => {
    if (!name) return "U"; // Default to "U" for User
    const nameParts = name.split(' ').filter(part => part.length > 0);
    if (nameParts.length > 1) {
      return nameParts[0][0] + nameParts[nameParts.length - 1][0];
    } else if (nameParts.length === 1 && nameParts[0].length > 1) {
      return nameParts[0].substring(0,2);
    } else if (nameParts.length === 1) {
      return nameParts[0][0];
    }
    return "U";
  };

  const userSpecificNavItems = [
    { title: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["admin", "doctor", "receptionist", "patient"] },
    { title: "Profile", href: user ? `/patients/${user.uid}` : '/profile', icon: UserIcon, roles: ["patient"] }, // Patient profile link
    { title: "My Appointments", href: "/appointments", icon: CalendarDays, roles: ["patient"] },
    { title: "My Records", href: "/emr", icon: FileText, roles: ["patient"] }, // Assuming EMR is where records are
    { title: "Settings", href: "/settings", icon: Settings, roles: ["admin", "doctor", "patient"] }, // Settings might be for all
  ].filter(item => role && item.roles.includes(role));


  const handleSkipLogin = () => {
    router.push("/");
  };


  return (
    <header className="sticky top-0 z-30 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between space-x-4">
        <div className="flex items-center">
          {isMobile && user && (
            <Button variant="ghost" size="icon" onClick={toggleSidebar} className="mr-2 md:hidden">
              <PanelLeft className="h-6 w-6" />
              <span className="sr-only">Toggle Sidebar</span>
            </Button>
          )}
          {
            (() => {
              if (!user) {
                return <SiteLogo />;
              }
              if (isMobile || !sidebarOpen) {
                return <SiteLogo />;
              }
              return null;
            })()
          }
        </div>
        
        {user && (role === 'admin' || role === 'doctor' || role === 'receptionist') && (
            <div className="hidden md:flex flex-1 max-w-md items-center space-x-2">
            <Search className="h-5 w-5 text-muted-foreground" />
            <Input 
                type="search" 
                placeholder="Search patients, appointments..." 
                className="h-9"
                // Add functionality for search here
            />
            </div>
        )}

        <div className="flex items-center space-x-2 sm:space-x-4">
          {user && (
            <Button variant="ghost" size="icon" className="relative" title="Notifications">
              <Bell className="h-5 w-5" />
              {/* Example notification badge */}
              {/* <span className="absolute top-1 right-1 flex h-2.5 w-2.5 rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
              </span> */}
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
                      {user.displayName || "User"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                    {role && <p className="text-xs leading-none text-primary capitalize pt-1">{role}</p>}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {userSpecificNavItems.map(item => (
                     <DropdownMenuItem key={item.href} onClick={() => router.push(item.href)}>
                        <item.icon className="mr-2 h-4 w-4" />
                        <span>{item.title}</span>
                    </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
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
            <nav className="hidden items-center space-x-1 md:flex">
                {siteConfig.mainNav
                .filter(item => !item.authRequired)
                .map((item) => (
                    <Button variant="ghost" asChild key={item.href}>
                        <Link href={item.href} className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                            {item.title}
                        </Link>
                    </Button>
                ))}
            </nav>
              <Button variant="outline" size="sm" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
               <Button variant="ghost" size="sm" onClick={handleSkipLogin} className="text-sm text-muted-foreground hover:text-primary">
                <SkipForward className="mr-1 h-4 w-4" />
                Skip
            </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
