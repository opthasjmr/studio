
"use client";
import type React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ShieldCheck, Server, Database, AlertTriangle } from "lucide-react";

interface SystemHealthWidgetProps {
  // Props for actual data will be added later
  lastBackup?: string;
  activeIntegrations?: { name: string, status: 'active' | 'error' | 'inactive' }[];
  errorLogsCount?: number;
}

export function SystemHealthWidget({
    lastBackup = "N/A",
    activeIntegrations = [],
    errorLogsCount = 0
}: SystemHealthWidgetProps) {

  const getStatusColor = (status: string) => {
    if (status === 'active') return 'text-green-500';
    if (status === 'error') return 'text-red-500';
    return 'text-yellow-500';
  };

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-primary flex items-center">
          <Server className="mr-2 h-6 w-6" />
          System Health
        </CardTitle>
        <CardDescription>Key operational metrics (Admin View).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="text-sm font-medium text-muted-foreground flex items-center mb-1">
            <Database className="mr-2 h-4 w-4" /> Last Database Backup
          </h4>
          <p className="text-md text-foreground">{lastBackup || 'Not configured'}</p>
        </div>
        
        <div>
          <h4 className="text-sm font-medium text-muted-foreground flex items-center mb-1">
            <ShieldCheck className="mr-2 h-4 w-4" /> Active Integrations
          </h4>
          {activeIntegrations.length > 0 ? (
            <ul className="space-y-1 text-sm">
              {activeIntegrations.map(int => (
                <li key={int.name} className="flex justify-between">
                  <span>{int.name}</span>
                  <span className={`font-semibold ${getStatusColor(int.status)}`}>{int.status.charAt(0).toUpperCase() + int.status.slice(1)}</span>
                </li>
              ))}
            </ul>
          ): (
            <p className="text-sm text-muted-foreground">No integrations configured.</p>
          )}
        </div>

         <div>
          <h4 className="text-sm font-medium text-muted-foreground flex items-center mb-1">
            <AlertTriangle className="mr-2 h-4 w-4" /> Function Call Logs
          </h4>
          <p className="text-md text-foreground">
            {errorLogsCount > 0 ? 
                <span className="text-red-500">{errorLogsCount} error(s) require attention</span> 
              : <span className="text-green-500">No critical errors logged</span>
            }
          </p>
          {/* Could link to a detailed logs page */}
        </div>
      </CardContent>
    </Card>
  );
}
