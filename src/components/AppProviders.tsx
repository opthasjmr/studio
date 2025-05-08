"use client";

import { AuthProvider } from '@/contexts/AuthContext';
import type React from 'react';

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
    </AuthProvider>
  );
}
