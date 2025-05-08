
"use server";

import { auth, db } from "@/lib/firebase"; // Import potentially null services
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { z } from "zod";

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

    // Store additional user info in Firestore
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email,
      displayName: name,
      role: role,
      createdAt: serverTimestamp(),
    });

    return { success: true, userId: user.uid };
  } catch (error: any) {
    console.error("Sign up error:", error);
    // Provide more user-friendly messages for common errors
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
   if (!auth) {
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
    return { success: true, userId: userCredential.user.uid };
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
    return { success: true };
  } catch (error: any) {
    console.error("Sign out error:", error);
    return { error: error.message || "An unexpected error occurred during sign out." };
  }
}
