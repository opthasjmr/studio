
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Video, MessageSquare, Users, CalendarPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
// import Link from "next/link";

export default function TelemedicinePage() {
  // Placeholder data for upcoming consultations
  const upcomingConsultations = [
    // { id: "tel-001", patientName: "Alice Wonderland", time: "Tomorrow at 10:00 AM", doctorName: "Dr. Smith" },
  ];

  return (
    <div className="container mx-auto py-10 px-4">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <CardTitle className="text-3xl font-bold text-primary flex items-center">
                <Video className="mr-3 h-8 w-8" /> Telemedicine Portal
              </CardTitle>
              <CardDescription className="text-lg mt-1">
                Conduct secure video consultations and manage remote patient interactions.
              </CardDescription>
            </div>
            {/* <Button> <CalendarPlus className="mr-2 h-5 w-5" /> Schedule Tele-Consult </Button> */}
          </div>
        </CardHeader>
        <CardContent className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-foreground mb-3">Upcoming Consultations</h2>
            {upcomingConsultations.length === 0 ? (
              <div className="text-center py-10 border-2 border-dashed border-muted-foreground/30 rounded-md">
                <Video className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-2 text-muted-foreground">
                  No upcoming tele-consultations scheduled.
                </p>
                 {/* <Button className="mt-4">Schedule New Tele-Consultation</Button> */}
              </div>
            ) : (
              <div className="space-y-3">
                {/* Map through upcomingConsultations and display them */}
                {upcomingConsultations.map(consult => (
                  <div key={consult.id} className="flex justify-between items-center p-4 border rounded-lg bg-secondary/50">
                    <div>
                      <p className="font-semibold text-primary">{consult.patientName}</p>
                      <p className="text-sm text-muted-foreground">With {consult.doctorName} - {consult.time}</p>
                    </div>
                    <Button variant="default">Join Call</Button>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center text-primary"><Users className="mr-2 h-5 w-5" /> Virtual Waiting Room</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Manage patients waiting for their turn. (Feature in development)</p>
                <Button variant="outline" className="mt-3 w-full" disabled>Open Waiting Room</Button>
              </CardContent>
            </Card>
            <Card className="hover:shadow-md transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center text-primary"><MessageSquare className="mr-2 h-5 w-5" /> Secure Chat</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">Communicate with patients via secure messaging. (Feature in development)</p>
                <Button variant="outline" className="mt-3 w-full" disabled>Open Chat</Button>
              </CardContent>
            </Card>
          </section>
           <p className="text-xs text-muted-foreground text-center pt-4">
              Ensure you have a stable internet connection and appropriate permissions before starting a tele-consultation.
           </p>
        </CardContent>
      </Card>
    </div>
  );
}
