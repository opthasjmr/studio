
"use client";

import type React from 'react';
import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '@/lib/firebase'; // Import potentially null services
import { doc, getDoc, DocumentData } from 'firebase/firestore';
import { Loader2, AlertCircle } from 'lucide-react';
import { setClientCookie, deleteClientCookie, getClientCookie } from '@/utils/cookies';
import type { AuthDetails } from '@/lib/auth'; // Import AuthDetails type

interface User extends FirebaseUser {
  role?: string;
  details?: AuthDetails; // Add details to user object
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  role?: string; // Keep role for direct access
  details?: AuthDetails; // Keep details for direct access
  error: string | null; // Add error state
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  role: undefined,
  details: {},
  error: null,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState<string | undefined>(undefined);
  const [details, setDetails] = useState<AuthDetails | undefined>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Check if Firebase services are initialized
    if (!auth || !db) {
      setError("Firebase services are not configured correctly. Please check your API keys and Firebase project setup.");
      setLoading(false);
      setUser(null);
      setRole(undefined);
      setDetails({});
      // Clear auth-related cookies if Firebase is not available
      deleteClientCookie('firebaseAuthToken');
      deleteClientCookie('userRole');
      deleteClientCookie('userId');
      deleteClientCookie('firstLoginPending');
      deleteClientCookie('licenseVerified');
      deleteClientCookie('profileComplete');
      deleteClientCookie('consentSigned');
      return; // Stop execution if Firebase is not ready
    }
    setError(null); // Clear previous errors if services are available

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          // Set auth token cookie
          const token = await firebaseUser.getIdToken();
          setClientCookie('firebaseAuthToken', token, { path: '/', secure: process.env.NODE_ENV === 'production', sameSite: 'Lax' });
          setClientCookie('userId', firebaseUser.uid, { path: '/', secure: process.env.NODE_ENV === 'production', sameSite: 'Lax' });

          const userDocRef = doc(db, "users", firebaseUser.uid);
          const userDoc = await getDoc(userDocRef);
          const userData: DocumentData | undefined = userDoc.exists() ? userDoc.data() : {};
          
          const userRole = userData?.role || 'patient'; // Default to patient if no role
          const userDetails: AuthDetails = {
            firstLogin: userData?.firstLoginPending === true, // Specifically check for true
            licenseVerified: userData?.licenseVerified === true,
            profileComplete: userData?.profileComplete === true,
            consentSigned: userData?.consentSigned === true,
          };

          setUser({ ...firebaseUser, role: userRole, details: userDetails });
          setRole(userRole);
          setDetails(userDetails);

          // Update cookies with role and details
          setClientCookie('userRole', userRole, { path: '/', secure: process.env.NODE_ENV === 'production', sameSite: 'Lax' });
          setClientCookie('firstLoginPending', String(userDetails.firstLogin), { path: '/', secure: process.env.NODE_ENV === 'production', sameSite: 'Lax' });
          setClientCookie('licenseVerified', String(userDetails.licenseVerified), { path: '/', secure: process.env.NODE_ENV === 'production', sameSite: 'Lax' });
          setClientCookie('profileComplete', String(userDetails.profileComplete), { path: '/', secure: process.env.NODE_ENV === 'production', sameSite: 'Lax' });
          setClientCookie('consentSigned', String(userDetails.consentSigned), { path: '/', secure: process.env.NODE_ENV === 'production', sameSite: 'Lax' });

        } catch (dbError: any) {
            console.error("Error fetching user data from Firestore:", dbError);
            setError("Failed to load user profile data. Some features might be unavailable.");
            // Keep basic user info, but role/details are uncertain
            setUser(firebaseUser); // Token would still be set
            setRole(undefined); 
            setDetails({});
            // Clear role/details cookies as they are unknown
            deleteClientCookie('userRole');
            deleteClientCookie('firstLoginPending');
            deleteClientCookie('licenseVerified');
            deleteClientCookie('profileComplete');
            deleteClientCookie('consentSigned');
        }
      } else {
        setUser(null);
        setRole(undefined);
        setDetails({});
        // Clear all auth-related cookies on logout
        deleteClientCookie('firebaseAuthToken');
        deleteClientCookie('userRole');
        deleteClientCookie('userId');
        deleteClientCookie('firstLoginPending');
        deleteClientCookie('licenseVerified');
        deleteClientCookie('profileComplete');
        deleteClientCookie('consentSigned');
      }
      setLoading(false);
    }, (authError) => { 
        console.error("Firebase Auth state change error:", authError);
        setError("Authentication check failed. Please try reloading the page.");
        setUser(null);
        setRole(undefined);
        setDetails({});
        setLoading(false);
        // Clear cookies on auth error too
        deleteClientCookie('firebaseAuthToken');
        deleteClientCookie('userRole');
        deleteClientCookie('userId');
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

   if (error && (!auth || !db)) { // Show persistent error if Firebase itself is not configured
    return (
       <div className="flex h-screen items-center justify-center p-4">
         <div className="max-w-md rounded border border-destructive bg-destructive/10 p-6 text-center text-destructive">
            <AlertCircle className="mx-auto h-10 w-10 mb-4" />
            <h2 className="text-xl font-semibold mb-2">Application Error</h2>
            <p className="text-sm">{error}</p>
            <p className="text-xs mt-2">Please contact support or check the console for more details.</p>
         </div>
       </div>
    );
   }
   // Non-blocking errors (e.g., failed to fetch role) will allow children to render but show a toast or in-app message.
   // The `error` prop in context value can be used by components to display such non-blocking errors.

  return (
    <AuthContext.Provider value={{ user, loading, role, details, error }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
