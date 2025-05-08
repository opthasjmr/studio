
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

export interface Patient {
  id: string;
  name: string;
  dob: string;
  tags?: string[];
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

export interface RecentActivity {
  id: string;
  type: 'New Patient' | 'Patient Update' | 'New Appointment' | 'Appointment Update';
  description: string;
  timestamp: Date;
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
    // Recent patient registrations
    const patientsCollection = collection(db, 'patients');
    const patientQuery = query(patientsCollection, orderBy('createdAt', 'desc'), limit(maxCount));
    const patientSnapshot = await getDocs(patientQuery);
    patientSnapshot.docs.forEach(doc => {
      const data = doc.data() as Patient;
      activities.push({
        id: doc.id,
        type: 'New Patient',
        description: `Patient ${data.name} registered.`,
        timestamp: data.createdAt.toDate(),
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
        type: 'New Appointment',
        description: `Appointment for ${data.patientName} with ${data.doctorName} on ${data.date}.`,
        timestamp: data.createdAt.toDate(),
        link: `/appointments` // Ideally link to specific appointment
      });
    });
    
    // Sort all activities by timestamp and take the most recent ones
    return activities
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, maxCount);

  } catch (error) {
    console.error("Error fetching recent activities:", error);
    return activities; // Return whatever was fetched before error
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
        conditionCounts['Untagged'] = (conditionCounts['Untagged'] || 0) + 1;
      }
    });
    
    return Object.entries(conditionCounts).map(([condition, count]) => ({ condition, count }));
  } catch (error) {
    console.error("Error fetching patients by condition:", error);
    return [];
  }
}

// Placeholder for billing related data
export async function getPendingBillsCount(): Promise<number> {
  // In a real app, this would query a 'billing' collection or check appointment statuses
  return Promise.resolve(0); // Placeholder
}

export async function getCriticalAlertsCount(): Promise<number> {
  // In a real app, this would query an 'alerts' collection or derive from patient data
  return Promise.resolve(0); // Placeholder
}
