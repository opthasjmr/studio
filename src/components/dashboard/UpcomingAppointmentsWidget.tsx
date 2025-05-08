
"use client";
import type React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CalendarClock, ListChecks, ArrowRight, Users } from "lucide-react";
import type { Appointment } from "@/lib/dashboard-data";
import { format, parseISO } from 'date-fns';

interface UpcomingAppointmentsWidgetProps {
  appointments: Appointment[];
}

export function UpcomingAppointmentsWidget({ appointments }: UpcomingAppointmentsWidgetProps) {
  return (
    <Card className="shadow-lg col-span-1 md:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold text-primary flex items-center">
              <CalendarClock className="mr-2 h-6 w-6" />
              Upcoming Appointments
            </CardTitle>
            <CardDescription>Your next few scheduled appointments.</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/appointments">
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {appointments.length === 0 ? (
          <div className="text-center py-6">
            <ListChecks className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">No upcoming appointments scheduled.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {appointments.map((apt) => (
              <li key={apt.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-secondary/50 rounded-md hover:bg-secondary/70 transition-colors">
                <div>
                  <p className="font-semibold text-primary">{apt.patientName}</p>
                  <p className="text-sm text-muted-foreground">
                    With: {apt.doctorName}
                  </p>
                </div>
                <div className="text-sm text-muted-foreground mt-1 sm:mt-0 sm:text-right">
                   <p>{format(parseISO(apt.date), 'EEE, MMM d, yyyy')} at {apt.time}</p>
                   <span className={`px-2 py-0.5 text-xs rounded-full ${apt.status === 'Confirmed' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {apt.status}
                   </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
