
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScanFace } from "lucide-react"; // Assuming ScanFace is an available icon

export function FacialRecognitionWidget() {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <ScanFace className="h-6 w-6 text-primary" />
          <CardTitle className="text-xl font-semibold">Facial Recognition Check-In</CardTitle>
        </div>
        <CardDescription>
          Speed up check-ins for returning patients using facial recognition.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          When enabled, the system can identify registered patients via webcam, pulling up their records instantly.
        </p>
        <Button disabled className="w-full">Activate Facial Recognition (Coming Soon)</Button>
        <p className="text-xs text-muted-foreground mt-2 text-center">Ensures patient consent and privacy.</p>
      </CardContent>
    </Card>
  );
}
