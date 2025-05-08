"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FilePlus2, Users, CalendarDays, BarChart3 } from "lucide-react";

export default function DashboardPage() {
  const { user, role } = useAuth();

  if (!user) {
    // This should ideally be handled by a middleware or HOC
    // For now, returning null or a message
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
        return "Welcome to your Netram Vision dashboard.";
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


  return (
    <div className="container mx-auto py-10 px-4">
      <Card className="mb-8 bg-secondary/50 border-none shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary">Welcome, {user.displayName || user.email}!</CardTitle>
          <CardDescription className="text-lg text-muted-foreground">{getRoleSpecificGreeting()}</CardDescription>
        </CardHeader>
      </Card>

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

      {/* Example of role-specific content */}
      {role === "doctor" && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Doctor's Corner</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Here you might see a summary of your upcoming appointments or pending scan analyses.</p>
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
          </CardContent>
        </Card>
      )}

    </div>
  );
}
