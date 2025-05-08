
'use server';
import { collection, getDocs, query, where, Timestamp, orderBy, limit,getCountFromServer } from 'firebase/firestore';
import { db } from '@/lib/firebase'; // Import potentially null service
import { format, startOfDay, endOfDay } from 'date-fns';

const serviceInitializationError = "Firebase Firestore service is not properly initialized. Check server logs and configuration.";


export interface Appointment {
  id: string;
  patientName: string;
  doctorName: string;
  date: string; // YYYY-MM-DD
  time: string;
  status: 'Confirmed' | 'Pending' | 'Cancelled';
  createdAt: Timestamp;
}

export interface TreatmentHistoryItem {
  date: string; // YYYY-MM-DD
  treatment: string;
  notes?: string;
}

export interface Patient {
  id: string;
  name: string;
  dob: string;
  tags?: string[];
  ocularHistory?: string;
  currentMedications?: string[];
  treatmentHistory?: TreatmentHistoryItem[];
  createdAt: Timestamp; // Firestore Timestamp
  updatedAt?: Timestamp; // Firestore Timestamp
}


export interface RecentActivity {
  id: string;
  type: 'New Patient' | 'Patient Update' | 'New Appointment' | 'Appointment Update';
  description: string;
  timestamp: Date; // JS Date object
  link: string;
}

export async function getTotalPatientsCount(): Promise<number> {
  if (!db) {
      console.error("getTotalPatientsCount Error:", serviceInitializationError);
      return 0;
  }
  try {
    const patientsCollection = collection(db, 'patients');
    const snapshot = await getCountFromServer(patientsCollection);
    return snapshot.data().count;
  } catch (error) {
    console.error("Error fetching total patients count:", error);
    return 0;
  }
}

export async function getTodaysAppointmentsCount(): Promise<number> {
   if (!db) {
      console.error("getTodaysAppointmentsCount Error:", serviceInitializationError);
      return 0;
  }
  try {
    const today = format(new Date(), 'yyyy-MM-dd');
    const appointmentsCollection = collection(db, 'appointments');
    const q = query(
      appointmentsCollection,
      where('date', '==', today),
      where('status', '!=', 'Cancelled')
    );
    const snapshot = await getCountFromServer(q);
    return snapshot.data().count;
  } catch (error) {
    console.error("Error fetching today's appointments count:", error);
    return 0;
  }
}


export async function getUpcomingAppointments(maxCount = 5): Promise<Appointment[]> {
   if (!db) {
      console.error("getUpcomingAppointments Error:", serviceInitializationError);
      return [];
  }
  try {
    const today = format(new Date(), 'yyyy-MM-dd');
    const appointmentsCollection = collection(db, 'appointments');
    const q = query(
      appointmentsCollection,
      where('date', '>=', today),
      where('status', '!=', 'Cancelled'),
      orderBy('date', 'asc'),
      orderBy('time', 'asc'),
      limit(maxCount)
    );
    const querySnapshot = await getDocs(q);
    // Ensure data conforms to Appointment interface, especially Timestamps
    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            patientName: data.patientName || 'N/A',
            doctorName: data.doctorName || 'N/A',
            date: data.date || 'N/A',
            time: data.time || 'N/A',
            status: data.status || 'Pending',
            createdAt: data.createdAt || Timestamp.now(), // Provide a default Timestamp if missing
        } as Appointment;
    });
  } catch (error) {
    console.error("Error fetching upcoming appointments:", error);
    return [];
  }
}

