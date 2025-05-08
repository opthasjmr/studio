
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Settings as SettingsIcon, Users, Bell, Lock, SlidersHorizontal, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext"; // To restrict access

export default function SettingsPage() {
  const { role } = useAuth();

  if (role !== 'admin') {
    return (
      <div className="container mx-auto py-10 px-4 text-center">
        <Lock className="mx-auto h-12 w-12 text-destructive" />
        <h1 className="mt-4 text-2xl font-bold">Access Denied</h1>
        <p className="text-muted-foreground">You do not have permission to view this page.</p>
        <Button onClick={() => window.history.back()} className="mt-6">Go Back</Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <CardTitle className="text-3xl font-bold text-primary flex items-center">
                <SettingsIcon className="mr-3 h-8 w-8" /> System Settings
              </CardTitle>
              <CardDescription className="text-lg mt-1">
                Manage application settings, user roles, and integrations (Admin only).
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 mb-6">
              <TabsTrigger value="general"><SlidersHorizontal className="mr-2 h-4 w-4" />General</TabsTrigger>
              <TabsTrigger value="users"><Users className="mr-2 h-4 w-4" />User Management</TabsTrigger>
              <TabsTrigger value="notifications"><Bell className="mr-2 h-4 w-4" />Notifications</TabsTrigger>
              <TabsTrigger value="integrations"><Workflow className="mr-2 h-4 w-4" />Integrations</TabsTrigger>
            </TabsList>
            
            <TabsContent value="general" className="space-y-6 p-4 border rounded-lg">
              <h3 className="text-xl font-semibold text-foreground">General Settings</h3>
              <div className="flex items-center justify-between space-x-2 p-3 border rounded-md bg-secondary/30">
                <Label htmlFor="maintenance-mode" className="font-medium">Maintenance Mode</Label>
                <Switch id="maintenance-mode" />
              </div>
              <p className="text-sm text-muted-foreground">Clinic name, address, contact information, and branding settings will be managed here.</p>
              <Button disabled>Save General Settings</Button>
            </TabsContent>

            <TabsContent value="users" className="space-y-6 p-4 border rounded-lg">
              <h3 className="text-xl font-semibold text-foreground">User Management</h3>
              <p className="text-sm text-muted-foreground">
                View, edit roles, and manage access for doctors, receptionists, and other staff. Patient accounts are typically self-registered or created via patient management.
              </p>
              <Button disabled>Manage Users</Button>
            </TabsContent>

            <TabsContent value="notifications" className="space-y-6 p-4 border rounded-lg">
              <h3 className="text-xl font-semibold text-foreground">Notification Settings</h3>
              <p className="text-sm text-muted-foreground">
                Configure email and SMS templates for appointment reminders, follow-ups, and system alerts. Manage Twilio/SMS gateway settings.
              </p>
              <Button disabled>Configure Notifications</Button>
            </TabsContent>

            <TabsContent value="integrations" className="space-y-6 p-4 border rounded-lg">
              <h3 className="text-xl font-semibold text-foreground">Integrations Management</h3>
              <p className="text-sm text-muted-foreground">
                Manage integrations with diagnostic devices (OCT, Fundus cameras), payment gateways (Razorpay, Stripe), and other third-party services.
              </p>
              <Button disabled>Manage Integrations</Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
