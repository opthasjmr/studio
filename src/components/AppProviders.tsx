"use client";

import { AuthProvider } from '@/contexts/AuthContext';
import { SidebarProvider } from '@/components/ui/sidebar'; // Import SidebarProvider
import type React from 'react';

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <SidebarProvider defaultOpen={true}> {/* Add SidebarProvider here, desktop sidebar defaults to open */}
        {children}
      </SidebarProvider>
    </AuthProvider>
  );
}
