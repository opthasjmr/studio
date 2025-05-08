
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText, Search, UserCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
// import Link from "next/link";

export default function EMRPage() {
  // This page would typically display a list of patients or allow searching for a patient to view their EMR.
  // For now, it's a placeholder.

  return (
    <div className="container mx-auto py-10 px-4">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <CardTitle className="text-3xl font-bold text-primary flex items-center">
                <FileText className="mr-3 h-8 w-8" /> Electronic Medical Records
              </CardTitle>
              <CardDescription className="text-lg mt-1">
                Access and manage patient medical history, diagnoses, and treatment plans.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search patient by name or ID to view EMR..."
                className="pl-10 w-full md:w-1/2"
                // value={searchTerm}
                // onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="text-center py-10">
            <UserCheck className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-2 text-xl font-semibold">Search for a Patient</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Use the search bar above to find a patient and access their EMR.
            </p>
            <p className="mt-4 text-xs text-muted-foreground">
              (Detailed EMR views will be accessible via patient detail pages)
            </p>
          </div>
          
          {/* 
            Future enhancements:
            - List of recently accessed EMRs
            - Quick links to EMR templates
            - Integration with diagnostic image viewer
          */}
        </CardContent>
      </Card>
    </div>
  );
}
