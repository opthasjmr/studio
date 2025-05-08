
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertTriangle, Home, LayoutDashboard } from 'lucide-react';
import { SiteLogo } from '@/components/SiteLogo';

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-secondary p-4">
      <Card className="w-full max-w-lg shadow-xl text-center">
        <CardHeader>
          <div className="mx-auto mb-6 flex justify-center">
            <SiteLogo />
          </div>
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 mb-4">
            <AlertTriangle className="h-12 w-12 text-destructive" />
          </div>
          <CardTitle className="text-4xl font-bold text-destructive">404 - Page Not Found</CardTitle>
          <CardDescription className="text-xl mt-2 text-muted-foreground">
            Oops! The page you are looking for does not exist, may have been moved, or you do not have permission to view it.
          </CardDescription>
        </CardHeader>
        <CardContent className="mt-4">
          <p className="mb-8 text-muted-foreground">
            Let&apos;s get you back on track. You can return to the homepage or go to your dashboard.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
              <Link href="/">
                <Home className="mr-2 h-5 w-5" />
                Go to Homepage
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/10 hover:text-primary">
              <Link href="/dashboard">
                <LayoutDashboard className="mr-2 h-5 w-5" />
                Go to Dashboard
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
