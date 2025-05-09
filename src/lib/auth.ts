// src/lib/auth.ts
import type { NextRequest } from 'next/server';
import { getClientCookie } from '@/utils/cookies'; // Assuming cookies are set/read client-side for this simulation

export interface AuthDetails {
  firstLogin?: boolean;
  licenseVerified?: boolean;
  profileComplete?: boolean;
  consentSigned?: boolean;
}

export interface AuthStatus {
  isAuthenticated: boolean;
  role: string | null;
  details: AuthDetails;
  userId: string | null;
}

/**
 * Simulates fetching authentication status and role.
 * In a real app, this would involve verifying a session cookie or JWT.
 * For Next.js middleware, cookies are read from the request object.
 */
export function getAuthStatus(request: NextRequest): AuthStatus {
  const token = request.cookies.get('firebaseAuthToken')?.value;
  const userRole = request.cookies.get('userRole')?.value || null;
  const userId = request.cookies.get('userId')?.value || null;

  // Simulate fetching details that might influence redirection.
  // In a real application, these would come from a database or user session.
  // For middleware, we are still reading from cookies for this simulation.
  const details: AuthDetails = {
    firstLogin: userRole === 'admin' ? request.cookies.get('firstLoginPending')?.value === 'true' : undefined,
    // For 'licenseVerified', 'profileComplete', 'consentSigned', the cookie value 'true' indicates the step IS done.
    // So, the condition for redirection (step NOT done) will be checking for 'false' or absence of the cookie.
    licenseVerified: userRole === 'doctor' ? request.cookies.get('licenseVerified')?.value === 'true' : false,
    profileComplete: userRole === 'patient' ? request.cookies.get('profileComplete')?.value === 'true' : false,
    consentSigned: userRole === 'patient' ? request.cookies.get('consentSigned')?.value === 'true' : false,
  };

  return {
    isAuthenticated: !!token,
    role: userRole,
    details,
    userId,
  };
}

// Example functions to simulate setting these conditional cookies (client-side)
// These would be called after relevant actions in your application flow.

/**
 * Simulates setting a cookie indicating an admin's first login is pending.
 * To be called client-side.
 */
export function setFirstLoginPendingCookie(isPending: boolean): void {
  if (typeof document !== 'undefined') {
    document.cookie = `firstLoginPending=${isPending}; path=/; max-age=${60 * 60 * 24 * 7}`; // Expires in 7 days
  }
}

/**
 * Simulates setting a cookie indicating a doctor's license has been verified.
 * To be called client-side.
 */
export function setLicenseVerifiedCookie(isVerified: boolean): void {
  if (typeof document !== 'undefined') {
    document.cookie = `licenseVerified=${isVerified}; path=/; max-age=${60 * 60 * 24 * 30}`; // Expires in 30 days
  }
}

/**
 * Simulates setting a cookie indicating a patient's profile is complete.
 * To be called client-side.
 */
export function setProfileCompleteCookie(isComplete: boolean): void {
  if (typeof document !== 'undefined') {
    document.cookie = `profileComplete=${isComplete}; path=/; max-age=${60 * 60 * 24 * 30}`; // Expires in 30 days
  }
}

/**
 * Simulates setting a cookie indicating a patient has signed consent.
 * To be called client-side.
 */
export function setConsentSignedCookie(isSigned: boolean): void {
  if (typeof document !== 'undefined') {
    document.cookie = `consentSigned=${isSigned}; path=/; max-age=${60 * 60 * 24 * 30}`; // Expires in 30 days
  }
}
