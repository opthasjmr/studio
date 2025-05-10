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
  patientId?: string; // Optional: To link appointment to patient document
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


export async function getUpcomingAppointments(maxCount = 5, patientId?: string): Promise<Appointment[]> {
   if (!db) {
      console.error("getUpcomingAppointments Error:", serviceInitializationError);
      return [];
  }
  try {
    const today = format(new Date(), 'yyyy-MM-dd');
    const appointmentsCollection = collection(db, 'appointments');
    
    let qConstraints = [
      where('date', '>=', today),
      where('status', '!=', 'Cancelled'),
    ];

    if (patientId) {
      qConstraints.push(where('patientId', '==', patientId)); // Assuming 'patientId' field exists in appointments
    }
    
    qConstraints.push(orderBy('date', 'asc'));
    qConstraints.push(orderBy('time', 'asc'));
    qConstraints.push(limit(maxCount));

    const q = query(appointmentsCollection, ...qConstraints);
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
            id: doc.id,
            patientName: data.patientName || 'N/A',
            doctorName: data.doctorName || 'N/A',
            date: data.date || 'N/A',
            time: data.time || 'N/A',
            status: data.status || 'Pending',
            createdAt: data.createdAt || Timestamp.now(), 
            patientId: data.patientId || undefined,
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
    const patientQuery = query(patientsCollection, orderBy('createdAt', 'desc'), limit(maxCount));
    const patientSnapshot = await getDocs(patientQuery);
    patientSnapshot.docs.forEach(doc => {
      const data = doc.data() as Patient; 
      const createdAtDate = data.createdAt?.toDate ? data.createdAt.toDate() : new Date(); 
      const updatedAtDate = data.updatedAt?.toDate ? data.updatedAt.toDate() : createdAtDate;
      const isUpdate = updatedAtDate.getTime() > createdAtDate.getTime() + 1000; 
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
        type: 'New Appointment', 
        description: `Appointment for ${data.patientName || 'Unknown'} with ${data.doctorName || 'N/A'} on ${data.date || 'N/A'}.`,
        timestamp: createdAtDate,
        link: `/appointments` 
      });
    });

    return activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, maxCount);

  } catch (error) {
    console.error("Error fetching recent activities:", error);
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
      if (patient.tags && Array.isArray(patient.tags) && patient.tags.length > 0) { 
        patient.tags.forEach(tag => {
          if (typeof tag === 'string' && tag.trim()) { 
             conditionCounts[tag.trim()] = (conditionCounts[tag.trim()] || 0) + 1;
          }
        });
      } else {
      }
    });

    return Object.entries(conditionCounts).map(([condition, count]) => ({ condition, count }));
  } catch (error) {
    console.error("Error fetching patients by condition:", error);
    return [];
  }
}


export async function getPendingBillsCount(): Promise<number> {
  return Promise.resolve(0);
}

export async function getCriticalAlertsCount(): Promise<number> {
   if (!db) {
      console.error("getCriticalAlertsCount Error:", serviceInitializationError);
      return 0;
  }
   try {
    const patientsCollection = collection(db, 'patients');
    const validTags = ['High Risk', 'Critical', 'Glaucoma Suspect', 'AMD Advanced'].filter(tag => typeof tag === 'string');
    if (validTags.length === 0) return 0; 

    const q = query(patientsCollection, where('tags', 'array-contains-any', validTags));
    const snapshot = await getCountFromServer(q);
    return snapshot.data().count;
  } catch (error) {
    if (error instanceof Error && (error.message.includes("array-contains-any") || error.message.includes("Invalid Query"))) {
      console.warn("Warning fetching critical alerts count (potentially empty tags or index issue):", error.message);
      return 0; 
    }
    console.error("Error fetching critical alerts/high-risk patients count:", error);
    return 0;
  }
}
