
"use client";
import type React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CreditCard, TrendingUp, FileText, ArrowRight } from "lucide-react";

interface BillingSummaryWidgetProps {
  // Props for actual data will be added later
  totalRevenueToday?: string;
  totalRevenueWeek?: string;
  totalRevenueMonth?: string;
  outstandingDues?: string;
}

export function BillingSummaryWidget({ 
    totalRevenueToday = "$0.00",
    totalRevenueWeek = "$0.00",
    totalRevenueMonth = "$0.00",
    outstandingDues = "$0.00"
}: BillingSummaryWidgetProps) {
  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-semibold text-primary flex items-center">
              <CreditCard className="mr-2 h-6 w-6" />
              Billing Summary
            </CardTitle>
            <CardDescription>Overview of financial activities.</CardDescription>
          </div>
           <Button variant="outline" size="sm" asChild>
            <Link href="/billing"> 
              Full Report <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-secondary/50 rounded-md">
            <p className="text-sm text-muted-foreground">Revenue (Today)</p>
            <p className="text-lg font-bold text-primary">{totalRevenueToday}</p>
          </div>
          <div className="p-4 bg-secondary/50 rounded-md">
            <p className="text-sm text-muted-foreground">Revenue (This Week)</p>
            <p className="text-lg font-bold text-primary">{totalRevenueWeek}</p>
          </div>
          <div className="p-4 bg-secondary/50 rounded-md">
            <p className="text-sm text-muted-foreground">Revenue (This Month)</p>
            <p className="text-lg font-bold text-primary">{totalRevenueMonth}</p>
          </div>
          <div className="p-4 bg-destructive/10 rounded-md">
            <p className="text-sm text-destructive/80">Outstanding Dues</p>
            <p className="text-lg font-bold text-destructive">{outstandingDues}</p>
          </div>
        </div>
        <div className="pt-2">
            <h4 className="text-md font-semibold mb-2 text-foreground flex items-center">
                <TrendingUp className="mr-2 h-5 w-5 text-green-500"/>
                Revenue Trends
            </h4>
            <div className="w-full h-32 border-2 border-dashed border-muted-foreground/30 rounded-md flex items-center justify-center">
                <p className="text-sm text-muted-foreground">Revenue chart placeholder</p>
            </div>
        </div>
        {/* Placeholder for recent payment activity list */}
        {/* <div className="pt-2">
          <h4 className="text-md font-semibold text-muted-foreground mb-1">Recent Payments</h4>
          <p className="text-sm text-muted-foreground">List of recent payments will be here.</p>
        </div> */}
      </CardContent>
    </Card>
  );
}
