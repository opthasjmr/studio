
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Add routes that require authentication
const protectedRoutes = ['/dashboard', '/analyze-scan', '/profile', '/patients', '/appointments', '/emr', '/billing', '/reports', '/telemedicine', '/settings']; 
// Add routes that should only be accessible to unauthenticated users
const authRoutes = ['/login', '/signup', '/forgot-password'];
// Public routes that don't require auth and shouldn't redirect if logged in (e.g. homepage, contact)
const publicOnlyRoutes = ['/', '/contact', '/features', '/terms', '/privacy'];


export function middleware(request: NextRequest) {
  const currentUserCookie = request.cookies.get('firebaseAuthToken'); // This cookie name is an example, adjust if you set it differently
  const { pathname } = request.nextUrl;

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route) && route !== '/'); // ensure '/' is not caught if it's in protectedRoutes by mistake
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));
  const isPublicOnlyRoute = publicOnlyRoutes.some(route => pathname === route);


  // If trying to access a protected route without being authenticated, redirect to login
  if (isProtectedRoute && !currentUserCookie) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirectedFrom', pathname);
    return NextResponse.redirect(url);
  }

  // If trying to access an auth route (login/signup) while already authenticated, redirect to dashboard
  // UNLESS it's a public only route that should be accessible always
  if (isAuthRoute && currentUserCookie && !isPublicOnlyRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }
  
  // Removed: If user is authenticated and tries to access the root page, redirect to dashboard
  // This allows the homepage to be public. Dashboard is a protected route.
  // if (pathname === '/' && currentUserCookie && !isPublicOnlyRoute) {
  //    const url = request.nextUrl.clone();
  //    url.pathname = '/dashboard';
  //    return NextResponse.redirect(url);
  // }


  return NextResponse.next();
}

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
     */
    '/((?!api|_next/static|_next/image|favicon.ico|icons|images).*)',
  ],
}
