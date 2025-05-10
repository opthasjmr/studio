"use client";

import type React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText, History, Download } from "lucide-react";
import { Button } from '@/components/ui/button';

// Mock data - replace with actual data fetching
const visitHistory = [
//   { id: "v1", date: "2024-06-15", diagnosis: "Routine Checkup", doctor: "Dr. Smith", reportUrl: "#" },
//   { id: "v2", date: "2023-12-10", diagnosis: "Mild Dry Eyes", doctor: "Dr. Emily", reportUrl: "#" },
];

export function PatientVisitHistoryWidget() {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-primary flex items-center">
          <History className="mr-2 h-5 w-5" />
          Medical Records &amp; Visit History
        </CardTitle>
        <CardDescription>Access your past diagnoses and test results.</CardDescription>
      </CardHeader>
      <CardContent>
        {visitHistory.length > 0 ? (
          <ul className="space-y-3">
            {visitHistory.map((visit) => (
              <li key={visit.id} className="p-3 bg-secondary/50 rounded-md">
                <p className="font-medium text-foreground">Visit on {visit.date} with {visit.doctor}</p>
                <p className="text-sm text-muted-foreground">Diagnosis: {visit.diagnosis}</p>
                <Button variant="outline" size="xs" asChild className="mt-1" disabled>
                  <a href={visit.reportUrl} target="_blank" rel="noopener noreferrer">
                    <Download className="mr-1 h-3 w-3" /> View Report
                  </a>
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-4">
            <FileText className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No visit history found.</p>
          </div>
        )}
        <Button variant="link" size="sm" className="w-full mt-3" disabled>View Full Medical History</Button>
      </CardContent>
    </Card>
  );
}

// For consistency with dashboard, let's alias it to PatientMedicalRecordsWidget as well
export const PatientMedicalRecordsWidget = PatientVisitHistoryWidget;
