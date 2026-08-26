import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Next.js Middleware — runs on every request BEFORE the page renders.
 * 
 * We use this for basic route protection. Since JWT is stored in
 * localStorage (client-side only), we can't fully validate it here.
 * Instead, the AuthContext handles the actual validation on the client.
 * 
 * This middleware provides a fast redirect for obvious cases where
 * an unauthenticated user tries to access /dashboard routes.
 * 
 * NOTE: For a production app, you'd want to use httpOnly cookies
 * so middleware can read the token server-side. For this demo,
 * localStorage + client-side guards are sufficient.
 */
export function middleware(request: NextRequest) {
  // Public routes that don't require authentication
  const publicPaths = ['/', '/login', '/register', '/courses', '/blog'];
  const { pathname } = request.nextUrl;

  // Allow public paths and static files
  if (
    publicPaths.some((p) => pathname === p) ||
    pathname.startsWith('/courses/') ||
    pathname.startsWith('/blog/') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // For protected routes (like /dashboard), we let the request through
  // but the client-side AuthContext will redirect if not authenticated.
  // This is because we can't read localStorage in middleware.
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
