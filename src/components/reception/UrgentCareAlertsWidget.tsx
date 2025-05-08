
"use client";

// import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AlertTriangle, Bell } from "lucide-react";

interface Alert {
  id: string;
  message: string;
  patientName?: string;
  patientId?: string;
  priority: 'high' | 'medium' | 'low';
  timestamp: Date;
}

export function UrgentCareAlertsWidget() {
  // const [alerts, setAlerts] = useState<Alert[]>([]);
  // const [loading, setLoading] = useState(true);

  // useEffect(() => {
  //   // Fetch urgent alerts from backend/Firebase
  //   const fetchAlerts = async () => {
  //     setLoading(true);
  //     // Replace with actual data fetching
  //     await new Promise(resolve => setTimeout(resolve, 1000));
  //     setAlerts([
  //       { id: '1', message: 'Patient John Doe reported severe eye pain.', patientName: 'John Doe', patientId: 'P001', priority: 'high', timestamp: new Date(Date.now() - 1000 * 60 * 5) },
  //       { id: '2', message: 'Dr. Smith running 30 mins late.', priority: 'medium', timestamp: new Date(Date.now() - 1000 * 60 * 15) },
  //     ]);
  //     setLoading(false);
  //   };
  //   fetchAlerts();
  // }, []);

  // Mocked data for now
  const loading = false;
  const alerts: Alert[] = [
    { id: '1', message: 'Mr. Kamal Sharma reported sudden vision loss in left eye.', patientName: 'Kamal Sharma', patientId: 'P00234', priority: 'high', timestamp: new Date(Date.now() - 1000 * 60 * 5) },
    { id: '2', message: 'Walk-in patient requires immediate attention for eye injury.', priority: 'high', timestamp: new Date(Date.now() - 1000 * 60 * 25) },
  ];


  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <AlertTriangle className="h-6 w-6 text-destructive" />
          <CardTitle className="text-xl font-semibold text-destructive">Urgent Alerts</CardTitle>
        </div>
        <CardDescription>
          High-priority notifications and patient alerts.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-muted-foreground">Loading alerts...</p>
        ) : alerts.length === 0 ? (
          <div className="text-center py-4">
            <Bell className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">No urgent alerts at this time.</p>
          </div>
        ) : (
          <ul className="space-y-3 max-h-60 overflow-y-auto">
            {alerts.map(alert => (
              <li key={alert.id} className={`p-3 rounded-md ${alert.priority === 'high' ? 'bg-destructive/10 border-l-4 border-destructive' : 'bg-secondary/50'}`}>
                <p className="text-sm font-medium text-foreground">{alert.message}</p>
                {alert.patientName && (
                  <Link href={`/patients/${alert.patientId || ''}`} className="text-xs text-primary hover:underline">
                    Patient: {alert.patientName}
                  </Link>
                )}
                <p className="text-xs text-muted-foreground">{alert.timestamp.toLocaleTimeString()}</p>
              </li>
            ))}
          </ul>
        )}
        {alerts.length > 0 && (
             <Button variant="outline" size="sm" className="w-full mt-4">View All Alerts</Button>
        )}
      </CardContent>
    </Card>
  );
}
