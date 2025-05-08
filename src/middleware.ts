
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Add routes that require authentication
const protectedRoutes = [
    '/dashboard', 
    '/analyze-scan', 
    '/profile', 
    '/patients', 
    '/appointments', 
    '/emr', 
    '/billing', 
    '/reports', 
    '/telemedicine', 
    '/settings',
    '/reception/dashboard',
]; 
// Add routes that should only be accessible to unauthenticated users
const authRoutes = ['/login', '/signup', '/forgot-password'];
// Public routes that don't require auth and shouldn't redirect if logged in (e.g. homepage, contact)
const publicOnlyRoutes = ['/', '/contact', '/terms', '/privacy']; // Removed /features as it's not a page yet


export function middleware(request: NextRequest) {
  const currentUserCookie = request.cookies.get('firebaseAuthToken'); 
  const { pathname } = request.nextUrl;

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route) && (route !== '/' || pathname === '/'));
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));
  const isPublicOnlyRoute = publicOnlyRoutes.some(route => pathname === route);


  if (isProtectedRoute && !currentUserCookie) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirectedFrom', pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthRoute && currentUserCookie && !isPublicOnlyRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }
  
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
