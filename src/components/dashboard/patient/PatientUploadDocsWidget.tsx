"use client";

import type React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { UploadCloud, FileText } from "lucide-react";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function PatientUploadDocsWidget() {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-primary flex items-center">
          <UploadCloud className="mr-2 h-5 w-5" />
          Upload Documents
        </CardTitle>
        <CardDescription>Share ID proof, insurance, or old reports.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
         <p className="text-xs text-muted-foreground">Securely upload your documents for clinic records.</p>
         <Input type="file" disabled/>
         <Button className="w-full" disabled>
            <UploadCloud className="mr-2 h-4 w-4" /> Upload File
        </Button>
        <div className="mt-3">
            <h4 className="text-sm font-medium text-muted-foreground mb-1">Uploaded Files:</h4>
            <div className="text-center text-xs py-2 text-muted-foreground border-2 border-dashed rounded-md">
                <FileText className="mx-auto h-6 w-6 mb-1"/>
                No documents uploaded yet.
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
