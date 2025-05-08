
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { BarChart3, FileText, ListFilter } from "lucide-react";

export function ReceptionReportsLinkWidget() {
  const reports = [
    { name: "Daily Appointment Log", href: "/reports/reception/daily-appointments", icon: FileText },
    { name: "Weekly Patient Volume", href: "/reports/reception/weekly-volume", icon: BarChart3 },
    { name: "No-Show & Cancellation Report", href: "/reports/reception/no-shows", icon: ListFilter },
  ];

  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          <CardTitle className="text-xl font-semibold">Quick Reports</CardTitle>
        </div>
        <CardDescription>
          Access common reception-related reports.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {reports.map((report) => (
          <Button key={report.name} variant="outline" className="w-full justify-start" asChild disabled>
            <Link href={report.href}>
              <report.icon className="mr-2 h-4 w-4" />
              {report.name} (Coming Soon)
            </Link>
          </Button>
        ))}
         <Button variant="default" className="w-full mt-2" asChild disabled>
            <Link href="/reports">
                View All Reports
            </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
