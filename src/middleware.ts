
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// --- Configuration ---
const LOGIN_PATH = '/login';
const DEFAULT_DASHBOARD_PATH = '/dashboard'; // Fallback if role-specific dashboard isn't defined

// Role-specific dashboard paths
const ROLE_DASHBOARDS: Record<string, string> = {
  admin: '/dashboard', // Admin dashboard is the main dashboard
  doctor: '/dashboard', // Doctor also uses the main dashboard for now
  receptionist: '/reception/dashboard',
  patient: '/dashboard', // Patient dashboard is the main dashboard
};

// Paths requiring specific pre-conditions if logged in
const CONDITIONAL_REDIRECTS: Record<string, Record<string, string>> = {
  admin: {
    firstLogin: '/admin/setup', // Example: Admin first login setup
  },
  doctor: {
    licenseVerified: '/doctor/verify-license', // Example: Doctor license verification
  },
  patient: {
    profileComplete: '/patient/complete-profile',
    consentSigned: '/patient/consent',
  },
};

// Routes accessible only when NOT authenticated
const AUTH_ROUTES = ['/login', '/signup', '/forgot-password'];

// Routes that require authentication
const PROTECTED_ROUTES_PREFIXES = [
  '/dashboard',
  '/analyze-scan',
  '/profile', // Assuming a generic profile page
  '/patients', // Covers /patients, /patients/new, /patients/[id], /patients/[id]/edit
  '/appointments', // Covers /appointments, /appointments/new
  '/emr',
  '/billing',
  '/reports',
  '/telemedicine',
  '/settings',
  '/reception/dashboard',
  '/research-assistant',
  '/project-autoscholar',
  // Role specific conditional paths
  '/admin/setup',
  '/doctor/verify-license',
  '/patient/complete-profile',
  '/patient/consent',
];

// --- Helper Functions ---

function getAuthStatus(request: NextRequest): { isAuthenticated: boolean; role: string | null; details: Record<string, boolean | undefined> } {
  // In a real app, parse a JWT or session cookie.
  // For this example, we'll simulate based on a simple cookie or headers.
  const token = request.cookies.get('firebaseAuthToken')?.value;
  const userRole = request.cookies.get('userRole')?.value || null; // Example: 'admin', 'doctor', etc.

  // Simulate special conditions from cookies for demonstration
  const firstLogin = request.cookies.get('firstLogin')?.value === 'true';
  const licenseVerified = request.cookies.get('licenseVerified')?.value === 'true';
  const profileComplete = request.cookies.get('profileComplete')?.value === 'true';
  const consentSigned = request.cookies.get('consentSigned')?.value === 'true';


  return {
    isAuthenticated: !!token,
    role: userRole,
    details: {
      firstLogin: userRole === 'admin' ? firstLogin : undefined, // Only relevant for admin
      licenseVerified: userRole === 'doctor' ? licenseVerified : undefined, // Only for doctor
      profileComplete: userRole === 'patient' ? profileComplete : undefined, // Only for patient
      consentSigned: userRole === 'patient' ? consentSigned : undefined, // Only for patient
    }
  };
}

// --- Middleware Logic ---
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { isAuthenticated, role, details } = getAuthStatus(request);

  const isAuthRoute = AUTH_ROUTES.some(route => pathname.startsWith(route));
  const isProtectedRoute = PROTECTED_ROUTES_PREFIXES.some(prefix => pathname.startsWith(prefix));

  // 1. If user is not authenticated
  if (!isAuthenticated) {
    if (isProtectedRoute) {
      // Redirect to login, preserving the intended path
      const loginUrl = new URL(LOGIN_PATH, request.url);
      loginUrl.searchParams.set('redirectedFrom', pathname);
      return NextResponse.redirect(loginUrl);
    }
    // Allow access to auth routes and public routes
    return NextResponse.next();
  }

  // 2. If user IS authenticated
  // Redirect from auth pages (login, signup) to their dashboard
  if (isAuthRoute) {
    const dashboardPath = (role && ROLE_DASHBOARDS[role]) || DEFAULT_DASHBOARD_PATH;
    return NextResponse.redirect(new URL(dashboardPath, request.url));
  }

  // Handle role-based conditional redirects
  if (role && CONDITIONAL_REDIRECTS[role]) {
    const conditions = CONDITIONAL_REDIRECTS[role];
    for (const conditionKey in conditions) {
      // Check if the condition is met (e.g., firstLogin is true, licenseVerified is false)
      // The value in `details` represents if the prerequisite is NOT met.
      // e.g. details.firstLogin === true means they still need to do first login.
      // e.g. details.licenseVerified === false (or undefined and we expect true) means they need to verify.
      
      const conditionMetForRedirect = 
        (conditionKey === 'firstLogin' && details.firstLogin === true) ||
        (conditionKey === 'licenseVerified' && details.licenseVerified === false) ||
        (conditionKey === 'profileComplete' && details.profileComplete === false) ||
        (conditionKey === 'consentSigned' && details.consentSigned === false);

      if (conditionMetForRedirect) {
        const conditionalRedirectPath = conditions[conditionKey];
        // Avoid redirect loop if already on the conditional page
        if (pathname !== conditionalRedirectPath) {
          return NextResponse.redirect(new URL(conditionalRedirectPath, request.url));
        }
      }
    }
  }
  
  // If user is authenticated and on a protected route, ensure they have the correct role for specific dashboards
  // For example, a patient should not access /admin/dashboard directly (though this is often handled by page-level checks too)
  // This part can be expanded based on more granular role-based route protection needs.
  // For now, if they passed conditional checks and are on a protected route, allow.

  return NextResponse.next();
}

// --- Config ---
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - icons (public icons folder)
     * - images (public images folder)
     * - manifest.json (PWA manifest)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|icons|images|manifest.json).*)',
  ],
};
