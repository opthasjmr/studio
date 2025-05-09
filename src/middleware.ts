
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// --- Configuration ---
const LOGIN_PATH = '/login';
const DEFAULT_DASHBOARD_PATH = '/dashboard'; // Fallback if role-specific dashboard isn't defined

// Role-specific dashboard paths
const ROLE_DASHBOARDS: Record<string, string> = {
  admin: '/dashboard', // Admin dashboard is the main dashboard
  doctor: '/dashboard', // Doctor also uses the main dashboard
  receptionist: '/reception/dashboard',
  patient: '/dashboard', // Patient dashboard is the main dashboard
};

// Paths requiring special conditions to be met *before* accessing standard role dashboard
// The value in `details` (from getAuthStatus) indicates if the prerequisite is NOT YET met.
// e.g. details.firstLogin === true means they *still need to do* first login.
// e.g. details.licenseVerified === false means they *still need to* verify license.
const CONDITIONAL_REDIRECT_TARGETS: Record<string, Record<string, string>> = {
  admin: {
    firstLogin: '/admin/setup', // If firstLogin is true, redirect to /admin/setup
  },
  doctor: {
    licenseVerified: '/doctor/verify-license', // If licenseVerified is false, redirect to /doctor/verify-license
  },
  patient: {
    profileComplete: '/patient/complete-profile', // If profileComplete is false, redirect
    consentSigned: '/patient/consent',          // If consentSigned is false, redirect
  },
};

// Routes accessible only when NOT authenticated
const AUTH_ROUTES = ['/login', '/signup', '/forgot-password'];

// Routes that require authentication
const PROTECTED_ROUTES_PREFIXES = [
  '/dashboard',
  '/analyze-scan',
  '/research-assistant',
  '/project-autoscholar',
  '/profile',
  '/patients', // Covers /patients, /patients/new, /patients/[id], /patients/[id]/edit
  '/appointments', // Covers /appointments, /appointments/new
  '/emr',
  '/billing',
  '/reports',
  '/telemedicine',
  '/settings',
  '/reception/dashboard',
  // Role specific conditional target paths are also protected
  '/admin/setup',
  '/doctor/verify-license',
  '/patient/complete-profile',
  '/patient/consent',
];

// --- Helper Functions ---

interface AuthDetails {
  firstLogin?: boolean;
  licenseVerified?: boolean;
  profileComplete?: boolean;
  consentSigned?: boolean;
}

interface AuthStatus {
  isAuthenticated: boolean;
  role: string | null;
  details: AuthDetails;
  userId: string | null; // Added userId for more specific checks if needed
}

// Simulates fetching authentication status and role
// In a real app, this would involve verifying a session cookie or JWT
function getAuthStatus(request: NextRequest): AuthStatus {
  const token = request.cookies.get('firebaseAuthToken')?.value; // Example cookie name
  const userRole = request.cookies.get('userRole')?.value || null;
  const userId = request.cookies.get('userId')?.value || null;

  // Simulate details for conditional redirection
  // These would typically be fetched from a user profile in a database
  const details: AuthDetails = {
    firstLogin: userRole === 'admin' ? request.cookies.get('firstLoginPending')?.value === 'true' : undefined,
    licenseVerified: userRole === 'doctor' ? request.cookies.get('licenseVerified')?.value === 'true' : undefined, // Note: this cookie means "verified", so condition check will be `!details.licenseVerified`
    profileComplete: userRole === 'patient' ? request.cookies.get('profileComplete')?.value === 'true' : undefined, // Same here, condition check `!details.profileComplete`
    consentSigned: userRole === 'patient' ? request.cookies.get('consentSigned')?.value === 'true' : undefined,     // Same here, condition check `!details.consentSigned`
  };

  return {
    isAuthenticated: !!token,
    role: userRole,
    details,
    userId,
  };
}

// --- Middleware Logic ---
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const { isAuthenticated, role, details } = getAuthStatus(request);

  const isAuthRoute = AUTH_ROUTES.some(route => pathname.startsWith(route));
  const isProtectedRoute = PROTECTED_ROUTES_PREFIXES.some(prefix => pathname.startsWith(prefix));

  // 1. Handle Unauthenticated Users
  if (!isAuthenticated) {
    if (isProtectedRoute) {
      const loginUrl = new URL(LOGIN_PATH, request.url);
      // Preserve the original path for redirection after login
      loginUrl.searchParams.set('redirectedFrom', pathname);
      return NextResponse.redirect(loginUrl);
    }
    // Allow access to auth routes (login, signup) and public pages
    return NextResponse.next();
  }

  // 2. Handle Authenticated Users
  // If on an auth route (login, signup), redirect to their dashboard
  if (isAuthRoute) {
    const dashboardPath = (role && ROLE_DASHBOARDS[role]) || DEFAULT_DASHBOARD_PATH;
    return NextResponse.redirect(new URL(dashboardPath, request.url));
  }

  // Conditional Redirections for Authenticated Users
  if (role && CONDITIONAL_REDIRECT_TARGETS[role]) {
    const roleConditions = CONDITIONAL_REDIRECT_TARGETS[role];
    for (const conditionKey in roleConditions) {
      let conditionNotMet = false;
      switch (conditionKey) {
        case 'firstLogin': // Admin specific
          conditionNotMet = details.firstLogin === true; // firstLoginPending is true means they need to setup
          break;
        case 'licenseVerified': // Doctor specific
          conditionNotMet = details.licenseVerified === false; // licenseVerified is false means they need to verify
          break;
        case 'profileComplete': // Patient specific
          conditionNotMet = details.profileComplete === false; // profileComplete is false means they need to complete
          break;
        case 'consentSigned': // Patient specific
          conditionNotMet = details.consentSigned === false; // consentSigned is false means they need to sign
          break;
      }

      if (conditionNotMet) {
        const targetPath = roleConditions[conditionKey];
        // Avoid redirect loop if already on the target conditional page
        if (pathname !== targetPath) {
          return NextResponse.redirect(new URL(targetPath, request.url));
        }
        // If already on the target path for the unmet condition, allow to proceed
        return NextResponse.next();
      }
    }
  }

  // If user is authenticated, passed all conditional checks, and is on a protected route:
  // Additional role-based access control for specific dashboards can be added here if needed.
  // For example, if a patient tries to access /admin/users (assuming it's not caught by prefix).
  // However, the current `ROLE_DASHBOARDS` and prefix logic largely covers this.

  // If trying to access a role-specific dashboard but not having that role (e.g., patient to /reception/dashboard)
  // This check is a bit broad, more granular checks are better done at page/component level or with more specific prefixes
  if (pathname.startsWith('/reception/dashboard') && role !== 'receptionist' && role !== 'admin') {
    return NextResponse.redirect(new URL(DEFAULT_DASHBOARD_PATH, request.url));
  }
  if (pathname.startsWith('/admin/setup') && role !== 'admin') {
     return NextResponse.redirect(new URL(DEFAULT_DASHBOARD_PATH, request.url));
  }
  // Add similar checks for other role-specific top-level dashboards if necessary.

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
     * - files (if you have a /public/files folder for static assets)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|icons|images|manifest.json|files).*)',
  ],
};
