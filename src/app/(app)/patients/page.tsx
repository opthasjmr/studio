"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Users, Search, PlusCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/shared/DataTable"; // Assuming a generic DataTable component
import type { ColumnDef } from "@tanstack/react-table"; // For DataTable typing
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, DocumentData } from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

// Define Patient type based on Firestore structure
interface Patient {
  id: string;
  name: string;
  dob: string; // Or Date
  phone: string;
  lastVisit?: string; // Or Date
  tags?: string[];
}

// Define columns for the DataTable
const columns: ColumnDef<Patient>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "dob",
    header: "Date of Birth",
    cell: ({ row }) => new Date(row.original.dob).toLocaleDateString(),
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorKey: "lastVisit",
    header: "Last Visit",
    cell: ({ row }) => row.original.lastVisit ? new Date(row.original.lastVisit).toLocaleDateString() : "N/A",
  },
  {
    accessorKey: "tags",
    header: "Tags",
    cell: ({ row }) => (row.original.tags || []).join(", "),
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

  useEffect(() => {
    const fetchPatients = async () => {
      if (!user || !role) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        let patientsQuery;
        if (role === 'admin' || role === 'receptionist') {
          patientsQuery = query(collection(db, "patients"));
        } else if (role === 'doctor') {
          // Assuming doctors have an 'assignedPatients' field or similar logic
          // For simplicity, fetching all for now, but this needs refinement for real-world scenarios
          // e.g., query(collection(db, "patients"), where("assignedDoctorId", "==", user.uid));
          patientsQuery = query(collection(db, "patients")); 
        } else { // Patient role
          patientsQuery = query(collection(db, "patients"), where("userId", "==", user.uid));
        }
        
        const querySnapshot = await getDocs(patientsQuery);
        const patientData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Patient));
        setPatients(patientData);
      } catch (error) {
        console.error("Error fetching patients: ", error);
        // Add toast notification for error
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, [user, role]);

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (patient.phone && patient.phone.includes(searchTerm))
  );

  if (loading) {
    return (
      <div className="container mx-auto py-10 px-4">
        <div className="flex justify-between items-center mb-6">
          <Skeleton className="h-10 w-1/3" />
          <Skeleton className="h-10 w-1/4" />
        </div>
        <Skeleton className="h-10 w-full mb-4" />
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full mb-2" />
        ))}
      </div>
    );
  }


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
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search patients by name or phone..."
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
            <DataTable columns={columns} data={filteredPatients} />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
