
"use client";
import type React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Activity, ArrowRight, UserPlus, CalendarPlus } from "lucide-react";
import type { RecentActivity } from "@/lib/dashboard-data";
import { formatDistanceToNow } from 'date-fns';

interface RecentActivitiesWidgetProps {
  activities: RecentActivity[];
}

export function RecentActivitiesWidget({ activities }: RecentActivitiesWidgetProps) {
  const IconMap: Record<RecentActivity['type'], React.ElementType> = {
    'New Patient': UserPlus,
    'Patient Update': UserPlus, // Could be different icon
    'New Appointment': CalendarPlus,
    'Appointment Update': CalendarPlus, // Could be different icon
  };

  return (
    <Card className="shadow-lg col-span-1 md:col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold text-primary flex items-center">
              <Activity className="mr-2 h-6 w-6" />
              Recent Activities
            </CardTitle>
            <CardDescription>Latest updates in the system.</CardDescription>
          </div>
          {/* Optional: Link to a full activity log page */}
        </div>
      </CardHeader>
      <CardContent>
        {activities.length === 0 ? (
          <div className="text-center py-6">
            <Activity className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">No recent activities to display.</p>
          </div>
        ) : (
          <ul className="space-y-4">
            {activities.map((activity) => {
              const Icon = IconMap[activity.type];
              return (
                <li key={activity.id} className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-1">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-grow">
                    <p className="text-sm text-foreground">{activity.description}</p>
                    <div className="text-xs text-muted-foreground flex justify-between items-center">
                      <span>{formatDistanceToNow(activity.timestamp, { addSuffix: true })}</span>
                      <Link href={activity.link} passHref>
                        <Button variant="link" size="sm" className="p-0 h-auto text-xs">View</Button>
                      </Link>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
