
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AlertTriangle, ClipboardList, Users, CalendarClock, MessageCircle } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { AISchedulerWidget } from "@/components/reception/AISchedulerWidget";
import { VoiceInputPlaceholder } from "@/components/reception/VoiceInputPlaceholder";
import { RealtimeQueueWidget } from "@/components/reception/RealtimeQueueWidget";
import { DigitalFormsKioskWidget } from "@/components/reception/DigitalFormsKioskWidget";
import { TodayAppointmentsWidget } from "@/components/reception/TodayAppointmentsWidget";
import { DoctorAvailabilityWidget } from "@/components/reception/DoctorAvailabilityWidget";


export default function ReceptionDashboardPage() {
  const { user, role } = useAuth();

  if (role !== "receptionist" && role !== "admin") {
    return (
      <div className="container mx-auto py-10 px-4 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
        <h1 className="mt-4 text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground">
          You do not have permission to view this page.
        </p>
        <Button onClick={() => window.history.back()} className="mt-6">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4 space-y-8">
      <Card className="bg-secondary/50 border-none shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary flex items-center">
            <ClipboardList className="mr-3 h-8 w-8" />
            Reception Dashboard
          </CardTitle>
          <CardDescription className="text-lg text-muted-foreground">
            Manage patient registrations, appointments, and clinic flow.
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-primary flex items-center">
              <Users className="mr-2 h-5 w-5" /> Patient Registration
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Register new patients or update existing records.
            </p>
            <Button asChild className="w-full">
              <Link href="/patients/new">Add New Patient</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-primary flex items-center">
              <CalendarClock className="mr-2 h-5 w-5" /> Manage Appointments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
              Schedule, view, or modify patient appointments.
            </p>
            <Button asChild className="w-full">
              <Link href="/appointments">View Calendar</Link>
            </Button>
          </CardContent>
        </Card>
         <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-primary flex items-center">
              <MessageCircle className="mr-2 h-5 w-5" /> Communication
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-3">
             Handle patient queries and internal messages. (Feature Placeholder)
            </p>
            <Button className="w-full" disabled>Open Messages</Button>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TodayAppointmentsWidget />
        <DoctorAvailabilityWidget />
      </div>

      <div>
        <h2 className="text-2xl font-semibold text-foreground mb-6 mt-10">
          Smart Tools & Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AISchedulerWidget />
          <VoiceInputPlaceholder />
          <RealtimeQueueWidget />
          <DigitalFormsKioskWidget />
        </div>
      </div>
    </div>
  );
}
