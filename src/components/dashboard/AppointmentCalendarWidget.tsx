
"use client";

import type React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CalendarDays, Filter } from "lucide-react";
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar'; // Using ShadCN calendar for basic view
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

// This is a simplified placeholder. A full interactive calendar (like FullCalendar or React Big Calendar)
// would require more setup and potentially external libraries.

export function AppointmentCalendarWidget() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());

  // Placeholder data for filters - replace with actual data fetching
  const doctors = [
    { id: "1", name: "Dr. Smith" },
    { id: "2", name: "Dr. Emily" },
  ];
  const statuses = [
    { value: "all", label: "All Statuses" },
    { value: "confirmed", label: "Confirmed" },
    { value: "pending", label: "Pending" },
    { value: "cancelled", label: "Cancelled" },
  ];


  return (
    <Card className="shadow-lg col-span-1 lg:col-span-2"> {/* Adjust col-span as needed */}
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
                <CardTitle className="text-xl font-semibold text-primary flex items-center">
                <CalendarDays className="mr-2 h-6 w-6" />
                Appointment Calendar
                </CardTitle>
                <CardDescription>View and manage scheduled appointments.</CardDescription>
            </div>
            <Button variant="outline" size="sm">View Full Calendar</Button> {/* Link to /appointments page */}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-3 border rounded-md bg-secondary/30">
            <div>
                <Label htmlFor="doctorFilter" className="text-xs text-muted-foreground">Doctor</Label>
                <Select defaultValue="all">
                    <SelectTrigger id="doctorFilter" className="h-9">
                        <SelectValue placeholder="All Doctors" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Doctors</SelectItem>
                        {doctors.map(doc => <SelectItem key={doc.id} value={doc.id}>{doc.name}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <div>
                <Label htmlFor="statusFilter" className="text-xs text-muted-foreground">Status</Label>
                <Select defaultValue="all">
                    <SelectTrigger id="statusFilter" className="h-9">
                        <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                        {statuses.map(status => <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>)}
                    </SelectContent>
                </Select>
            </div>
            <Button variant="outline" className="h-9 sm:self-end">
                <Filter className="mr-2 h-4 w-4" /> Apply Filters
            </Button>
        </div>
        
        {/* Placeholder for the actual interactive calendar */}
        {/* For a real implementation, you'd replace this with FullCalendar, React Big Calendar, or similar */}
        <div className="flex justify-center items-center min-h-[300px] border-2 border-dashed border-muted-foreground/30 rounded-md p-4">
            {/* Minimalistic calendar using ShadCN's component for date picking, not a full view. */}
            {/* <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border self-start"
            /> */}
            <div className="text-center text-muted-foreground">
                <CalendarDays className="mx-auto h-16 w-16 mb-2" />
                <p className="font-semibold">Interactive Calendar View</p>
                <p className="text-sm">Full calendar functionality will be displayed here.</p>
                <p className="text-xs mt-2">(Requires integration of a dedicated calendar library)</p>
            </div>
        </div>
        <p className="text-xs text-muted-foreground text-center">
            This widget provides a quick overview. For detailed scheduling, visit the main Appointments page.
        </p>
      </CardContent>
    </Card>
  );
}

// Dummy Label component if not globally available or for isolation
const Label = ({ htmlFor, children, className }: { htmlFor?: string, children: React.ReactNode, className?: string }) => (
  <label htmlFor={htmlFor} className={`block text-sm font-medium mb-1 ${className}`}>
    {children}
  </label>
);
