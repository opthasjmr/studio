
import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
// import { GeistMono } from 'geist/font/mono'; // Removed as it's not explicitly used and might be causing issues
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import AppProviders from '@/components/AppProviders';

export const metadata: Metadata = {
  title: 'Vision Care Plus',
  description: 'Advanced Eye Health Care Software',
  manifest: '/manifest.json',
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#008080' }, // Primary Teal for light mode
    { media: '(prefers-color-scheme: dark)', color: '#009999' },  // Adjusted Teal for dark mode
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'VisionCarePlus', // Should match short_name in manifest.json
  },
  icons: {
    apple: [
      // Placeholder for Apple touch icon. Actual file needs to be in public/icons/
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      // Add other sizes as needed, e.g.:
      // { url: '/icons/apple-touch-icon-180x180.png', sizes: '180x180', type: 'image/png' },
    ],
    // shortcut: '/favicon.ico', // Example: if you have a favicon
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      {/* <head /> removed: Next.js automatically handles meta tags from `metadata` object here */}
      <body className={`${GeistSans.variable} font-sans antialiased`}> {/* Use GeistSans variable for global application */}
        <AppProviders>
          {children}
          <Toaster />
        </AppProviders>
      </body>
    </html>
  );
}

