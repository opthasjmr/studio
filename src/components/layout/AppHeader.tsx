
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
import { User as UserIcon, LogOut, LayoutDashboard, ScanEye, Send } from "lucide-react";
import { SiteLogo } from "@/components/SiteLogo";

export function AppHeader() {
  const { user } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await signOutUser();
    router.push("/login");
  };

  const getInitials = (name?: string | null) => {
    if (!name) return "NV";
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center space-x-4 sm:justify-between sm:space-x-0">
        <SiteLogo />
        <nav className="hidden flex-1 items-center justify-center space-x-6 text-sm font-medium md:flex">
          {siteConfig.mainNav.map((item) => {
            // Show if auth is not required OR if auth is required and user exists
            if (!item.authRequired || (item.authRequired && user)) {
              // Specifically for "Request Demo", only show if user is NOT logged in for main nav
              if (item.href === "/contact" && user && item.authRequired === false) {
                return null;
              }
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="text-foreground/60 transition-colors hover:text-foreground/80"
                >
                  {item.title}
                </Link>
              );
            }
            return null;
          })}
        </nav>
        <div className="flex items-center justify-end space-x-4">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
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
                {/* Add profile link if needed */}
                {/* <DropdownMenuItem onClick={() => router.push('/profile')}>
                  <UserIcon className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem> */}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
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
