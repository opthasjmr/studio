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
  getCriticalAlertsCount, 
  getUpcomingAppointments,
  getRecentActivities,
  getPatientsByCondition,
} from "@/lib/dashboard-data";
import type { ChartConfig } from "@/components/ui/chart";
import { HighRiskPatientsWidget } from "@/components/dashboard/HighRiskPatientsWidget"; 
import { db } from "@/lib/firebase"; 
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"; 

// Patient Specific Widgets
import { PatientUpcomingAppointmentsWidget } from "@/components/dashboard/patient/PatientUpcomingAppointmentsWidget";
import { PatientPrescriptionsWidget } from "@/components/dashboard/patient/PatientPrescriptionsWidget";
import { PatientUploadDocsWidget } from "@/components/dashboard/patient/PatientUploadDocsWidget";
import { PatientVisitHistoryWidget } from "@/components/dashboard/patient/PatientVisitHistoryWidget";
import { PatientBookAppointmentWidget } from "@/components/dashboard/patient/PatientBookAppointmentWidget";
import { PatientTeleconsultWidget } from "@/components/dashboard/patient/PatientTeleconsultWidget";
import { PatientMessagesWidget } from "@/components/dashboard/patient/PatientMessagesWidget";
import { PatientReportsWidget } from "@/components/dashboard/patient/PatientReportsWidget";
import { PatientBillingHistoryWidget } from "@/components/dashboard/patient/PatientBillingHistoryWidget";


interface DashboardData {
  totalPatients: number;
  todaysAppointments: number;
  pendingBills: number;
  criticalAlerts: number; 
  upcomingAppointments: Appointment[];
  recentActivities: RecentActivity[];
  patientsByCondition: PatientsByConditionData[];
  highRiskPatients: Patient[]; 
}

