
import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
// import { GeistMono } from 'geist/font/mono'; // Removed as it's not explicitly used and might be causing issues
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import AppProviders from '@/components/AppProviders';

export const metadata: Metadata = {
  title: 'Netram Vision',
  description: 'Advanced Eye Health Care Software',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${GeistSans.variable} font-sans antialiased`}> {/* Use GeistSans variable for global application */}
        <AppProviders>
          {children}
          <Toaster />
        </AppProviders>
      </body>
    </html>
  );
}
