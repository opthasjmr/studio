"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, DocumentData } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit3, Loader2, UserCircle, Calendar, Phone, Mail, MapPin, ShieldAlert, Briefcase, FileText } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

interface PatientDetails extends DocumentData {
  id: string;
  name: string;
  dob: string;
  phone?: string;
  email?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  medicalHistory?: string;
  // Add other fields as necessary
}

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, role }_ = useAuth(); // Role might be used for edit permissions
  const [patient, setPatient] = useState<PatientDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const patientId = params.id as string;

  useEffect(() => {
    if (patientId && user) {
      const fetchPatientDetails = async () => {
        setLoading(true);
        try {
          const patientDocRef = doc(db, "patients", patientId);
          const patientDocSnap = await getDoc(patientDocRef);

          if (patientDocSnap.exists()) {
            // TODO: Add role-based access control here
            // For example, check if the current user (doctor/receptionist/admin) has permission or if it's the patient themselves.
            setPatient({ id: patientDocSnap.id, ...patientDocSnap.data() } as PatientDetails);
          } else {
            // Handle patient not found
            router.push("/patients"); // Or a 404 page
          }
        } catch (error) {
          console.error("Error fetching patient details:", error);
          // Handle error, e.g., show toast
        } finally {
          setLoading(false);
        }
      };
      fetchPatientDetails();
    } else if (!user) {
       // If user is not loaded yet, wait. If user is null (not logged in), middleware should handle it.
    } else {
        setLoading(false); // No patientId
    }
  }, [patientId, user, router]);
  
  const DetailItem = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value?: string }) => (
    value ? (
      <div className="flex items-start space-x-3">
        <Icon className="h-5 w-5 text-primary mt-1 flex-shrink-0" />
        <div>
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-md text-foreground">{value}</p>
        </div>
      </div>
    ) : null
  );

  if (loading) {
    return (
      <div className="container mx-auto py-10 px-4 max-w-4xl">
        <Skeleton className="h-10 w-1/4 mb-6" /> 
        <Card className="shadow-xl">
          <CardHeader>
            <Skeleton className="h-8 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </CardHeader>
          <CardContent className="space-y-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-start space-x-3">
                <Skeleton className="h-6 w-6 rounded-full" />
                <div className="w-full">
                  <Skeleton className="h-4 w-1/4 mb-1" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="container mx-auto py-10 px-4 text-center">
        <p className="text-xl text-muted-foreground">Patient not found or access denied.</p>
        <Button onClick={() => router.push('/patients')} variant="outline" className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Patients
        </Button>
      </div>
    );
  }
  
  // Calculate age
  const calculateAge = (dobString: string): number => {
    const birthDate = new Date(dobString);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
  };


  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
       <Button onClick={() => router.back()} variant="outline" className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back
        </Button>
      <Card className="shadow-xl overflow-hidden">
        <CardHeader className="bg-primary/10 p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div className="flex items-center space-x-4">
               <UserCircle className="h-16 w-16 text-primary" />
                <div>
                  <CardTitle className="text-3xl font-bold text-primary">{patient.name}</CardTitle>
                  <CardDescription className="text-lg">
                    Patient ID: {patient.id}
                  </CardDescription>
                </div>
            </div>
            { (role === "admin" || role === "doctor" || role === "receptionist") &&
              <Button asChild variant="outline" className="mt-4 md:mt-0 border-primary text-primary hover:bg-primary/10">
                <Link href={`/patients/${patient.id}/edit`}>
                  <Edit3 className="mr-2 h-4 w-4" /> Edit Patient
                </Link>
              </Button>
            }
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-8">
          
          <section>
            <h3 className="text-xl font-semibold text-primary mb-4 border-b pb-2">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
              <DetailItem icon={Calendar} label="Date of Birth" value={`${new Date(patient.dob).toLocaleDateString()} (${calculateAge(patient.dob)} years old)`} />
              <DetailItem icon={Phone} label="Phone Number" value={patient.phone} />
              <DetailItem icon={Mail} label="Email Address" value={patient.email} />
              <DetailItem icon={MapPin} label="Address" value={patient.address} />
            </div>
          </section>

          <section>
            <h3 className="text-xl font-semibold text-primary mb-4 border-b pb-2">Emergency Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <DetailItem icon={ShieldAlert} label="Contact Name" value={patient.emergencyContactName} />
                <DetailItem icon={Phone} label="Contact Phone" value={patient.emergencyContactPhone} />
            </div>
             {!patient.emergencyContactName && !patient.emergencyContactPhone && <p className="text-sm text-muted-foreground">No emergency contact information provided.</p>}
          </section>
          
          <section>
            <h3 className="text-xl font-semibold text-primary mb-4 border-b pb-2">Insurance Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                <DetailItem icon={Briefcase} label="Provider" value={patient.insuranceProvider} />
                <DetailItem icon={FileText} label="Policy Number" value={patient.insurancePolicyNumber} />
            </div>
            {!patient.insuranceProvider && !patient.insurancePolicyNumber && <p className="text-sm text-muted-foreground">No insurance information provided.</p>}
          </section>

          <section>
            <h3 className="text-xl font-semibold text-primary mb-4 border-b pb-2">Medical History</h3>
            {patient.medicalHistory ? (
                 <p className="text-md text-foreground whitespace-pre-wrap">{patient.medicalHistory}</p>
            ) : (
                 <p className="text-sm text-muted-foreground">No medical history summary provided.</p>
            )}
          </section>

          {/* Placeholder for future sections like Appointments, Medical Records, Diagnostic Images */}
          {/* <section>
            <h3 className="text-xl font-semibold text-primary mb-4 border-b pb-2">Appointments</h3>
            <p className="text-muted-foreground">Appointments will be listed here.</p>
          </section>
          <section>
            <h3 className="text-xl font-semibold text-primary mb-4 border-b pb-2">Medical Records (EMR)</h3>
            <p className="text-muted-foreground">Medical records will be displayed here.</p>
          </section> */}

        </CardContent>
      </Card>
    </div>
  );
}
