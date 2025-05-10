"use client";

import type React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Video } from "lucide-react";
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function PatientTeleconsultWidget() {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-primary flex items-center">
          <Video className="mr-2 h-5 w-5" />
          Teleconsultation
        </CardTitle>
        <CardDescription>Access remote consultations with your doctor.</CardDescription>
      </CardHeader>
      <CardContent className="text-center">
         <p className="text-sm text-muted-foreground mb-4">Join scheduled video calls or request a new teleconsultation.</p>
        <Button className="w-full" asChild>
            <Link href="/telemedicine">
                <Video className="mr-2 h-4 w-4"/> Go to Telemedicine Portal
            </Link>
        </Button>
        {/* Add logic here to show "Join Call" if an active consultation is scheduled */}
      </CardContent>
    </Card>
  );
}
