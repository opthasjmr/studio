
"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FilePlus2, Users, CalendarDays, BarChart3, User, AlertCircle, Activity, Briefcase, ServerIcon, BarChartBig, LineChart, PieChartIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { QuickStatsCard } from "@/components/dashboard/QuickStatsCard";
import { UpcomingAppointmentsWidget } from "@/components/dashboard/UpcomingAppointmentsWidget";
import { RecentActivitiesWidget } from "@/components/dashboard/RecentActivitiesWidget";
import { AnalyticsPlaceholderWidget } from "@/components/dashboard/AnalyticsPlaceholderWidget";
import { BillingSummaryWidget } from "@/components/dashboard/BillingSummaryWidget";
import { SystemHealthWidget } from "@/components/dashboard/SystemHealthWidget";
import { Skeleton } from "@/components/ui/skeleton";
import type { Appointment, RecentActivity, PatientsByConditionData } from "@/lib/dashboard-data";
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


interface DashboardData {
  totalPatients: number;
  todaysAppointments: number;
  pendingBills: number;
  criticalAlerts: number;
  upcomingAppointments: Appointment[];
  recentActivities: RecentActivity[];
  patientsByCondition: PatientsByConditionData[];
}

export default function DashboardPage() {
  const { user, role } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      setLoadingData(true);
      try {
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
          getUpcomingAppointments(5),
          getRecentActivities(5),
          getPatientsByCondition(),
        ]);
        setDashboardData({
          totalPatients,
          todaysAppointments,
          pendingBills,
          criticalAlerts,
          upcomingAppointments,
          recentActivities,
          patientsByCondition,
        });
      } catch (error) {
        console.error("Failed to load dashboard data", error);
        // Optionally set an error state here
      } finally {
        setLoadingData(false);
      }
    }
    fetchData();
  }, [user]);


  if (!user) {
    return (
      <div className="container mx-auto py-8">
        <p>Loading user data or redirecting...</p>
      </div>
    );
  }

  const getRoleSpecificGreeting = () => {
    switch (role) {
      case "doctor":
        return "Manage your patients, appointments, and analyze diagnostic scans.";
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

  const patientsByConditionChartConfig = {
    count: { label: "Patients" },
    ...dashboardData?.patientsByCondition.reduce((acc, cur) => {
      acc[cur.condition] = { label: cur.condition, color: `hsl(var(--chart-${(Object.keys(acc).length % 5) + 1}))` };
      return acc;
    }, {} as Record<string, {label: string, color: string}>)
  } satisfies ChartConfig;

  const patientsByConditionChartData = dashboardData?.patientsByCondition.map(d => ({name: d.condition, count: d.count}));


  return (
    <div className="container mx-auto py-10 px-4 space-y-8">
      <Card className="bg-secondary/50 border-none shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary">Welcome, {user.displayName || user.email}!</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">{getRoleSpecificGreeting()}</CardDescription>
        </CardHeader>
      </Card>

      {/* Quick Actions - Kept from original */}
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
                    <Button asChild className="w-full">
                        <Link href={action.href}>Go to {action.title}</Link>
                    </Button>
                    </CardContent>
                </Card>
                ))}
            </div>
        </div>
      )}

      {/* Dashboard Widgets Section */}
      <div>
        <h2 className="text-2xl font-semibold text-foreground mb-6 mt-10">Overview</h2>
        
        {/* Quick Stats */}
        {loadingData ? (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)}
            </div>
        ) : dashboardData && (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
            {(role === 'admin' || role === 'doctor' || role === 'receptionist') && (
              <QuickStatsCard title="Total Patients" value={dashboardData.totalPatients} icon={Users} />
            )}
            {(role === 'admin' || role === 'doctor' || role === 'receptionist') && (
              <QuickStatsCard title="Today's Appointments" value={dashboardData.todaysAppointments} icon={CalendarDays} />
            )}
            {(role === 'admin' || role === 'doctor') && (
              <QuickStatsCard title="Pending Bills" value={dashboardData.pendingBills} icon={Briefcase} description="Feature in development" />
            )}
            {(role === 'admin' || role === 'doctor') && (
               <QuickStatsCard title="Critical Alerts" value={dashboardData.criticalAlerts} icon={AlertCircle} description="Feature in development" />
            )}
          </div>
        )}

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column / Main Column for smaller screens */}
          <div className="lg:col-span-2 space-y-8">
            {loadingData ? (
                <Skeleton className="h-96" />
            ) : dashboardData && (role === 'admin' || role === 'doctor' || role === 'receptionist') && (
              <UpcomingAppointmentsWidget appointments={dashboardData.upcomingAppointments} />
            )}
            
            {(role === 'admin' || role === 'doctor') && (
              loadingData ? <Skeleton className="h-64" /> :
              <AnalyticsPlaceholderWidget 
                title="Patients by Condition" 
                icon={PieChartIcon} 
                description="Distribution of patients based on their tagged conditions."
                chartType="pie"
                data={patientsByConditionChartData}
                chartConfig={patientsByConditionChartConfig}
                categoryKey="name"
                dataKey="count"
              />
            )}
          </div>

          {/* Right Column / Second Column for smaller screens */}
          <div className="lg:col-span-1 space-y-8">
            {loadingData ? (
                <Skeleton className="h-80" />
            ) : dashboardData && (role === 'admin' || role === 'doctor' || role === 'receptionist') && (
              <RecentActivitiesWidget activities={dashboardData.recentActivities} />
            )}
            
            {(role === 'admin' || role === 'doctor') && (
                 loadingData ? <Skeleton className="h-72" /> :
                <BillingSummaryWidget />
            )}
            
            {role === 'admin' && (
                 loadingData ? <Skeleton className="h-64" /> :
                <SystemHealthWidget 
                    lastBackup="Today, 02:00 AM" 
                    activeIntegrations={[{name: 'Twilio SMS', status: 'active'}, {name: 'Payment Gateway', status: 'error'}]}
                    errorLogsCount={2}
                />
            )}
          </div>
        </div>
      </div>


      {/* Example of role-specific content from original */}
      {role === "doctor" && !loadingData && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Doctor's Corner</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Review your upcoming schedule and patient alerts.</p>
            {/* Additional doctor specific widgets could go here */}
          </CardContent>
        </Card>
      )}
       {role === "patient" && !loadingData && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Patient Portal</CardTitle>
          </CardHeader>
          <CardContent>
            <p>View your upcoming appointments and recent medical records.</p>
             {dashboardData?.upcomingAppointments && dashboardData.upcomingAppointments.length > 0 && (
                <div className="mt-4">
                    <h3 className="font-semibold mb-2">Your Upcoming Appointments:</h3>
                    <ul className="space-y-2">
                    {dashboardData.upcomingAppointments.filter(apt => apt.patientName === user.displayName || apt.patientName === user.email).map(apt => (
                        <li key={apt.id} className="text-sm p-2 bg-secondary/50 rounded-md">{apt.date} at {apt.time} with {apt.doctorName}</li>
                    ))}
                    </ul>
                </div>
            )}
          </CardContent>
        </Card>
      )}

    </div>
  );
}
