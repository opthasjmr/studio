"use client";

import type React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileSpreadsheet, Download } from "lucide-react";
import { Button } from '@/components/ui/button';

// Mock data
const reports = [
    // {id: "rep1", name: "Blood Test - CBC (01/07/2024)", url: "#"},
    // {id: "rep2", name: "OCT Scan Report (15/06/2024)", url: "#"},
];

export function PatientReportsWidget() {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-primary flex items-center">
          <FileSpreadsheet className="mr-2 h-5 w-5" />
          My Reports
        </CardTitle>
        <CardDescription>Download your lab tests and imaging reports.</CardDescription>
      </CardHeader>
      <CardContent>
         {reports.length > 0 ? (
          <ul className="space-y-2">
            {reports.map((report) => (
              <li key={report.id} className="flex justify-between items-center p-2 bg-secondary/50 rounded-md">
                <span className="text-sm text-foreground">{report.name}</span>
                <Button variant="ghost" size="xs" asChild disabled>
                    <a href={report.url} target="_blank" rel="noopener noreferrer"><Download className="h-4 w-4"/></a>
                </Button>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-4">
            <FileSpreadsheet className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No reports available to download.</p>
          </div>
        )}
        <Button variant="link" size="sm" className="w-full mt-3" disabled>View All Reports</Button>
      </CardContent>
    </Card>
  );
}
