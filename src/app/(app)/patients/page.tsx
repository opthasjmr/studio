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