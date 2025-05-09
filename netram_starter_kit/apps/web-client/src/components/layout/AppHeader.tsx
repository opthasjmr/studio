
// Placeholder for AppHeader component
// src/components/layout/AppHeader.tsx
"use client";

import Link from 'next/link';

export function AppHeader() {
  // Basic header, can be expanded with navigation, user profile, etc.
  return (
    <header className="bg-gray-800 text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-xl font-bold">
          Vision Care Plus
        </Link>
        <nav>
          <Link href="/dashboard" className="px-3 hover:text-gray-300">
            Dashboard
          </Link>
          <Link href="/login" className="px-3 hover:text-gray-300">
            Login
          </Link>
          {/* Add more navigation items here */}
        </nav>
      </div>
    </header>
  );
}

