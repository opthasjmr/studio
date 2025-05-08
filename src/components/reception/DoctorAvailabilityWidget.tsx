
"use client";
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { UserCheck, UserX } from "lucide-react";
// import { getDoctorAvailabilitySummary } from "@/lib/reception-data"; // Assume this function exists

interface DoctorAvailability {
  available: number;
  onLeave: number;
  total: number;
}

export function DoctorAvailabilityWidget() {
  const [availability, setAvailability] = useState<DoctorAvailability | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAvailability = async () => {
      setLoading(true);
      // const data = await getDoctorAvailabilitySummary(); // Replace with actual data fetching
      // Mock data for now:
      await new Promise(resolve => setTimeout(resolve, 600)); // Simulate delay
      const mockData: DoctorAvailability = { available: 3, onLeave: 1, total: 4 };
      setAvailability(mockData);
      setLoading(false);
    };
    fetchAvailability();
  }, []);

  return (
    <Card className="shadow-md">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <UserCheck className="h-6 w-6 text-primary" />
          <CardTitle className="text-xl font-semibold">Doctor Availability</CardTitle>
        </div>
        <CardDescription>
          Status of doctors for today.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-muted-foreground">Loading doctor status...</p>
        ) : availability ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Available Doctors:</span>
              <span className="font-semibold text-green-600 flex items-center">
                <UserCheck className="mr-1 h-5 w-5" /> {availability.available} / {availability.total}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Doctors on Leave:</span>
              <span className="font-semibold text-red-600 flex items-center">
                <UserX className="mr-1 h-5 w-5" /> {availability.onLeave}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-muted-foreground">Could not load doctor status.</p>
        )}
      </CardContent>
    </Card>
  );
}
