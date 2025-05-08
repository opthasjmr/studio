
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { doc, getDoc, DocumentData, Timestamp } from "firebase/firestore"; // Ensure Timestamp is imported
import { db } from "@/lib/firebase"; // Import potentially null service
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Edit3, Loader2, UserCircle, Calendar, Phone, Mail, MapPin, ShieldAlert, Briefcase, FileText, Tag, History, Pill, Eye, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"; // Added Alert components

interface TreatmentHistoryItem {
  date: string; // Should be string 'YYYY-MM-DD' based on saving logic
  treatment: string;
  notes?: string;
}

interface PatientDetails extends DocumentData {
  id: string;
  name: string;
  dob: string; // Expecting 'YYYY-MM-DD' string
  phone?: string;
  email?: string;
  address?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  medicalHistory?: string; // General medical history
  ocularHistory?: string; // Specific eye history
  currentMedications?: string[]; // List of medications
  treatmentHistory?: TreatmentHistoryItem[]; // Structured treatment history
  tags?: string[];
  userId?: string; // Added userId for potential access checks
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, role } = useAuth();
  const [patient, setPatient] = useState<PatientDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null); // State for fetch errors
  const patientId = params.id as string;
  const isDbAvailable = !!db; // Check if db is initialized

  useEffect(() => {
    if (patientId && user) {
      const fetchPatientDetails = async () => {
        setLoading(true);
        setFetchError(null);

        if (!db) {
            setFetchError("Database service is unavailable. Please check configuration.");
            setLoading(false);
            return;
        }

        try {
          const patientDocRef = doc(db, "patients", patientId);
          const patientDocSnap = await getDoc(patientDocRef);

          if (patientDocSnap.exists()) {
            const data = patientDocSnap.data();

             // Basic access control: Check if the logged-in user should see this patient
             // Admins, Doctors, Receptionists can see all (based on current logic)
             // Patients can only see their own record if 'userId' field matches
             if (role === 'patient' && data.userId !== user.uid) {
                 setFetchError("You do not have permission to view this patient's record.");
                 setPatient(null);
                 setLoading(false);
                 // Optionally redirect: router.push('/dashboard');
                 return;
             }

            // Map Firestore data to PatientDetails interface, providing defaults
            const loadedPatient: PatientDetails = {
              id: patientDocSnap.id,
              name: data.name || 'Unnamed Patient',
              dob: data.dob || 'N/A', // Expecting string 'YYYY-MM-DD'
              phone: data.phone || undefined,
              email: data.email || undefined,
              address: data.address || undefined,
              emergencyContactName: data.emergencyContactName || undefined,
              emergencyContactPhone: data.emergencyContactPhone || undefined,
              insuranceProvider: data.insuranceProvider || undefined,
              insurancePolicyNumber: data.insurancePolicyNumber || undefined,
              medicalHistory: data.medicalHistory || "Not specified.",
              ocularHistory: data.ocularHistory || "Not specified.",
              currentMedications: Array.isArray(data.currentMedications) ? data.currentMedications : [],
              // Ensure treatment history items have the expected structure
              treatmentHistory: Array.isArray(data.treatmentHistory) ? data.treatmentHistory.map((item: any) => ({
                    date: item.date || 'N/A', // Expecting string 'YYYY-MM-DD'
                    treatment: item.treatment || 'N/A',
                    notes: item.notes || undefined,
                })) : [],
              tags: Array.isArray(data.tags) ? data.tags : [],
              userId: data.userId || undefined,
              createdAt: data.createdAt,
              updatedAt: data.updatedAt,
            };
            setPatient(loadedPatient);
          } else {
            setFetchError("Patient record not found.");
            // router.push("/patients"); // Optionally redirect if not found
          }
        } catch (error: any) {
          console.error("Error fetching patient details:", error);
          setFetchError(`Failed to load patient details: ${error.message}`);
        } finally {
          setLoading(false);
        }
      };
      fetchPatientDetails();
    } else if (!user) {
       // User not loaded yet, wait for auth context
    } else if (!patientId) {
        setFetchError("Invalid patient ID.");
        setLoading(false);
    } else {
        // Should not happen if checks above are correct, but handle just in case
        setLoading(false);
    }
  }, [patientId, user, role, router]); // Add role and router to dependencies

  const DetailItem = ({ icon: Icon, label, value, children }: { icon?: React.ElementType, label: string, value?: string | React.ReactNode, children?: React.ReactNode }) => (
    (value || children) ? (
      <div className="flex items-start space-x-3 py-2">
        {Icon && <Icon className="h-5 w-5 text-primary mt-1 flex-shrink-0" />}
        <div className={!Icon ? "pl-8" : ""}> {/* Indent if no icon */}
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          {value && typeof value === 'string' ? <p className="text-md text-foreground">{value}</p> : value}
          {children}
        </div>
      </div>
    ) : null
  );

  const calculateAge = (dobString: string): string => {
     if (!dobString || dobString === 'N/A') return 'N/A';
    try {
        const birthDate = new Date(dobString);
         // Check if the parsed date is valid
        if (isNaN(birthDate.getTime())) {
            throw new Error("Invalid date");
        }
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return `${age} years old`;
    } catch (e) {
        console.error("Error calculating age:", e);
        return "Invalid DOB";
    }
  };

  const formatDate = (dateString: string): string => {
       if (!dateString || dateString === 'N/A') return 'N/A';
      try {
          const date = new Date(dateString);
          if (isNaN(date.getTime())) {
            throw new Error("Invalid date");
          }
          // Use a consistent format, e.g., Aug 10, 2023
          return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
      } catch(e) {
           console.error("Error formatting date:", e);
           return "Invalid Date";
      }
  };


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
            {[...Array(10)].map((_, i) => ( // Increased array size for new sections
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

   if (fetchError) { // Display error if fetching failed
     return (
      <div className="container mx-auto py-10 px-4 max-w-4xl">
         <Button onClick={() => router.back()} variant="outline" className="mb-6">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
         </Button>
         <Alert variant="destructive" className="mt-6">
           <AlertTriangle className="h-4 w-4" />
           <AlertTitle>Error Loading Patient</AlertTitle>
           <AlertDescription>{fetchError}</AlertDescription>
         </Alert>
       </div>
     );
   }

  if (!patient) { // Should be covered by fetchError, but keep as a fallback
    return (
      <div className="container mx-auto py-10 px-4 text-center">
        <p className="text-xl text-muted-foreground">Patient not found or access denied.</p>
        <Button onClick={() => router.push('/patients')} variant="outline" className="mt-4">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Patients
        </Button>
      </div>
    );
  }


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
            {/* Allow editing only for specific roles */}
            { (role === "admin" || role === "doctor" || role === "receptionist") && isDbAvailable &&
              <Button asChild variant="outline" className="mt-4 md:mt-0 border-primary text-primary hover:bg-primary/10">
                <Link href={`/patients/${patient.id}/edit`}>
                  <Edit3 className="mr-2 h-4 w-4" /> Edit Patient
                </Link>
              </Button>
            }
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">

          <section>
            <h3 className="text-xl font-semibold text-primary mb-3 border-b pb-2">Personal Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
              <DetailItem icon={Calendar} label="Date of Birth" value={`${formatDate(patient.dob)} (${calculateAge(patient.dob)})`} />
              <DetailItem icon={Phone} label="Phone Number" value={patient.phone || 'N/A'} />
              <DetailItem icon={Mail} label="Email Address" value={patient.email || 'N/A'} />
              <DetailItem icon={MapPin} label="Address" value={patient.address || 'N/A'} />
            </div>
          </section>
          <Separator/>

          {patient.tags && Array.isArray(patient.tags) && patient.tags.length > 0 && (
            <section>
              <h3 className="text-xl font-semibold text-primary mb-3 border-b pb-2 flex items-center">
                <Tag className="mr-2 h-5 w-5" /> Patient Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {patient.tags.map((tag, index) => (
                   typeof tag === 'string' ? (
                      <Badge key={index} variant="secondary" className="text-sm px-3 py-1">
                        {tag}
                      </Badge>
                   ) : null
                ))}
              </div>
            </section>
          )}
           <Separator/>

          <section>
            <h3 className="text-xl font-semibold text-primary mb-3 border-b pb-2">Emergency Contact</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
                <DetailItem icon={ShieldAlert} label="Contact Name" value={patient.emergencyContactName} />
                <DetailItem icon={Phone} label="Contact Phone" value={patient.emergencyContactPhone} />
            </div>
             {!patient.emergencyContactName && !patient.emergencyContactPhone && <p className="text-sm text-muted-foreground ml-8">No emergency contact information provided.</p>}
          </section>
           <Separator/>

          <section>
            <h3 className="text-xl font-semibold text-primary mb-3 border-b pb-2">Insurance Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
                <DetailItem icon={Briefcase} label="Provider" value={patient.insuranceProvider} />
                <DetailItem icon={FileText} label="Policy Number" value={patient.insurancePolicyNumber} />
            </div>
            {!patient.insuranceProvider && !patient.insurancePolicyNumber && <p className="text-sm text-muted-foreground ml-8">No insurance information provided.</p>}
          </section>
          <Separator/>

          {/* Enhanced EMR Sections */}
           <section>
            <h3 className="text-xl font-semibold text-primary mb-3 border-b pb-2 flex items-center"><FileText className="mr-2 h-5 w-5" />Medical Summary</h3>
            <DetailItem icon={Eye} label="Ocular History" value={patient.ocularHistory || "Not specified."} />
            <DetailItem icon={FileText} label="General Medical History" value={patient.medicalHistory || "Not specified."} />
          </section>
          <Separator/>

          <section>
            <h3 className="text-xl font-semibold text-primary mb-3 border-b pb-2 flex items-center"><Pill className="mr-2 h-5 w-5" />Current Medications</h3>
            {patient.currentMedications && Array.isArray(patient.currentMedications) && patient.currentMedications.length > 0 ? (
                 <ul className="list-disc list-inside ml-8 space-y-1 text-md text-foreground">
                    {patient.currentMedications.map((med, index) => typeof med === 'string' ? <li key={index}>{med}</li> : null)}
                 </ul>
            ) : (
                 <p className="text-sm text-muted-foreground ml-8">No current medications listed.</p>
            )}
          </section>
          <Separator/>

          <section>
            <h3 className="text-xl font-semibold text-primary mb-3 border-b pb-2 flex items-center"><History className="mr-2 h-5 w-5" />Treatment History</h3>
            {patient.treatmentHistory && Array.isArray(patient.treatmentHistory) && patient.treatmentHistory.length > 0 ? (
                 <div className="space-y-3 ml-8">
                    {patient.treatmentHistory.map((item, index) => (
                        <div key={index} className="p-3 border-l-4 border-primary/50 bg-secondary/30 rounded-r-md">
                            <p className="font-semibold text-foreground">{item.treatment || 'N/A'} - <span className="text-sm text-muted-foreground">{formatDate(item.date)}</span></p>
                            {item.notes && <p className="text-sm text-muted-foreground mt-1">Notes: {item.notes}</p>}
                        </div>
                    ))}
                 </div>
            ) : (
                 <p className="text-sm text-muted-foreground ml-8">No treatment history available.</p>
            )}
          </section>
          <Separator/>

          {/* Placeholder for Diagnostic Images - for future integration */}
          {(role === 'doctor' || role === 'admin') && (
            <section>
              <h3 className="text-xl font-semibold text-primary mb-3 border-b pb-2">Diagnostic Images</h3>
              <div className="text-center py-6 border-2 border-dashed border-muted-foreground/30 rounded-md">
                <Eye className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                <p className="text-muted-foreground">Diagnostic image uploads and viewer will be available here.</p>
                <Button variant="outline" size="sm" className="mt-3" disabled>Upload Images</Button>
              </div>
            </section>
          )}

        </CardContent>
      </Card>
    </div>
  );
}
