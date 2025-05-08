
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CalendarDays, PlusCircle } from "lucide-react";

export default function AppointmentsPage() {
  // Placeholder data - replace with actual data fetching
  const appointments = [
    // { id: "1", patientName: "John Doe", doctorName: "Dr. Smith", date: "2024-07-30", time: "10:00 AM", status: "Confirmed" },
    // { id: "2", patientName: "Jane Roe", doctorName: "Dr. Emily", date: "2024-07-31", time: "02:30 PM", status: "Pending" },
  ];

  return (
    <div className="container mx-auto py-10 px-4"> {/* Ensure consistent padding */}
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
            <CardTitle className="text-3xl font-bold text-primary flex items-center">
                <CalendarDays className="mr-3 h-8 w-8" /> Appointments
              </CardTitle>
              <CardDescription className="text-lg mt-1">
                Manage and view upcoming and past appointments.
              </CardDescription>
            </div>
            <Button asChild className="mt-4 md:mt-0">
              <Link href="/appointments/new">
                 <PlusCircle className="mr-2 h-5 w-5" /> Schedule New Appointment
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {appointments.length === 0 ? (
            <div className="text-center py-10">
              <CalendarDays className="mx-auto h-12 w-12 text-muted-foreground" />
              <h3 className="mt-2 text-xl font-semibold">No Appointments Found</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Get started by scheduling a new appointment.
              </p>
              <Button asChild className="mt-6">
                <Link href="/appointments/new"><PlusCircle className="mr-2 h-4 w-4" />Schedule Appointment</Link>
              </Button>
            </div>
          ) : (
            <p className="text-muted-foreground">Appointment list will be displayed here.</p>
            // Implement DataTable or custom list for appointments
          )}
        </CardContent>
      </Card>
    </div>
  );
}
