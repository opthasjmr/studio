
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tablet } from "lucide-react";

export function DigitalFormsKioskWidget() {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Tablet className="h-6 w-6 text-primary" />
          <CardTitle className="text-xl font-semibold">Digital Patient Forms</CardTitle>
        </div>
        <CardDescription>
          Enable paperless patient intake with a digital kiosk mode.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Allow walk-in patients to complete their registration forms digitally on a tablet, syncing directly with the EMR.
        </p>
        <Button disabled className="w-full">Launch Kiosk Mode (Coming Soon)</Button>
      </CardContent>
    </Card>
  );
}
