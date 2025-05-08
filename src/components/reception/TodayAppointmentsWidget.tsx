
"use client";
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CalendarCheck } from "lucide-react";
// import { getTodaysAppointmentsForReception } from "@/lib/reception-data"; // Assume this function exists

interface AppointmentSummary {
  total: number;
  new: number;
  followUp: number;
  walkIn: number;
}

export function TodayAppointmentsWidget() {
  const [summary, setSummary] = useState<AppointmentSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      setLoading(true);
      // const data = await getTodaysAppointmentsForReception(); // Replace with actual data fetching
      // Mock data for now:
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate delay
      const mockData: AppointmentSummary = { total: 15, new: 5, followUp: 8, walkIn: 2 };
      setSummary(mockData);
      setLoading(false);
    };
    fetchSummary();
  }, []);

  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <CalendarCheck className="h-6 w-6 text-primary" />
          <CardTitle className="text-xl font-semibold">Today's Appointments</CardTitle>
        </div>
        <CardDescription>
          Overview of scheduled and walk-in visits for today.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-muted-foreground">Loading appointment data...</p>
        ) : summary ? (
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-3xl font-bold text-primary">{summary.total}</p>
              <p className="text-sm text-muted-foreground">Total Visits</p>
            </div>
            <div>
              <p className="text-lg font-semibold">{summary.new} New</p>
              <p className="text-lg font-semibold">{summary.followUp} Follow-up</p>
              <p className="text-lg font-semibold">{summary.walkIn} Walk-in</p>
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground">Could not load appointment data.</p>
        )}
      </CardContent>
    </Card>
  );
}
