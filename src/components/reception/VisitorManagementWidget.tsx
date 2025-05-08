
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UsersRound, ClipboardPlus } from "lucide-react";

export function VisitorManagementWidget() {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <UsersRound className="h-6 w-6 text-primary" />
          <CardTitle className="text-xl font-semibold">Visitor Log</CardTitle>
        </div>
        <CardDescription>
          Manage non-patient visitors (e.g., reps, guests).
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Keep a log of visitors, issue temporary badges, and manage access to specific areas if needed.
        </p>
        <div className="space-y-2">
            <Button disabled className="w-full">
                <ClipboardPlus className="mr-2 h-4 w-4" /> Register New Visitor (Coming Soon)
            </Button>
            <Button variant="outline" disabled className="w-full">View Visitor Log (Coming Soon)</Button>
        </div>
      </CardContent>
    </Card>
  );
}
