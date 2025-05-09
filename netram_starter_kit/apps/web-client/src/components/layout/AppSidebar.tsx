// Placeholder for AppSidebar component
// src/components/layout/AppSidebar.tsx
"use client";

import Link from 'next/link';

export function AppSidebar() {
  // Basic sidebar, can be expanded with menu items, icons, etc.
  // This would typically be part of a layout component that wraps pages.
  return (
    <aside className="w-64 bg-gray-100 p-4 h-screen fixed top-0 left-0">
      <nav>
        <ul>
          <li>
            <Link href="/dashboard" className="block py-2 px-3 hover:bg-gray-200 rounded">
              Dashboard
            </Link>
          </li>
          <li>
            <Link href="/patients" className="block py-2 px-3 hover:bg-gray-200 rounded">
              Patients
            </Link>
          </li>
          <li>
            <Link href="/appointments" className="block py-2 px-3 hover:bg-gray-200 rounded">
              Appointments
            </Link>
          </li>
          {/* Add more sidebar navigation items here */}
        </ul>
      </nav>
    </aside>
  );
}
