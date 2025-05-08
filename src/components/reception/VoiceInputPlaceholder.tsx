
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mic } from "lucide-react";

export function VoiceInputPlaceholder() {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Mic className="h-6 w-6 text-primary" />
          <CardTitle className="text-xl font-semibold">Voice-Activated Booking</CardTitle>
        </div>
        <CardDescription>
          Use voice commands to schedule appointments quickly.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Example: "Book an appointment for John Doe with Dr. Smith tomorrow at 10 AM."
        </p>
        <Button disabled className="w-full">Enable Voice Assistant (Coming Soon)</Button>
      </CardContent>
    </Card>
  );
}
