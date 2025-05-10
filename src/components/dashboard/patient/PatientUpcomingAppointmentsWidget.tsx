"use client";

import type React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CalendarDays, PlusCircle, ArrowRight } from "lucide-react";
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import type { Appointment } from '@/lib/dashboard-data';
import { format, parseISO } from 'date-fns';

interface PatientUpcomingAppointmentsWidgetProps {
  appointments: Appointment[];
}

export function PatientUpcomingAppointmentsWidget({ appointments }: PatientUpcomingAppointmentsWidgetProps) {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-primary flex items-center">
            <CalendarDays className="mr-2 h-5 w-5" />
            Upcoming Appointments
          </CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/appointments">View All <ArrowRight className="ml-1 h-4 w-4" /></Link>
          </Button>
        </div>
        <CardDescription>Your scheduled consultations.</CardDescription>
      </CardHeader>
      <CardContent>
        {appointments && appointments.length > 0 ? (
          <ul className="space-y-3">
            {appointments.map((apt) => (
              <li key={apt.id} className="p-3 bg-secondary/50 rounded-md">
                <div className="flex justify-between items-center">
                    <p className="font-medium text-foreground">With {apt.doctorName}</p>
                    <span className={`px-2 py-0.5 text-xs rounded-full ${apt.status === 'Confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {apt.status}
                    </span>
                </div>
                <p className="text-sm text-muted-foreground">{format(parseISO(apt.date), 'EEE, MMM d, yyyy')} at {apt.time}</p>
                <div className="mt-2 space-x-2">
                    <Button variant="outline" size="xs" disabled>Reschedule</Button>
                    <Button variant="outline" size="xs" disabled>Cancel</Button>
                    {/* <Button size="xs">Join Teleconsult</Button> */}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-4">
            <CalendarDays className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No upcoming appointments.</p>
          </div>
        )}
        <Button className="w-full mt-4" asChild>
            <Link href="/appointments/new">
                <PlusCircle className="mr-2 h-4 w-4"/> Book New Appointment
            </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
