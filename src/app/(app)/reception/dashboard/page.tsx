
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AlertTriangle, ClipboardList, Users, CalendarClock, Search, PlusCircle, LineChart, MessageSquare, UsersRound, History } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

// Existing Widgets
import { AISchedulerWidget } from "@/components/reception/AISchedulerWidget";
import { VoiceInputPlaceholder } from "@/components/reception/VoiceInputPlaceholder";
import { RealtimeQueueWidget } from "@/components/reception/RealtimeQueueWidget";
import { DigitalFormsKioskWidget } from "@/components/reception/DigitalFormsKioskWidget";
import { TodayAppointmentsWidget } from "@/components/reception/TodayAppointmentsWidget";
import { DoctorAvailabilityWidget } from "@/components/reception/DoctorAvailabilityWidget";

// New Placeholder Widgets
import { ReceptionPatientSearchWidget } from "@/components/reception/ReceptionPatientSearchWidget";
import { UrgentCareAlertsWidget } from "@/components/reception/UrgentCareAlertsWidget";
import { FacialRecognitionWidget } from "@/components/reception/FacialRecognitionWidget";
import { NoShowPredictionWidget } from "@/components/reception/NoShowPredictionWidget";
import { ReceptionReportsLinkWidget } from "@/components/reception/ReceptionReportsLinkWidget";
import { InternalCommunicationsWidget } from "@/components/reception/InternalCommunicationsWidget";
import { VisitorManagementWidget } from "@/components/reception/VisitorManagementWidget";


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
            Manage patient registrations, appointments, clinic flow, and utilize smart tools.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Section 1: Overview & Alerts */}
      <section>
        <h2 className="text-2xl font-semibold text-foreground mb-4">Today's Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <TodayAppointmentsWidget />
          <DoctorAvailabilityWidget />
          <UrgentCareAlertsWidget />
        </div>
      </section>

      {/* Section 2: Core Actions */}
      <section>
        <h2 className="text-2xl font-semibold text-foreground mb-4">Core Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
          <ReceptionPatientSearchWidget />
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
                <Link href="/patients/new"><PlusCircle className="mr-2 h-4 w-4" />Add New Patient</Link>
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
                <Link href="/appointments"><CalendarClock className="mr-2 h-4 w-4" />View Full Calendar</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>
      
      {/* Section 3: Smart Tools & Features */}
      <section>
        <h2 className="text-2xl font-semibold text-foreground mb-6 mt-10">
          Smart Tools & Features
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AISchedulerWidget />
          <VoiceInputPlaceholder />
          <FacialRecognitionWidget />
          <NoShowPredictionWidget />
          <DigitalFormsKioskWidget />
          <RealtimeQueueWidget />
        </div>
      </section>

      {/* Section 4: Administrative & Communication Tools */}
      <section>
        <h2 className="text-2xl font-semibold text-foreground mb-6 mt-10">
          Administrative & Communication
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <ReceptionReportsLinkWidget />
          <InternalCommunicationsWidget />
          <VisitorManagementWidget />
        </div>
      </section>

    </div>
  );
}
