
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserX, TrendingUp } from "lucide-react";

export function NoShowPredictionWidget() {
  return (
    <Card className="shadow-md hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <UserX className="h-6 w-6 text-primary" />
          <CardTitle className="text-xl font-semibold">No-Show Prediction</CardTitle>
        </div>
        <CardDescription>
          AI-powered insights to predict and manage appointment no-shows.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Identifies patients with a high likelihood of missing their appointments, allowing for proactive engagement or optimized scheduling.
        </p>
        <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-md mb-4">
            <div>
                <p className="text-xs text-muted-foreground">Predicted No-Shows Today</p>
                <p className="text-lg font-bold text-primary">2-3 Patients</p> {/* Example data */}
            </div>
            <TrendingUp className="h-6 w-6 text-green-500"/>
        </div>
        <Button disabled className="w-full">View No-Show Insights (Coming Soon)</Button>
      </CardContent>
    </Card>
  );
}
