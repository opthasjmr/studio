
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb } from "lucide-react";

export function AISchedulerWidget() {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Lightbulb className="h-6 w-6 text-primary" />
          <CardTitle className="text-xl font-semibold">AI Appointment Suggestions</CardTitle>
        </div>
        <CardDescription>
          Get smart suggestions for optimal appointment slots.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Our AI analyzes patient history and doctor availability to recommend the best times, reducing conflicts and wait times.
        </p>
        <Button disabled className="w-full">Activate AI Suggestions (Coming Soon)</Button>
      </CardContent>
    </Card>
  );
}
