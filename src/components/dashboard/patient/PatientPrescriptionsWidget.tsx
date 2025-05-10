"use client";

import type React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Pill, Download, Repeat } from "lucide-react";
import { Button } from '@/components/ui/button';

// Mock data - replace with actual data fetching
const prescriptions = [
  // { id: "1", name: "Latanoprost 0.005%", dosage: "1 drop OD (right eye)", date: "2024-07-01", refillable: true },
  // { id: "2", name: "Refresh Tears", dosage: "1 drop OU PRN", date: "2024-06-15", refillable: false },
];

export function PatientPrescriptionsWidget() {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-primary flex items-center">
          <Pill className="mr-2 h-5 w-5" />
          My Prescriptions
        </CardTitle>
        <CardDescription>View and manage your current and past prescriptions.</CardDescription>
      </CardHeader>
      <CardContent>
        {prescriptions.length > 0 ? (
          <ul className="space-y-3">
            {prescriptions.map((rx) => (
              <li key={rx.id} className="p-3 bg-secondary/50 rounded-md">
                <p className="font-medium text-foreground">{rx.name}</p>
                <p className="text-sm text-muted-foreground">Dosage: {rx.dosage}</p>
                <p className="text-xs text-muted-foreground">Prescribed: {rx.date}</p>
                <div className="mt-2 flex space-x-2">
                  <Button variant="outline" size="xs" disabled><Download className="mr-1 h-3 w-3" /> Download</Button>
                  {rx.refillable && <Button variant="outline" size="xs" disabled><Repeat className="mr-1 h-3 w-3" /> Request Refill</Button>}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-4">
            <Pill className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No prescriptions found.</p>
          </div>
        )}
         <Button variant="link" size="sm" className="w-full mt-3" disabled>View All Prescriptions</Button>
      </CardContent>
    </Card>
  );
}
