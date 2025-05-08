
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart2, Download, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function ReportsPage() {
  // Placeholder for report types and filters
  const reportTypes = [
    { value: "patient_demographics", label: "Patient Demographics" },
    { value: "appointment_summary", label: "Appointment Summary" },
    { value: "revenue_analysis", label: "Revenue Analysis" },
    { value: "disease_trends", label: "Disease Trends" },
    { value: "doctor_performance", label: "Doctor Performance" },
  ];

  return (
    <div className="container mx-auto py-10 px-4">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <CardTitle className="text-3xl font-bold text-primary flex items-center">
                <BarChart2 className="mr-3 h-8 w-8" /> Reports &amp; Analytics
              </CardTitle>
              <CardDescription className="text-lg mt-1">
                Generate and view clinical, financial, and operational reports.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">Generate New Report</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end p-4 border rounded-lg bg-secondary/30">
              <div>
                <label htmlFor="reportType" className="block text-sm font-medium text-muted-foreground mb-1">Report Type</label>
                <Select>
                  <SelectTrigger id="reportType">
                    <SelectValue placeholder="Select a report type" />
                  </SelectTrigger>
                  <SelectContent>
                    {reportTypes.map(report => (
                      <SelectItem key={report.value} value={report.value}>{report.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label htmlFor="dateRange" className="block text-sm font-medium text-muted-foreground mb-1">Date Range</label>
                {/* Placeholder for Date Range Picker */}
                <Button variant="outline" className="w-full justify-start text-left font-normal">Pick a date range</Button>
              </div>
              <Button className="md:self-end">
                <Filter className="mr-2 h-4 w-4" /> Generate Report
              </Button>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">Generated Reports</h2>
            <div className="text-center py-10 border-2 border-dashed border-muted-foreground/30 rounded-md">
              <BarChart2 className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">
                No reports generated yet. Use the section above to create a new report.
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Generated reports will be listed here with options to view or download.
              </p>
            </div>
            {/* 
              Example of a generated report item:
              <div className="flex justify-between items-center p-3 border rounded-md">
                <div>
                  <p className="font-semibold">Monthly Revenue Report - July 2024</p>
                  <p className="text-xs text-muted-foreground">Generated on: 2024-08-01</p>
                </div>
                <Button variant="outline" size="sm"><Download className="mr-2 h-4 w-4" /> Download PDF</Button>
              </div> 
            */}
          </section>
        </CardContent>
      </Card>
    </div>
  );
}
