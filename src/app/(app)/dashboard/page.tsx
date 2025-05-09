"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FilePlus2, Users, CalendarDays, BarChart3, User, AlertCircle, Activity, Briefcase, ServerIcon, BarChartBig, LineChart, PieChartIcon, Filter, ShieldAlert, AlertTriangle } from "lucide-react";
import React, { useEffect, useState } from "react";
import { QuickStatsCard } from "@/components/dashboard/QuickStatsCard";
import { UpcomingAppointmentsWidget } from "@/components/dashboard/UpcomingAppointmentsWidget";
import { RecentActivitiesWidget } from "@/components/dashboard/RecentActivitiesWidget";
import { AnalyticsPlaceholderWidget } from "@/components/dashboard/AnalyticsPlaceholderWidget";
import { BillingSummaryWidget } from "@/components/dashboard/BillingSummaryWidget";
import { SystemHealthWidget } from "@/components/dashboard/SystemHealthWidget";
import { AppointmentCalendarWidget } from "@/components/dashboard/AppointmentCalendarWidget";
import { Skeleton } from "@/components/ui/skeleton";
import type { Appointment, RecentActivity, PatientsByConditionData, Patient } from "@/lib/dashboard-data";
import {
  getTotalPatientsCount,
  getTodaysAppointmentsCount,
  getPendingBillsCount,
  getCriticalAlertsCount, // This can be adapted for high-risk patients
  getUpcomingAppointments,
  getRecentActivities,
  getPatientsByCondition,
  // getHighRiskPatients, // Placeholder function if we decide to implement
} from "@/lib/dashboard-data";
import type { ChartConfig } from "@/components/ui/chart";
import { HighRiskPatientsWidget } from "@/components/dashboard/HighRiskPatientsWidget"; // New Widget
import { db } from "@/lib/firebase"; // Import db to check availability
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"; // Import Alert components


interface DashboardData {
  totalPatients: number;
  todaysAppointments: number;
  pendingBills: number;
  criticalAlerts: number; // Can be used for high-risk patient count
  upcomingAppointments: Appointment[];
  recentActivities: RecentActivity[];
  patientsByCondition: PatientsByConditionData[];
  highRiskPatients: Patient[]; // Added for new widget
}

