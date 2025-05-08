
"use client";

import type React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '@/lib/firebase'; // Import potentially null services
import { doc, getDoc } from 'firebase/firestore';
import { Loader2, AlertCircle } from 'lucide-react';

interface User extends FirebaseUser {
  role?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  role?: string;
  error: string | null; // Add error state
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  error: null,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if Firebase services are initialized
    if (!auth || !db) {
      setError("Firebase is not configured correctly. Please check environment variables and console logs.");
      setLoading(false);
      setUser(null);
      setRole(undefined);
      return; // Stop execution if Firebase is not ready
    }
    setError(null); // Clear previous errors if services are available

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, "users", firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          const userData = userDoc.exists() ? userDoc.data() : {};

          setUser({ ...firebaseUser, role: userData.role });
          setRole(userData.role);
        } catch (dbError: any) {
            console.error("Error fetching user role from Firestore:", dbError);
            setError("Failed to load user profile data.");
            // Keep the user logged in but without role information, or log them out
            setUser(firebaseUser); // Keep basic user info
            setRole(undefined); // Indicate role couldn't be fetched
        }
      } else {
        setUser(null);
        setRole(undefined);
      }
      setLoading(false);
    }, (authError) => { // Handle errors from onAuthStateChanged itself
        console.error("Firebase Auth state change error:", authError);
        setError("Authentication check failed.");
        setUser(null);
        setRole(undefined);
        setLoading(false);
    });

    return () => unsubscribe();
  }, []); // Run only once on mount

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

   if (error) {
    return (
       <div className="flex h-screen items-center justify-center p-4">
         <div className="max-w-md rounded border border-destructive bg-destructive/10 p-6 text-center text-destructive">
            <AlertCircle className="mx-auto h-10 w-10 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Initialization Error</h2>
            <p className="text-sm">{error}</p>
         </div>
       </div>
    );
   }

  return (
    <AuthContext.Provider value={{ user, loading, role, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

