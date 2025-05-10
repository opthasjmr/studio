"use client";

import type React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import { Button } from '@/components/ui/button';

export function PatientMessagesWidget() {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-primary flex items-center">
          <MessageSquare className="mr-2 h-5 w-5" />
          Messages
        </CardTitle>
        <CardDescription>Secure communication with your care team.</CardDescription>
      </CardHeader>
      <CardContent className="text-center">
        <p className="text-sm text-muted-foreground mb-4">View messages from your doctor or send a new query.</p>
        <Button className="w-full" variant="outline" disabled>
            <MessageSquare className="mr-2 h-4 w-4"/> Open Messages (Coming Soon)
        </Button>
      </CardContent>
    </Card>
  );
}
