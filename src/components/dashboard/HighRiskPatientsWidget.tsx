
"use client";
import type React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ShieldAlert, UserCheck, ArrowRight } from "lucide-react";
import type { Patient } from "@/lib/dashboard-data"; // Ensure Patient type includes tags
import { Badge } from "@/components/ui/badge";

interface HighRiskPatientsWidgetProps {
  patients: Patient[];
}

export function HighRiskPatientsWidget({ patients }: HighRiskPatientsWidgetProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold text-primary flex items-center">
              <ShieldAlert className="mr-2 h-6 w-6 text-destructive" />
              High-Risk Patients
            </CardTitle>
            <CardDescription>Patients requiring immediate attention or follow-up.</CardDescription>
          </div>
           <Button variant="outline" size="sm" asChild>
            <Link href="/patients?filter=high-risk"> {/* Example link, adjust as needed */}
              View All <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {patients.length === 0 ? (
          <div className="text-center py-6">
            <UserCheck className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-2 text-muted-foreground">No high-risk patients currently identified.</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {patients.map((patient) => (
              <li key={patient.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-3 bg-destructive/10 rounded-md hover:bg-destructive/20 transition-colors">
                <div>
                  <Link href={`/patients/${patient.id}`} className="font-semibold text-destructive hover:underline">
                    {patient.name}
                  </Link>
                  {patient.tags && patient.tags.length > 0 && (
                     <div className="flex flex-wrap gap-1 mt-1">
                        {patient.tags.map(tag => (
                            <Badge key={tag} variant="destructive" className="text-xs px-1.5 py-0.5">{tag}</Badge>
                        ))}
                     </div>
                  )}
                </div>
                <div className="text-sm text-muted-foreground mt-1 sm:mt-0 sm:text-right">
                  <Button variant="link" size="sm" asChild className="text-destructive p-0 h-auto">
                     <Link href={`/patients/${patient.id}`}>View Details</Link>
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
