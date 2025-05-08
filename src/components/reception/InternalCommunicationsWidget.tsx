
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Send } from "lucide-react";

export function InternalCommunicationsWidget() {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <MessageSquare className="h-6 w-6 text-primary" />
          <CardTitle className="text-xl font-semibold">Internal Messaging</CardTitle>
        </div>
        <CardDescription>
          Communicate with doctors, nurses, and other departments.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 mb-4">
            {/* Example recent message - replace with actual data */}
            <div className="p-2 bg-secondary/50 rounded-md text-sm">
                <span className="font-semibold text-primary">Dr. Smith:</span> "Please inform patient John Doe I am running 15 mins late."
                <p className="text-xs text-muted-foreground">2 mins ago</p>
            </div>
             <div className="p-2 bg-secondary/50 rounded-md text-sm">
                <span className="font-semibold text-primary">Billing Dept:</span> "Invoice #12345 ready for Mrs. Anya Sharma."
                 <p className="text-xs text-muted-foreground">10 mins ago</p>
            </div>
        </div>
        <Button disabled className="w-full">
            <Send className="mr-2 h-4 w-4" /> Open Full Chat (Coming Soon)
        </Button>
      </CardContent>
    </Card>
  );
}
