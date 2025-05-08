"use server";

import { auth, db } from "@/lib/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { z } from "zod";

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  name: z.string().min(2, "Name is required"),
  role: z.enum(["patient", "doctor", "receptionist", "admin"]).default("patient"),
});

export async function signUpUser(values: z.infer<typeof signUpSchema>) {
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
    return { error: error.message };
  }
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, "Password is required"),
});

export async function signInUser(values: z.infer<typeof loginSchema>) {
  try {
    const validatedValues = loginSchema.safeParse(values);
    if (!validatedValues.success) {
      return { error: "Invalid input.", details: validatedValues.error.flatten() };
    }
    const { email, password } = validatedValues.data;
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { success: true, userId: userCredential.user.uid };
  } catch (error: any) {
    if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
      return { error: "Invalid email or password." };
    }
    return { error: error.message };
  }
}

export async function signOutUser() {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error: any) {
    return { error: error.message };
  }
}
