"use client";

import type React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DollarSign, FileArchive, CreditCard } from "lucide-react";
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Mock data
const billingHistory = [
    // {id: "inv1", date: "2024-07-01", amount: "$50.00", status: "Paid", service: "Consultation Fee"},
    // {id: "inv2", date: "2024-06-15", amount: "$120.00", status: "Paid", service: "OCT Scan"},
];

export function PatientBillingHistoryWidget() {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-primary flex items-center">
          <DollarSign className="mr-2 h-5 w-5" />
          Billing History
        </CardTitle>
        <CardDescription>View your invoices and payment status.</CardDescription>
      </CardHeader>
      <CardContent>
        {billingHistory.length > 0 ? (
            <ul className="space-y-2">
                {billingHistory.map(item => (
                    <li key={item.id} className="p-2 bg-secondary/50 rounded-md">
                        <div className="flex justify-between items-center">
                            <p className="text-sm text-foreground">{item.service} - {item.date}</p>
                            <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${item.status === "Paid" ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"}`}>{item.status}</span>
                        </div>
                        <p className="text-sm font-bold text-primary">{item.amount}</p>
                    </li>
                ))}
            </ul>
        ) : (
            <div className="text-center py-4">
                <FileArchive className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">No billing history found.</p>
            </div>
        )}
        <Button className="w-full mt-4" variant="outline" asChild>
            <Link href="/billing">
                <CreditCard className="mr-2 h-4 w-4"/> View Full Billing &amp; Make Payment
            </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