export default function DashboardPage() {
  const { user, role } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null); // State for fetch errors
  const isDbAvailable = !!db; // Check if db is initialized

  useEffect(() => {
    async function fetchData() {
      if (!user) return;

      setLoadingData(true);
      setFetchError(null); // Reset error on new fetch

      // Check if db service is available before fetching
       if (!isDbAvailable) {
          setFetchError("Database service is unavailable. Cannot load dashboard data.");
          setLoadingData(false);
          return;
       }

      try {
        // Simulate fetching high-risk patients for now
        // In a real scenario, fetch this from Firestore based on tags or criteria
        const highRiskPatientsData: Patient[] = role === 'doctor' || role === 'admin' ? [
            // Example mock data (replace with actual fetch logic based on 'tags' field)
            // { id: "p001", name: "John Doe (High IOP)", dob: "1960-01-01", tags: ["Glaucoma Suspect"], createdAt: new Date() },
            // { id: "p002", name: "Jane Smith (DR Stage II)", dob: "1975-05-15", tags: ["Diabetic Retinopathy"], createdAt: new Date() },
        ] : [];


        const [
          totalPatients,
          todaysAppointments,
          pendingBills,
          criticalAlerts, // Represents count of patients with critical tags
          upcomingAppointments,
          recentActivities,
          patientsByCondition,
        ] = await Promise.all([
          getTotalPatientsCount(),
          getTodaysAppointmentsCount(),
          getPendingBillsCount(), // Placeholder
          getCriticalAlertsCount(), // Fetches count based on tags like 'High Risk'
          getUpcomingAppointments(10), // Fetch more to allow for client-side filtering for doctors
          getRecentActivities(5),
          getPatientsByCondition(),
        ]);

        let filteredUpcomingAppointments = upcomingAppointments;
        if (role === 'doctor' && user?.displayName) {
            filteredUpcomingAppointments = upcomingAppointments.filter(
                apt => apt.doctorName === user.displayName
            ).slice(0,5); // Take top 5 after filtering
        } else {
            filteredUpcomingAppointments = upcomingAppointments.slice(0,5); // For other roles, take top 5 as before
        }


        setDashboardData({
          totalPatients,
          todaysAppointments,
          pendingBills,
          criticalAlerts,
          upcomingAppointments: filteredUpcomingAppointments,
          recentActivities,
          patientsByCondition,
          highRiskPatients: highRiskPatientsData, // Add fetched high-risk patients
        });
      } catch (error: any) {
        console.error("Failed to load dashboard data", error);
        setFetchError(`Failed to load dashboard data: ${error.message}`);
      } finally {
        setLoadingData(false);
      }
    }
    fetchData();
  }, [user, role, isDbAvailable]); // Add isDbAvailable to dependencies


  if (!user) {
    // Auth context might still be loading the user or user is not logged in
    return (
      <div className="container mx-auto py-8 flex justify-center">
         {/* Optionally show a loader or message */}
         <Skeleton className="h-10 w-1/2" />
      </div>
    );
  }

  const getRoleSpecificGreeting = () => {
    switch (role) {
      case "doctor":
        return "Manage your patients, appointments, analyze diagnostic scans, and monitor high-risk cases.";
      case "patient":
        return "View your appointments, medical records, and manage your profile.";
      case "receptionist":
        return "Manage patient registrations and appointments.";
      case "admin":
        return "Oversee the entire system, manage users, and view analytics.";
      default:
        return "Welcome to your Vision Care Plus dashboard.";
    }
  };

  const quickActions = [
    { title: "New Patient Record", icon: FilePlus2, href: "/patients/new", roles: ["doctor", "receptionist", "admin"] },
    { title: "Manage Patients", icon: Users, href: "/patients", roles: ["doctor", "receptionist", "admin"] },
    { title: "Schedule Appointment", icon: CalendarDays, href: "/appointments/new", roles: ["doctor", "receptionist", "admin", "patient"] },
    { title: "View Appointments", icon: CalendarDays, href: "/appointments", roles: ["doctor", "receptionist", "admin", "patient"] },
    { title: "Analyze Eye Scan", icon: BarChart3, href: "/analyze-scan", roles: ["doctor", "admin"] },
  ];

  const availableActions = quickActions.filter(action => role && action.roles.includes(role));

  // Derive chart config safely, handling potentially null dashboardData or empty array
   const patientsByConditionChartConfig = React.useMemo(() => {
    const config: ChartConfig = { count: { label: "Patients" } };
    dashboardData?.patientsByCondition?.forEach((cur, index) => {
      // Generate distinct colors, ensure cur.condition is a valid string key
      if (typeof cur.condition === 'string' && cur.condition.trim()) {
         config[cur.condition] = { label: cur.condition, color: `hsl(var(--chart-${(index % 5) + 1}))` };
      }
    });
    return config;
  }, [dashboardData?.patientsByCondition]);

  // Derive chart data safely
  const patientsByConditionChartData = React.useMemo(() =>
    dashboardData?.patientsByCondition
        ?.filter(d => typeof d.condition === 'string' && typeof d.count === 'number') // Ensure data is valid
        .map(d => ({ name: d.condition, count: d.count })) || [],
   [dashboardData?.patientsByCondition]);


  return (
    <div className="container mx-auto py-10 px-4 space-y-8">
      <Card className="bg-secondary/50 border-none shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary">Welcome, {user.displayName || user.email}!</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">{getRoleSpecificGreeting()}</CardDescription>
        </CardHeader>
      </Card>

      {availableActions.length > 0 && (
        <div>
            <h2 className="text-2xl font-semibold text-foreground mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {availableActions.map((action) => (
                <Card key={action.title} className="hover:shadow-lg transition-shadow duration-300">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg font-medium text-primary">{action.title}</CardTitle>
                    <action.icon className="h-6 w-6 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                    <p className="text-xs text-muted-foreground mb-4">
                        Quick access to {action.title.toLowerCase()}.
                    </p>
                    {/* Disable button if DB is unavailable and action likely needs it */}
                    <Button asChild className="w-full" disabled={!isDbAvailable && (action.href.includes('patients') || action.href.includes('appointments'))}>
                        <Link href={action.href}>Go to {action.title}</Link>
                    </Button>
                    </CardContent>
                </Card>
                ))}
            </div>
        </div>
      )}

      {/* Display Error if fetching failed */}
        {fetchError && !loadingData && (
            <Alert variant="destructive" className="mt-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error Loading Dashboard Data</AlertTitle>
                <AlertDescription>{fetchError}</AlertDescription>
            </Alert>
        )}

      <div>
        <h2 className="text-2xl font-semibold text-foreground mb-6 mt-10">Overview</h2>

        {loadingData ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)}
            </div>
        ) : dashboardData && !fetchError ? ( // Show stats only if data loaded and no error
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            {(role === 'admin' || role === 'doctor' || role === 'receptionist') && (
              <QuickStatsCard title="Total Patients" value={dashboardData.totalPatients} icon={Users} />
            )}
            {(role === 'admin' || role === 'doctor' || role === 'receptionist') && (
              <QuickStatsCard title="Today's Appointments" value={dashboardData.todaysAppointments} icon={CalendarDays} />
            )}
            {(role === 'admin' || role === 'receptionist') && ( // Doctors typically don't see pending bills on main dashboard
              <QuickStatsCard title="Pending Bills" value={dashboardData.pendingBills} icon={Briefcase} description="Feature in development" />
            )}
            {(role === 'admin' || role === 'doctor') && ( // For doctors, this shows count of high-risk patients
               <QuickStatsCard
                  title={role === 'doctor' ? "High-Risk Patients" : "Critical System Alerts"}
                  value={dashboardData.criticalAlerts} // Use the count from getCriticalAlertsCount
                  icon={role === 'doctor' ? ShieldAlert : AlertCircle}
                  description={role === 'doctor' ? "Needs follow-up" : "Count from critical tags"}
                />
            )}
          </div>
        ) : !loadingData && !fetchError && ( // Handle case where data is null but no error (e.g., initial state)
           <p className="text-muted-foreground">No overview data available.</p>
        )}

        {(role === 'admin' || role === 'doctor' || role === 'receptionist') && (
          loadingData ? <Skeleton className="h-[450px] mb-8" /> :
          !fetchError ? <AppointmentCalendarWidget /> : null // Show only if no error
        )}


        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 mt-8">
          <div className="lg:col-span-2 space-y-8">
            {loadingData ? (
                <Skeleton className="h-96" />
            ) : dashboardData && !fetchError && (role === 'admin' || role === 'doctor' || role === 'receptionist') ? (
              <UpcomingAppointmentsWidget appointments={dashboardData.upcomingAppointments} />
            ) : !loadingData && !fetchError && ( // Handle empty state
                <p className="text-muted-foreground">No upcoming appointments.</p>
            )}

            {(role === 'admin' || role === 'doctor') && (
              loadingData ? <Skeleton className="h-64" /> :
              !fetchError ? (
                  <AnalyticsPlaceholderWidget
                    title="Patients by Condition"
                    icon={PieChartIcon}
                    description="Distribution of patients based on their tagged conditions."
                    chartType="pie"
                    // Ensure data and config are passed only when available
                    data={patientsByConditionChartData.length > 0 ? patientsByConditionChartData : undefined}
                    chartConfig={Object.keys(patientsByConditionChartConfig).length > 1 ? patientsByConditionChartConfig : undefined} // Ensure more than just 'count' key exists
                    categoryKey="name"
                    dataKey="count"
                  />
              ) : null // Don't render if error
            )}

             {/* High-Risk Patients Widget for Doctors and Admins */}
            {(role === 'admin' || role === 'doctor') && (
              loadingData ? <Skeleton className="h-80 mt-8" /> :
              dashboardData?.highRiskPatients && !fetchError ? <HighRiskPatientsWidget patients={dashboardData.highRiskPatients} /> :
              !loadingData && !fetchError && <p className="text-muted-foreground">No high-risk patients data available.</p>
            )}

          </div>

          <div className="lg:col-span-1 space-y-8">
            {loadingData ? (
                <Skeleton className="h-80" />
            ) : dashboardData && !fetchError && (role === 'admin' || role === 'doctor' || role === 'receptionist') ? (
              <RecentActivitiesWidget activities={dashboardData.recentActivities} />
            ) : !loadingData && !fetchError && (
               <p className="text-muted-foreground">No recent activities.</p>
            )}

            {/* Billing Summary only for Admin and Receptionist */}
            {(role === 'admin' || role === 'receptionist') && (
                 loadingData ? <Skeleton className="h-72" /> :
                 !fetchError ? <BillingSummaryWidget /> : null
            )}

            {role === 'admin' && (
                 loadingData ? <Skeleton className="h-64" /> :
                 !fetchError ? (
                    <SystemHealthWidget
                        lastBackup="Today, 02:00 AM" // Placeholder - fetch dynamically if needed
                        activeIntegrations={[{name: 'Twilio SMS', status: 'active'}, {name: 'Payment Gateway', status: 'error'}, { name: 'OCT Device Sync', status: 'inactive'}]} // Placeholder
                        errorLogsCount={2} // Placeholder
                    />
                  ) : null
            )}
          </div>
        </div>
      </div>

      {/* Role Specific Sections - Show only if no loading/error */}
      {!loadingData && !fetchError && (
          <>
            {role === "doctor" && (
                <Card className="mt-8">
                <CardHeader>
                    <CardTitle>Doctor's Corner</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>Review your upcoming schedule, patient alerts, and AI-assisted diagnostic summaries.</p>
                    {/* Filter doctor specific upcoming appointments for display here */}
                    {dashboardData?.upcomingAppointments && dashboardData.upcomingAppointments.length > 0 ? (
                        <div className="mt-4">
                            <h3 className="font-semibold mb-2">Your Upcoming Appointments:</h3>
                            <ul className="space-y-2">
                            {dashboardData.upcomingAppointments.map(apt => (
                                <li key={apt.id} className="text-sm p-2 bg-secondary/50 rounded-md">{apt.date} at {apt.time} with {apt.patientName}</li>
                            ))}
                            </ul>
                        </div>
                    ) : (
                        <p className="text-muted-foreground mt-4">You have no upcoming appointments today based on current filters.</p>
                    )}
                    <Button asChild className="mt-4">
                        <Link href="/analyze-scan">Access AI Diagnostic Tools</Link>
                    </Button>
                </CardContent>
                </Card>
            )}
            {role === "patient" && (
                <Card className="mt-8">
                <CardHeader>
                    <CardTitle>Patient Portal</CardTitle>
                </CardHeader>
                <CardContent>
                    <p>View your upcoming appointments and recent medical records.</p>
                    {dashboardData?.upcomingAppointments && dashboardData.upcomingAppointments.filter(apt => apt.patientName === user.displayName || apt.patientName === user.email).length > 0 ? (
                        <div className="mt-4">
                            <h3 className="font-semibold mb-2">Your Upcoming Appointments:</h3>
                            <ul className="space-y-2">
                            {dashboardData.upcomingAppointments.filter(apt => apt.patientName === user.displayName || apt.patientName === user.email).map(apt => (
                                <li key={apt.id} className="text-sm p-2 bg-secondary/50 rounded-md">{apt.date} at {apt.time} with {apt.doctorName}</li>
                            ))}
                            </ul>
                        </div>
                    ) : (
                        <p className="text-muted-foreground mt-4">You have no upcoming appointments.</p>
                    )}
                </CardContent>
                </Card>
            )}
          </>
      )}

    </div>
  );
}