export default function DashboardPage() {
  const { user, role } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null); 
  const isDbAvailable = !!db; 

  useEffect(() => {
    async function fetchData() {
      if (!user) return;

      setLoadingData(true);
      setFetchError(null); 

       if (!isDbAvailable) {
          setFetchError("Database service is unavailable. Cannot load dashboard data.");
          setLoadingData(false);
          return;
       }

      // Skip fetching admin/doctor/receptionist data if user is a patient
      if (role === 'patient') {
        // For patients, we might fetch specific patient-related data for their widgets
        // For now, we'll just set dashboardData to an empty-like state or fetch patient-specific data
        try {
             const upcomingAppointments = await getUpcomingAppointments(5, user.uid); // Pass patient UID
            setDashboardData({
                totalPatients: 0, // Not relevant for patient
                todaysAppointments: 0, // Not relevant for patient
                pendingBills: 0, // Will be part of PatientBillingHistoryWidget
                criticalAlerts: 0, // Will be part of Patient alerts
                upcomingAppointments: upcomingAppointments, // Patient's own appointments
                recentActivities: [], // Patient specific activities if any
                patientsByCondition: [], // Not relevant for patient
                highRiskPatients: [], // Not relevant for patient
            });
        } catch (error: any) {
            console.error("Failed to load patient dashboard data", error);
            setFetchError(`Failed to load patient dashboard data: ${error.message}`);
        }
        setLoadingData(false);
        return;
      }


      try {
        const highRiskPatientsData: Patient[] = role === 'doctor' || role === 'admin' ? [
        ] : [];


        const [
          totalPatients,
          todaysAppointments,
          pendingBills,
          criticalAlerts, 
          upcomingAppointments,
          recentActivities,
          patientsByCondition,
        ] = await Promise.all([
          getTotalPatientsCount(),
          getTodaysAppointmentsCount(),
          getPendingBillsCount(), 
          getCriticalAlertsCount(), 
          getUpcomingAppointments(10), 
          getRecentActivities(5),
          getPatientsByCondition(),
        ]);

        let filteredUpcomingAppointments = upcomingAppointments;
        if (role === 'doctor' && user?.displayName) {
            filteredUpcomingAppointments = upcomingAppointments.filter(
                apt => apt.doctorName === user.displayName
            ).slice(0,5); 
        } else {
            filteredUpcomingAppointments = upcomingAppointments.slice(0,5); 
        }


        setDashboardData({
          totalPatients,
          todaysAppointments,
          pendingBills,
          criticalAlerts,
          upcomingAppointments: filteredUpcomingAppointments,
          recentActivities,
          patientsByCondition,
          highRiskPatients: highRiskPatientsData, 
        });
      } catch (error: any) {
        console.error("Failed to load dashboard data", error);
        setFetchError(`Failed to load dashboard data: ${error.message}`);
      } finally {
        setLoadingData(false);
      }
    }
    fetchData();
  }, [user, role, isDbAvailable]); 


  if (!user) {
    return (
      <div className="container mx-auto py-8 flex justify-center">
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

   const patientsByConditionChartConfig = React.useMemo(() => {
    const config: ChartConfig = { count: { label: "Patients" } };
    dashboardData?.patientsByCondition?.forEach((cur, index) => {
      if (typeof cur.condition === 'string' && cur.condition.trim()) {
         config[cur.condition] = { label: cur.condition, color: `hsl(var(--chart-${(index % 5) + 1}))` };
      }
    });
    return config;
  }, [dashboardData?.patientsByCondition]);

  const patientsByConditionChartData = React.useMemo(() =>
    dashboardData?.patientsByCondition
        ?.filter(d => typeof d.condition === 'string' && typeof d.count === 'number') 
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

      {/* Render Quick Actions only if not a patient and actions are available */}
      {role !== 'patient' && availableActions.length > 0 && (
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
                    <Button asChild className="w-full" disabled={!isDbAvailable && (action.href.includes('patients') || action.href.includes('appointments'))}>
                        <Link href={action.href}>Go to {action.title}</Link>
                    </Button>
                    </CardContent>
                </Card>
                ))}
            </div>
        </div>
      )}

        {fetchError && !loadingData && (
            <Alert variant="destructive" className="mt-6">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error Loading Dashboard Data</AlertTitle>
                <AlertDescription>{fetchError}</AlertDescription>
            </Alert>
        )}

      {role !== 'patient' && ( // Admin, Doctor, Receptionist View
        <div>
          <h2 className="text-2xl font-semibold text-foreground mb-6 mt-10">Overview</h2>
          {loadingData ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                  {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)}
              </div>
          ) : dashboardData && !fetchError ? ( 
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              {(role === 'admin' || role === 'doctor' || role === 'receptionist') && (
                <QuickStatsCard title="Total Patients" value={dashboardData.totalPatients} icon={Users} />
              )}
              {(role === 'admin' || role === 'doctor' || role === 'receptionist') && (
                <QuickStatsCard title="Today's Appointments" value={dashboardData.todaysAppointments} icon={CalendarDays} />
              )}
              {(role === 'admin' || role === 'receptionist') && ( 
                <QuickStatsCard title="Pending Bills" value={dashboardData.pendingBills} icon={Briefcase} description="Feature in development" />
              )}
              {(role === 'admin' || role === 'doctor') && ( 
                 <QuickStatsCard
                    title={role === 'doctor' ? "High-Risk Patients" : "Critical System Alerts"}
                    value={dashboardData.criticalAlerts} 
                    icon={role === 'doctor' ? ShieldAlert : AlertCircle}
                    description={role === 'doctor' ? "Needs follow-up" : "Count from critical tags"}
                  />
              )}
            </div>
          ) : !loadingData && !fetchError && ( 
             <p className="text-muted-foreground">No overview data available.</p>
          )}

          {(role === 'admin' || role === 'doctor' || role === 'receptionist') && (
            loadingData ? <Skeleton className="h-[450px] mb-8" /> :
            !fetchError ? <AppointmentCalendarWidget /> : null 
          )}


          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 mt-8">
            <div className="lg:col-span-2 space-y-8">
              {loadingData ? (
                  <Skeleton className="h-96" />
              ) : dashboardData && !fetchError && (role === 'admin' || role === 'doctor' || role === 'receptionist') ? (
                <UpcomingAppointmentsWidget appointments={dashboardData.upcomingAppointments} />
              ) : !loadingData && !fetchError && ( 
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
                      data={patientsByConditionChartData.length > 0 ? patientsByConditionChartData : undefined}
                      chartConfig={Object.keys(patientsByConditionChartConfig).length > 1 ? patientsByConditionChartConfig : undefined} 
                      categoryKey="name"
                      dataKey="count"
                    />
                ) : null 
              )}

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

              {(role === 'admin' || role === 'receptionist') && (
                   loadingData ? <Skeleton className="h-72" /> :
                   !fetchError ? <BillingSummaryWidget /> : null
              )}

              {role === 'admin' && (
                   loadingData ? <Skeleton className="h-64" /> :
                   !fetchError ? (
                      <SystemHealthWidget
                          lastBackup="Today, 02:00 AM" 
                          activeIntegrations={[{name: 'Twilio SMS', status: 'active'}, {name: 'Payment Gateway', status: 'error'}, { name: 'OCT Device Sync', status: 'inactive'}]} 
                          errorLogsCount={2} 
                      />
                    ) : null
              )}
            </div>
          </div>
        </div>
      )}

      {role === "patient" && (
         <div className="space-y-8 mt-8">
            <h2 className="text-2xl font-semibold text-foreground mb-2">Your Health Portal</h2>
            {loadingData ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => <Skeleton key={`patient-skeleton-${i}`} className="h-60" />)}
                </div>
            ) : !fetchError && dashboardData ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <PatientUpcomingAppointmentsWidget appointments={dashboardData.upcomingAppointments}/>
                    <PatientPrescriptionsWidget />
                    <PatientMedicalRecordsWidget /> {/* Renamed from PatientVisitHistoryWidget for clarity */}
                    <PatientBillingHistoryWidget />
                    <PatientBookAppointmentWidget />
                    <PatientUploadDocsWidget />
                    <PatientTeleconsultWidget />
                    <PatientMessagesWidget />
                    <PatientReportsWidget />
                </div>
            ) : !loadingData && fetchError && (
                 <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{fetchError || "Could not load your dashboard information."}</AlertDescription>
                 </Alert>
            )}
         </div>
      )}
    </div>
  );
}
