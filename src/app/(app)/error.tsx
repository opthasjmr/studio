
"use client"; // Error components must be Client Components

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[calc(100vh-10rem)] items-center justify-center p-4">
      <Card className="w-full max-w-lg text-center shadow-xl">
        <CardHeader>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 mb-4">
            <AlertTriangle className="h-10 w-10 text-destructive" />
          </div>
          <CardTitle className="text-2xl font-bold text-destructive">
            Oops! Something Went Wrong
          </CardTitle>
          <CardDescription className="text-md mt-2 text-muted-foreground">
            We encountered an unexpected issue. Please try again.
          </CardDescription>
        </CardHeader>
        <CardContent className="mt-4">
          <p className="mb-6 text-sm text-muted-foreground">
            Error: {error.message || "An unknown error occurred."}
          </p>
          <Button
            onClick={
              // Attempt to recover by trying to re-render the segment
              () => reset()
            }
            size="lg"
            className="bg-destructive hover:bg-destructive/90"
          >
            <RefreshCw className="mr-2 h-5 w-5" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
