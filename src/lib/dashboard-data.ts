
'use server';
import { collection, getDocs, query, where, Timestamp, orderBy, limit,getCountFromServer } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { format, startOfDay, endOfDay } from 'date-fns';

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
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Appointment));
  } catch (error) {
    console.error("Error fetching upcoming appointments:", error);
    return [];
  }
}

export async function getRecentActivities(maxCount = 5): Promise<RecentActivity[]> {
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
      // Determine if it's a new patient or an update based on createdAt vs updatedAt
      // This is a simplified logic. Real-world might need a dedicated activity log.
      const isUpdate = data.updatedAt && data.createdAt && data.updatedAt.toMillis() !== data.createdAt.toMillis();
      activities.push({
        id: doc.id,
        type: isUpdate ? 'Patient Update' : 'New Patient',
        description: `${isUpdate ? 'Updated record for' : 'Patient'} ${data.name} ${isUpdate ? ' ' : 'registered.'}`,
        timestamp: data.updatedAt ? data.updatedAt.toDate() : data.createdAt.toDate(),
        link: `/patients/${doc.id}`
      });
    });

    // Recent appointments
    const appointmentsCollection = collection(db, 'appointments');
    const appointmentQuery = query(appointmentsCollection, orderBy('createdAt', 'desc'), limit(maxCount));
    const appointmentSnapshot = await getDocs(appointmentQuery);
    appointmentSnapshot.docs.forEach(doc => {
      const data = doc.data() as Appointment;
      activities.push({
        id: doc.id,
        type: 'New Appointment', // Could also be 'Appointment Update'
        description: `Appointment for ${data.patientName} with ${data.doctorName} on ${data.date}.`,
        timestamp: data.createdAt.toDate(),
        link: `/appointments` 
      });
    });
    
    return activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, maxCount);

  } catch (error) {
    console.error("Error fetching recent activities:", error);
    return activities; 
  }
}

export interface PatientsByConditionData {
  condition: string;
  count: number;
}

export async function getPatientsByCondition(): Promise<PatientsByConditionData[]> {
  try {
    const patientsCollection = collection(db, 'patients');
    const patientSnapshot = await getDocs(patientsCollection);
    const conditionCounts: Record<string, number> = {};

    patientSnapshot.docs.forEach(doc => {
      const patient = doc.data() as Patient;
      if (patient.tags && patient.tags.length > 0) {
        patient.tags.forEach(tag => {
          conditionCounts[tag] = (conditionCounts[tag] || 0) + 1;
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
  return Promise.resolve(0); 
}

export async function getCriticalAlertsCount(): Promise<number> {
  // Example: count patients tagged with 'High Risk' or 'Critical'
   try {
    const patientsCollection = collection(db, 'patients');
    const q = query(patientsCollection, where('tags', 'array-contains-any', ['High Risk', 'Critical', 'Glaucoma Suspect', 'AMD Advanced']));
    const snapshot = await getCountFromServer(q);
    return snapshot.data().count;
  } catch (error) {
    console.error("Error fetching critical alerts/high-risk patients count:", error);
    return 0;
  }
}
