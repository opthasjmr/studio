import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Add routes that require authentication
const protectedRoutes = ['/dashboard', '/analyze-scan', '/profile', '/patients', '/appointments']; 
// Add routes that should only be accessible to unauthenticated users
const authRoutes = ['/login', '/signup'];

export function middleware(request: NextRequest) {
  const currentUserCookie = request.cookies.get('firebaseAuthToken'); // This cookie name is an example, adjust if you set it differently
  const { pathname } = request.nextUrl;

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  // If trying to access a protected route without being authenticated, redirect to login
  if (isProtectedRoute && !currentUserCookie) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('redirectedFrom', pathname);
    return NextResponse.redirect(url);
  }

  // If trying to access an auth route (login/signup) while already authenticated, redirect to dashboard
  if (isAuthRoute && currentUserCookie) {
    const url = request.nextUrl.clone();
    url.pathname = '/dashboard';
    return NextResponse.redirect(url);
  }
  
  // If user is authenticated and tries to access the root page, redirect to dashboard
  if (pathname === '/' && currentUserCookie) {
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
     * - images (public images folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images).*)',
  ],
}
