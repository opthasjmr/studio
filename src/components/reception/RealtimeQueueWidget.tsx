
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users } from "lucide-react";

export function RealtimeQueueWidget() {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Users className="h-6 w-6 text-primary" />
          <CardTitle className="text-xl font-semibold">Real-Time Queue Management</CardTitle>
        </div>
        <CardDescription>
          Monitor patient wait times and send automated updates.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Display live wait times and notify patients when their turn is approaching via SMS or in-app alerts.
        </p>
        <Button disabled className="w-full">View Live Queue (Coming Soon)</Button>
      </CardContent>
    </Card>
  );
}