export async function getRecentActivities(maxCount = 5): Promise<RecentActivity[]> {
   if (!db) {
      console.error("getRecentActivities Error:", serviceInitializationError);
      return [];
  }
  const activities: RecentActivity[] = [];

  try {
    // Recent patient registrations/updates
    const patientsCollection = collection(db, 'patients');
    // Order by updatedAt if available, otherwise createdAt
    // This requires composite indexes in Firestore: (updatedAt desc) and (createdAt desc)
    // For simplicity, let's assume we sort by createdAt for new patient registrations primarily for this widget
    const patientQuery = query(patientsCollection, orderBy('createdAt', 'desc'), limit(maxCount));
    const patientSnapshot = await getDocs(patientQuery);
    patientSnapshot.docs.forEach(doc => {
      const data = doc.data() as Patient; // Casting to Patient
      const createdAtDate = data.createdAt?.toDate ? data.createdAt.toDate() : new Date(); // Handle potential null or non-timestamp
      const updatedAtDate = data.updatedAt?.toDate ? data.updatedAt.toDate() : createdAtDate;
      // Determine if it's an new patient or an update based on createdAt vs updatedAt
      // This is a simplified logic. Real-world might need a dedicated activity log.
      const isUpdate = updatedAtDate.getTime() > createdAtDate.getTime() + 1000; // Allow small diff for creation timestamp
      activities.push({
        id: doc.id,
        type: isUpdate ? 'Patient Update' : 'New Patient',
        description: `${isUpdate ? 'Updated record for' : 'Patient'} ${data.name || 'Unknown'} ${isUpdate ? ' ' : 'registered.'}`,
        timestamp: updatedAtDate,
        link: `/patients/${doc.id}`
      });
    });

    // Recent appointments
    const appointmentsCollection = collection(db, 'appointments');
    const appointmentQuery = query(appointmentsCollection, orderBy('createdAt', 'desc'), limit(maxCount));
    const appointmentSnapshot = await getDocs(appointmentQuery);
    appointmentSnapshot.docs.forEach(doc => {
      const data = doc.data() as Appointment;
      const createdAtDate = data.createdAt?.toDate ? data.createdAt.toDate() : new Date();
      activities.push({
        id: doc.id,
        type: 'New Appointment', // Could also be 'Appointment Update'
        description: `Appointment for ${data.patientName || 'Unknown'} with ${data.doctorName || 'N/A'} on ${data.date || 'N/A'}.`,
        timestamp: createdAtDate,
        link: `/appointments` // Maybe link to specific appointment later?
      });
    });

    // Sort all collected activities by timestamp descending and limit
    return activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, maxCount);

  } catch (error) {
    console.error("Error fetching recent activities:", error);
    // Return whatever was collected before the error, or empty array
    return activities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()).slice(0, maxCount);
  }
}

export interface PatientsByConditionData {
  condition: string;
  count: number;
}

export async function getPatientsByCondition(): Promise<PatientsByConditionData[]> {
   if (!db) {
      console.error("getPatientsByCondition Error:", serviceInitializationError);
      return [];
  }
  try {
    const patientsCollection = collection(db, 'patients');
    const patientSnapshot = await getDocs(patientsCollection);
    const conditionCounts: Record<string, number> = {};

    patientSnapshot.docs.forEach(doc => {
      const patient = doc.data() as Patient;
      if (patient.tags && Array.isArray(patient.tags) && patient.tags.length > 0) { // Add Array.isArray check
        patient.tags.forEach(tag => {
          if (typeof tag === 'string' && tag.trim()) { // Ensure tag is a non-empty string
             conditionCounts[tag.trim()] = (conditionCounts[tag.trim()] || 0) + 1;
          }
        });
      } else {
        // Optional: Group untagged patients or handle as needed
        // conditionCounts['Untagged'] = (conditionCounts['Untagged'] || 0) + 1;
      }
    });

    return Object.entries(conditionCounts).map(([condition, count]) => ({ condition, count }));
  } catch (error) {
    console.error("Error fetching patients by condition:", error);
    return [];
  }
}


export async function getPendingBillsCount(): Promise<number> {
  // Placeholder - Implement actual logic if billing is stored in Firestore
  return Promise.resolve(0);
}

