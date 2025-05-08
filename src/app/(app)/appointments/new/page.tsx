"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function NewAppointmentPage() {
  const router = useRouter();
  return (
    <div className="container mx-auto py-10 px-4 max-w-2xl">
       <Button onClick={() => router.back()} variant="outline" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary flex items-center">
            <PlusCircle className="mr-3 h-8 w-8" /> Schedule New Appointment
          </CardTitle>
          <CardDescription className="text-lg mt-1">
            Fill in the details to book a new appointment.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Appointment scheduling form will be here.</p>
          {/* 
            Form fields to include:
            - Patient selection (search or dropdown)
            - Doctor selection
            - Date and Time selection (Calendar and time slots)
            - Appointment type (e.g., Consultation, Follow-up, Scan)
            - Notes (optional)
          */}
           <div className="mt-6 flex justify-end space-x-3">
                <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
                </Button>
                <Button type="submit" disabled> {/* Make enabled when form is ready */}
                  Save Appointment
                </Button>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}
