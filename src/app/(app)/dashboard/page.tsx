
"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FilePlus2, Users, CalendarDays, BarChart3, User, AlertCircle, Activity, Briefcase, ServerIcon, BarChartBig, LineChart, PieChartIcon, Filter, ShieldAlert, AlertTriangle, UserCog, FileSignature, ClipboardList } from "lucide-react";
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
import { PatientPrescriptionsWidget } from "@/components/dashboard/patient/PatientUploadDocsWidget";
import { PatientMedicalRecordsWidget } from "@/components/dashboard/patient/PatientVisitHistoryWidget"; // Aliased
import { PatientBookAppointmentWidget } from "@/components/dashboard/patient/PatientTeleconsultWidget";
import { PatientMessagesWidget } from "@/components/dashboard/patient/PatientReportsWidget";
import { PatientBillingHistoryWidget } from "@/components/dashboard/patient/PatientMessagesWidget";


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
  const { user, role, details } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null); 
  const isDbAvailable = !!db; 

  useEffect(() => {
    async function fetchData() {
      if (!user || !role) { // Added role check
        setLoadingData(false);
        return;
      }

      setLoadingData(true);
      setFetchError(null); 

       if (!isDbAvailable) {
          setFetchError("Database service is unavailable. Cannot load dashboard data.");
          setLoadingData(false);
          return;
       }

      if (role === 'patient') {
        try {
            const upcomingAppointments = await getUpcomingAppointments(5, user.uid);
            setDashboardData({
                totalPatients: 0, 
                todaysAppointments: 0, 
                pendingBills: 0, 
                criticalAlerts: 0, 
                upcomingAppointments: upcomingAppointments, 
                recentActivities: [], 
                patientsByCondition: [], 
                highRiskPatients: [], 
            });
        } catch (error: any) {
            console.error("Failed to load patient dashboard data", error);
            setFetchError(`Failed to load your dashboard data: ${error.message}`);
        }
        setLoadingData(false);
        return;
      }


      try {
        // Example high-risk patients, replace with actual logic if available
        const highRiskPatientsData: Patient[] = (role === 'doctor' || role === 'admin') ? [
            // {id: 'hrp1', name: 'John Doe (High Risk)', dob: '1960-01-01', tags: ['High Risk', 'Glaucoma'], createdAt: new Date() as any},
        ] : [];


        const [
          totalPatients,
          todaysAppointments,
          pendingBills,
          criticalAlerts, 
          upcomingAppointmentsData, // Renamed to avoid conflict
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

        let filteredUpcomingAppointments = upcomingAppointmentsData;
        if (role === 'doctor' && user?.displayName) {
            filteredUpcomingAppointments = upcomingAppointmentsData.filter(
                apt => apt.doctorName === user.displayName
            ).slice(0,5); 
        } else {
            filteredUpcomingAppointments = upcomingAppointmentsData.slice(0,5); 
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
    if (user && role) fetchData(); // Ensure user and role are available before fetching
    else if (!user && !role) setLoadingData(false); // If no user/role, stop loading
  }, [user, role, isDbAvailable]); 


  if (!user) { // Simpler loading state for when user/role is not yet available
    return (
      <div className="container mx-auto py-10 px-4 space-y-8">
         <Skeleton className="h-24 w-full mb-8" />
         <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => <Skeleton key={`sk-qa-${i}`} className="h-32" />)}
         </div>
      </div>
    );
  }

  const getRoleSpecificGreeting = () => {
    switch (role) {
      case "admin": return "Oversee the entire system, manage users, and view analytics.";
      case "doctor": return "Manage your patients, appointments, analyze diagnostic scans, and monitor high-risk cases.";
      case "patient": return "View your appointments, medical records, and manage your profile.";
      case "receptionist": return "Manage patient registrations, appointments, and clinic flow.";
      default: return "Welcome to your Vision Care Plus dashboard.";
    }
  };

  // Conditional actions for patients based on profile/consent status
  const patientConditionalActions = [];
  if (role === 'patient') {
    if (details?.profileComplete === false) {
      patientConditionalActions.push({ title: "Complete Your Profile", icon: UserCog, href: "/patient/complete-profile", roles: ["patient"] });
    }
    if (details?.consentSigned === false) {
      patientConditionalActions.push({ title: "Sign Consent Form", icon: FileSignature, href: "/patient/consent", roles: ["patient"] });
    }
  }


  const quickActions = [
    ...patientConditionalActions, // Add patient specific conditional actions first
    { title: "New Patient Record", icon: FilePlus2, href: "/patients/new", roles: ["doctor", "receptionist", "admin"] },
    { title: "Manage Patients", icon: Users, href: "/patients", roles: ["doctor", "receptionist", "admin"] },
    { title: "Schedule Appointment", icon: CalendarDays, href: "/appointments/new", roles: ["doctor", "receptionist", "admin", "patient"] },
    { title: "View Appointments", icon: CalendarDays, href: "/appointments", roles: ["doctor", "receptionist", "admin", "patient"] },
    { title: "Analyze Eye Scan", icon: BarChart3, href: "/analyze-scan", roles: ["doctor", "admin"] },
    { title: "Reception Dashboard", icon: ClipboardList, href: "/reception/dashboard", roles: ["receptionist", "admin"]},
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
    <div className="container mx-auto py-6 md:py-10 px-2 md:px-4 space-y-8">
      <Card className="bg-card border shadow-md"> {/* Adjusted card style */}
        <CardHeader>
          <CardTitle className="text-2xl md:text-3xl font-bold text-primary">Welcome, {user.displayName || user.email}!</CardTitle>
          <CardDescription className="text-md md:text-lg text-muted-foreground">{getRoleSpecificGreeting()}</CardHeader>
        </CardHeader>
      </Card>

      {availableActions.length > 0 && ( // Show quick actions for all roles if available
        <div>
            <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {availableActions.map((action) => (
                <Card key={action.title} className="hover:shadow-lg transition-shadow duration-300 bg-card">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-md md:text-lg font-medium text-primary">{action.title}</CardTitle>
                    <action.icon className="h-5 w-5 md:h-6 md:w-6 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                    <p className="text-xs text-muted-foreground mb-3">
                        Quick access to {action.title.toLowerCase()}.
                    </p>
                    <Button asChild className="w-full" size="sm" disabled={!isDbAvailable && (action.href.includes('patients') || action.href.includes('appointments'))}>
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
          <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-6 mt-10">Clinic Overview</h2>
          {loadingData ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                  {[...Array(4)].map((_, i) => <Skeleton key={`qs-skel-${i}`} className="h-32 rounded-lg" />)}
              </div>
          ) : dashboardData && !fetchError ? ( 
            <div className="grid grid-cols-1 gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              {(role === 'admin' || role === 'doctor' || role === 'receptionist') && (
                <QuickStatsCard title="Total Patients" value={dashboardData.totalPatients} icon={Users} />
              )}
              {(role === 'admin' || role === 'doctor' || role === 'receptionist') && (
                <QuickStatsCard title="Today's Appointments" value={dashboardData.todaysAppointments} icon={CalendarDays} />
              )}
              {(role === 'admin' || role === 'receptionist') && ( 
                <QuickStatsCard title="Pending Bills" value={dashboardData.pendingBills} icon={Briefcase} description={!isDbAvailable ? "DB Unavailable" : "Feature in development"} />
              )}
              {(role === 'admin' || role === 'doctor') && ( 
                 <QuickStatsCard
                    title={role === 'doctor' ? "High-Risk Alerts" : "Critical System Alerts"}
                    value={dashboardData.criticalAlerts} 
                    icon={role === 'doctor' ? ShieldAlert : AlertCircle}
                    description={!isDbAvailable ? "DB Unavailable" : (role === 'doctor' ? "Needs follow-up" : "Count from critical tags")}
                  />
              )}
            </div>
          ) : !loadingData && !fetchError && ( 
             <p className="text-muted-foreground text-center py-4">No overview data available.</p>
          )}

          {(role === 'admin' || role === 'doctor' || role === 'receptionist') && (
            loadingData ? <Skeleton className="h-[450px] mb-8 rounded-lg" /> :
            !fetchError && isDbAvailable ? <AppointmentCalendarWidget /> : 
            !isDbAvailable ? <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertTitle>Calendar Unavailable</AlertTitle><AlertDescription>Database service is not available.</AlertDescription></Alert> : null
          )}


          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 mt-8">
            <div className="lg:col-span-2 space-y-8">
              {loadingData ? (
                  <Skeleton className="h-96 rounded-lg" />
              ) : dashboardData && !fetchError && (role === 'admin' || role === 'doctor' || role === 'receptionist') && isDbAvailable ? (
                <UpcomingAppointmentsWidget appointments={dashboardData.upcomingAppointments} />
              ) : !loadingData && !fetchError && !isDbAvailable ? (
                 <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertTitle>Upcoming Appointments Unavailable</AlertTitle><AlertDescription>Database service is not available.</AlertDescription></Alert>
              ) : !loadingData && !fetchError && (
                  <Card><CardHeader><CardTitle>Upcoming Appointments</CardTitle></CardHeader><CardContent><p className="text-muted-foreground text-center py-4">No upcoming appointments.</p></CardContent></Card>
              )}

              {(role === 'admin' || role === 'doctor') && (
                loadingData ? <Skeleton className="h-80 rounded-lg" /> :
                !fetchError && isDbAvailable ? (
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
                ) : !isDbAvailable ? <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertTitle>Analytics Unavailable</AlertTitle><AlertDescription>Database service is not available.</AlertDescription></Alert> : null
              )}

              {(role === 'admin' || role === 'doctor') && (
                loadingData ? <Skeleton className="h-80 mt-8 rounded-lg" /> :
                dashboardData?.highRiskPatients && !fetchError && isDbAvailable ? <HighRiskPatientsWidget patients={dashboardData.highRiskPatients} /> :
                !loadingData && !fetchError && !isDbAvailable ? <Alert variant="destructive" className="mt-8"><AlertTriangle className="h-4 w-4" /><AlertTitle>High-Risk Patients Unavailable</AlertTitle><AlertDescription>Database service is not available.</AlertDescription></Alert> :
                !loadingData && !fetchError && <Card className="mt-8"><CardHeader><CardTitle>High-Risk Patients</CardTitle></CardHeader><CardContent><p className="text-muted-foreground text-center py-4">No high-risk patients data available.</p></CardContent></Card>
              )}
            </div>

            <div className="lg:col-span-1 space-y-8">
              {loadingData ? (
                  <Skeleton className="h-80 rounded-lg" />
              ) : dashboardData && !fetchError && (role === 'admin' || role === 'doctor' || role === 'receptionist') && isDbAvailable ? (
                <RecentActivitiesWidget activities={dashboardData.recentActivities} />
              ) : !loadingData && !fetchError && !isDbAvailable ? (
                  <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertTitle>Recent Activities Unavailable</AlertTitle><AlertDescription>Database service is not available.</AlertDescription></Alert>
              ) : !loadingData && !fetchError && (
                 <Card><CardHeader><CardTitle>Recent Activities</CardTitle></CardHeader><CardContent><p className="text-muted-foreground text-center py-4">No recent activities.</p></CardContent></Card>
              )}

              {(role === 'admin' || role === 'receptionist') && (
                   loadingData ? <Skeleton className="h-72 rounded-lg" /> :
                   !fetchError && isDbAvailable ? <BillingSummaryWidget /> : 
                   !isDbAvailable ? <Alert variant="destructive"><AlertTriangle className="h-4 w-4" /><AlertTitle>Billing Summary Unavailable</AlertTitle><AlertDescription>Database service is not available.</AlertDescription></Alert> : null
              )}

              {role === 'admin' && (
                   loadingData ? <Skeleton className="h-64 rounded-lg" /> :
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
            <h2 className="text-xl md:text-2xl font-semibold text-foreground mb-2">Your Health Portal</h2>
            {loadingData ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => <Skeleton key={`patient-skeleton-${i}`} className="h-60 rounded-lg" />)}
                </div>
            ) : !fetchError && dashboardData && isDbAvailable ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <PatientUpcomingAppointmentsWidget appointments={dashboardData.upcomingAppointments}/>
                    <PatientPrescriptionsWidget />
                    <PatientMedicalRecordsWidget /> 
                    <PatientBillingHistoryWidget />
                    <PatientBookAppointmentWidget />
                    <PatientUploadDocsWidget />
                    <PatientTeleconsultWidget />
                    <PatientMessagesWidget />
                    <PatientReportsWidget />
                </div>
            ) : !loadingData && (!fetchError || !isDbAvailable) && (
                 <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{fetchError || "Could not load your dashboard information."}{!isDbAvailable && " Database service is unavailable."}</AlertDescription>
                 </Alert>
            )}
         </div>
      )}
    </div>
  );
}