export async function getCriticalAlertsCount(): Promise<number> {
   if (!db) {
      console.error("getCriticalAlertsCount Error:", serviceInitializationError);
      return 0;
  }
  // Example: count patients tagged with 'High Risk' or 'Critical'
   try {
    const patientsCollection = collection(db, 'patients');
    // Ensure tags are valid strings before querying
    const validTags = ['High Risk', 'Critical', 'Glaucoma Suspect', 'AMD Advanced'].filter(tag => typeof tag === 'string');
    if (validTags.length === 0) return 0; // No valid tags to query

    const q = query(patientsCollection, where('tags', 'array-contains-any', validTags));
    const snapshot = await getCountFromServer(q);
    return snapshot.data().count;
  } catch (error) {
    // Firestore throws if `array-contains-any` value is empty or not an array, handle this
    if (error instanceof Error && (error.message.includes("array-contains-any") || error.message.includes("Invalid Query"))) {
      console.warn("Warning fetching critical alerts count (potentially empty tags or index issue):", error.message);
      return 0; // Return 0 if the query is invalid (e.g., no valid tags)
    }
    console.error("Error fetching critical alerts/high-risk patients count:", error);
    return 0;
  }
}

```

</content>
  </change>
  <change>
    <file>src/app/(app)/patients/page.tsx</file>
    <description>Add check for null db service before fetching patients. Display error message if Firebase is unavailable.</description>
    <content><![CDATA[

"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Users, Search, PlusCircle, Tag, AlertTriangle } from "lucide-react"; // Added AlertTriangle
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/shared/DataTable";
import type { ColumnDef } from "@tanstack/react-table";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase"; // Import potentially null service
import { collection, getDocs, query, where, DocumentData } from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"; // Added Alert components

interface Patient {
  id: string;
  name: string;
  dob: string;
  phone: string;
  lastVisit?: string;
  tags?: string[];
}

const columns: ColumnDef<Patient>[] = [
  {
    accessorKey: "name",
    header: "Name",
     cell: ({ row }) => row.original.name || "N/A", // Handle potential undefined name
  },
  {
    accessorKey: "dob",
    header: "Date of Birth",
    cell: ({ row }) => {
        try {
            return row.original.dob ? new Date(row.original.dob).toLocaleDateString() : "N/A";
        } catch (e) {
            console.error("Invalid date format for DOB:", row.original.dob);
            return "Invalid Date";
        }
    },
  },
  {
    accessorKey: "phone",
    header: "Phone",
     cell: ({ row }) => row.original.phone || "N/A", // Handle potential undefined phone
  },
  {
    accessorKey: "lastVisit",
    header: "Last Visit",
    cell: ({ row }) => {
        try {
            return row.original.lastVisit ? new Date(row.original.lastVisit).toLocaleDateString() : "N/A";
        } catch (e) {
             // Don't log error for missing lastVisit, just display N/A
             return "N/A";
        }
    },
  },
  {
    accessorKey: "tags",
    header: () => <div className="flex items-center"><Tag className="mr-1 h-4 w-4" />Tags</div>,
    cell: ({ row }) => {
      const tags = row.original.tags;
      // Ensure tags is an array before mapping
      if (!tags || !Array.isArray(tags) || tags.length === 0) return <span className="text-muted-foreground text-xs">None</span>;
      return (
        <div className="flex flex-wrap gap-1">
          {tags.map((tag, index) => (
             // Ensure tag is a string
            typeof tag === 'string' ? (
                <Badge key={index} variant="outline" className="text-xs px-1.5 py-0.5 whitespace-nowrap">
                {tag}
                </Badge>
            ) : null
          ))}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <Button variant="outline" size="sm" asChild>
        <Link href={`/patients/${row.original.id}`}>View Details</Link>
      </Button>
    ),
  },
];


export default function PatientRecordsPage() {
  const { user, role } = useAuth();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [fetchError, setFetchError] = useState<string | null>(null); // State for fetch errors

  useEffect(() => {
    const fetchPatients = async () => {
      setLoading(true);
      setFetchError(null); // Reset error on new fetch attempt

      // Check if db service is available
      if (!db) {
          setFetchError("Database service is unavailable. Please check configuration.");
          setLoading(false);
          return;
      }

      if (!user || !role) {
        setLoading(false);
        // Don't set an error here, it might just be that auth is still loading
        return;
      }

      try {
        let patientsQuery;
        // Define base query
        const baseQuery = collection(db, "patients");

        // Apply role-based filtering
        if (role === 'admin' || role === 'receptionist' || role === 'doctor') {
          // Admins, receptionists, and doctors can see all patients (or apply other logic if needed)
           patientsQuery = query(baseQuery); // No specific filtering needed for these roles based on current logic
        } else if (role === 'patient') {
          // Patients can only see their own record (assuming patient records have a userId field matching auth uid)
           patientsQuery = query(baseQuery, where("userId", "==", user.uid));
        } else {
             // If role is undefined or unexpected, fetch nothing
             console.warn(`Unexpected role "${role}", fetching no patients.`);
             setPatients([]);
             setLoading(false);
             return;
        }

        const querySnapshot = await getDocs(patientsQuery);
        const patientData = querySnapshot.docs.map(doc => ({
            id: doc.id,
            // Provide defaults for potentially missing fields to match the interface
            name: doc.data().name || 'Unnamed Patient',
            dob: doc.data().dob || '', // Assuming DOB is stored as string 'YYYY-MM-DD'
            phone: doc.data().phone || '',
            lastVisit: doc.data().lastVisit || undefined, // Assuming lastVisit might be a string or Timestamp
            tags: doc.data().tags || [],
         } as Patient)); // Explicit cast after providing defaults
        setPatients(patientData);
      } catch (error: any) {
        console.error("Error fetching patients: ", error);
        setFetchError(`Failed to fetch patient data: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, [user, role]); // Rerun when user or role changes

  const filteredPatients = patients.filter(patient =>
    (patient.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
    (patient.phone && patient.phone.includes(searchTerm)) ||
    (patient.tags && Array.isArray(patient.tags) && patient.tags.some(tag => typeof tag === 'string' && tag.toLowerCase().includes(searchTerm.toLowerCase())))
  );


  return (
    <div className="container mx-auto py-10 px-4">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <CardTitle className="text-3xl font-bold text-primary flex items-center">
                <Users className="mr-3 h-8 w-8" /> Patient Records
              </CardTitle>
              <CardDescription className="text-lg mt-1">
                Manage and view patient information.
              </CardDescription>
            </div>
            {(role === 'admin' || role === 'receptionist' || role === 'doctor') && (
            <Button asChild className="mt-4 md:mt-0">
              <Link href="/patients/new">
                <PlusCircle className="mr-2 h-5 w-5" /> Add New Patient
              </Link>
            </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
           {loading && (
             <div className="space-y-4 mt-6">
               <Skeleton className="h-10 w-1/2 mb-4" />
                {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full mb-2" />
                ))}
             </div>
            )}

          {!loading && fetchError && ( // Display error if fetching failed
            <Alert variant="destructive" className="mt-6">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Error Fetching Data</AlertTitle>
              <AlertDescription>{fetchError}</AlertDescription>
            </Alert>
           )}

          {!loading && !fetchError && ( // Only show search and table if no error and not loading
            <>
                <div className="mb-6 mt-4">
                    <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search patients by name, phone, or tag..."
                        className="pl-10 w-full md:w-1/2"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    </div>
                </div>

                {patients.length === 0 && !loading ? (
                <div className="text-center py-10">
                    <Users className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-2 text-xl font-semibold">No Patients Found</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                    {(role === 'admin' || role === 'receptionist' || role === 'doctor') ? "Get started by adding a new patient." : "Your patient records will appear here."}
                    </p>
                    {(role === 'admin' || role === 'receptionist' || role === 'doctor') && (
                    <Button asChild className="mt-6">
                    <Link href="/patients/new"><PlusCircle className="mr-2 h-4 w-4" />Add Patient</Link>
                    </Button>
                    )}
                </div>
                ) : (
                  filteredPatients.length === 0 && searchTerm ? (
                    <p className="text-muted-foreground text-center py-4">No patients match your search term &quot;{searchTerm}&quot;.</p>
                  ) : (
                    <DataTable columns={columns} data={filteredPatients} />
                  )
                )}
            </>
           )}
        </CardContent>
      </Card>
    </div>
  );
}
