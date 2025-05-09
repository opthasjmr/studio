
"use server";

import { auth, db } from "@/lib/firebase"; // Import potentially null services
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { z } from "zod";
import { setClientCookie, deleteClientCookie } from "@/utils/cookies";

const serviceInitializationError = "Firebase services are not properly initialized. Check server logs and configuration.";

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  name: z.string().min(2, "Name is required"),
  role: z.enum(["patient", "doctor", "receptionist", "admin"]).default("patient"),
});

export async function signUpUser(values: z.infer<typeof signUpSchema>) {
  if (!auth || !db) {
    console.error("signUpUser Error:", serviceInitializationError);
    return { error: serviceInitializationError };
  }
  try {
    const validatedValues = signUpSchema.safeParse(values);
    if (!validatedValues.success) {
      return { error: "Invalid input.", details: validatedValues.error.flatten() };
    }
    const { email, password, name, role } = validatedValues.data;

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Update Firebase Auth profile
    await updateProfile(user, { displayName: name });

    // Store additional user info in Firestore
    const userDocData = {
      uid: user.uid,
      email: user.email,
      displayName: name,
      role: role,
      createdAt: serverTimestamp(),
      firstLoginPending: role === 'admin', // Example: Admins need setup
      licenseVerified: role === 'doctor' ? false : undefined, // Doctors need license verification
      profileComplete: role === 'patient' ? false : undefined, // Patients need to complete profile
      consentSigned: role === 'patient' ? false : undefined,   // Patients need to sign consent
    };
    await setDoc(doc(db, "users", user.uid), userDocData);

    // Set client-side cookies
    const token = await user.getIdToken();
    setClientCookie('firebaseAuthToken', token, { path: '/', secure: process.env.NODE_ENV === 'production', sameSite: 'Lax' });
    setClientCookie('userRole', role, { path: '/', secure: process.env.NODE_ENV === 'production', sameSite: 'Lax' });
    setClientCookie('userId', user.uid, { path: '/', secure: process.env.NODE_ENV === 'production', sameSite: 'Lax' });
    
    // Set initial conditional cookies based on role
    if (role === 'admin') {
      setClientCookie('firstLoginPending', 'true', { path: '/', secure: process.env.NODE_ENV === 'production', sameSite: 'Lax' });
    }
    if (role === 'doctor') {
      setClientCookie('licenseVerified', 'false', { path: '/', secure: process.env.NODE_ENV === 'production', sameSite: 'Lax' });
    }
    if (role === 'patient') {
      setClientCookie('profileComplete', 'false', { path: '/', secure: process.env.NODE_ENV === 'production', sameSite: 'Lax' });
      setClientCookie('consentSigned', 'false', { path: '/', secure: process.env.NODE_ENV === 'production', sameSite: 'Lax' });
    }


    return { success: true, userId: user.uid, role: role };
  } catch (error: any) {
    console.error("Sign up error:", error);
    if (error.code === 'auth/email-already-in-use') {
        return { error: "This email address is already registered." };
    }
    return { error: error.message || "An unexpected error occurred during sign up." };
  }
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

export async function signInUser(values: z.infer<typeof loginSchema>) {
   if (!auth || !db) { // Added db check
    console.error("signInUser Error:", serviceInitializationError);
    return { error: serviceInitializationError };
  }
  try {
    const validatedValues = loginSchema.safeParse(values);
    if (!validatedValues.success) {
      return { error: "Invalid input.", details: validatedValues.error.flatten() };
    }
    const { email, password } = validatedValues.data;

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Fetch role and details from Firestore to set cookies correctly
    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);
    const userData = userDoc.exists() ? userDoc.data() : {};
    const userRole = userData?.role || 'patient'; // Default to patient if no role

    // Set client-side cookies
    const token = await user.getIdToken();
    setClientCookie('firebaseAuthToken', token, { path: '/', secure: process.env.NODE_ENV === 'production', sameSite: 'Lax' });
    setClientCookie('userRole', userRole, { path: '/', secure: process.env.NODE_ENV === 'production', sameSite: 'Lax' });
    setClientCookie('userId', user.uid, { path: '/', secure: process.env.NODE_ENV === 'production', sameSite: 'Lax' });

    // Set conditional cookies based on Firestore data
    setClientCookie('firstLoginPending', String(userData?.firstLoginPending === true), { path: '/', secure: process.env.NODE_ENV === 'production', sameSite: 'Lax' });
    setClientCookie('licenseVerified', String(userData?.licenseVerified === true), { path: '/', secure: process.env.NODE_ENV === 'production', sameSite: 'Lax' });
    setClientCookie('profileComplete', String(userData?.profileComplete === true), { path: '/', secure: process.env.NODE_ENV === 'production', sameSite: 'Lax' });
    setClientCookie('consentSigned', String(userData?.consentSigned === true), { path: '/', secure: process.env.NODE_ENV === 'production', sameSite: 'Lax' });

    return { success: true, userId: user.uid, role: userRole };
  } catch (error: any) {
    console.error("Sign in error:", error);
    if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      return { error: "Invalid email or password." };
    }
     if (error.code === 'auth/too-many-requests') {
         return { error: "Access temporarily disabled due to too many login attempts. Please try again later or reset your password." };
     }
    return { error: error.message || "An unexpected error occurred during sign in." };
  }
}

export async function signOutUser() {
   if (!auth) {
    console.error("signOutUser Error:", serviceInitializationError);
    return { error: serviceInitializationError };
  }
  try {
    await signOut(auth);
    // Clear client-side cookies
    deleteClientCookie('firebaseAuthToken', { path: '/' });
    deleteClientCookie('userRole', { path: '/' });
    deleteClientCookie('userId', { path: '/' });
    deleteClientCookie('firstLoginPending', { path: '/' });
    deleteClientCookie('licenseVerified', { path: '/' });
    deleteClientCookie('profileComplete', { path: '/' });
    deleteClientCookie('consentSigned', { path: '/' });
    return { success: true };
  } catch (error: any) {
    console.error("Sign out error:", error);
    return { error: error.message || "An unexpected error occurred during sign out." };
  }
}

// Function to update a user's conditional flag in Firestore and cookie
// Example: updateProfileCondition(userId, 'profileComplete', true)
export async function updateUserCondition(userId: string, conditionKey: keyof typeof defaultConditionalFlags, value: boolean) {
  if (!db) {
    console.error("updateUserCondition Error:", serviceInitializationError);
    return { error: serviceInitializationError };
  }
  try {
    const userDocRef = doc(db, "users", userId);
    await setDoc(userDocRef, { [conditionKey]: value }, { merge: true });
    
    // Update the corresponding cookie
    setClientCookie(conditionKey, String(value), { path: '/', secure: process.env.NODE_ENV === 'production', sameSite: 'Lax' });
    
    return { success: true };
  } catch (error: any) {
    console.error(`Error updating user condition ${conditionKey}:`, error);
    return { error: error.message || `Failed to update ${conditionKey}.` };
  }
}

const defaultConditionalFlags = {
  firstLoginPending: false,
  licenseVerified: false,
  profileComplete: false,
  consentSigned: false,
};
