
import type { Metadata } from 'next';
import { Inter } from 'next/font/google'; // Example font
import './globals.css'; // Assuming you'll create a globals.css

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Vision Care Plus Web Client',
  description: 'Vision Care Plus Eye Health Platform - Web Application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {/* 
          Consider adding Providers here for:
          - AuthContext
          - ThemeProvider (e.g., for light/dark mode)
          - React Query Provider
          - ShadCN Toaster
        */}
        {children}
      </body>
    </html>
  );
}

