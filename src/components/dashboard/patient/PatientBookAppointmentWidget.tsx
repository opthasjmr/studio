"use client";

import type React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CalendarPlus } from "lucide-react";
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function PatientBookAppointmentWidget() {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-primary flex items-center">
          <CalendarPlus className="mr-2 h-5 w-5" />
          Book New Appointment
        </CardTitle>
        <CardDescription>Schedule your next visit with ease.</CardDescription>
      </CardHeader>
      <CardContent className="text-center">
         <p className="text-sm text-muted-foreground mb-4">Find available slots and book with your preferred doctor.</p>
        <Button className="w-full" asChild>
            <Link href="/appointments/new">
                <CalendarPlus className="mr-2 h-4 w-4"/> Schedule Now
            </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
