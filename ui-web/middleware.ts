import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Public paths that don't require authentication
  const publicPaths = [
    '/login',
    '/register',
    '/auth',
    '/login/error',
    '/forgot-password',
    '/reset-password',
  ];

  // Check if the path is public
  const isPublicPath = publicPaths.some(path =>
    pathname.startsWith(path) ||
    pathname === '/' ||
    pathname.startsWith('/_next') ||
    pathname.includes('/public/') ||
    pathname.includes('.') // Static files
  );

  // Get the authentication token from cookies
  const token = request.cookies.get('token')?.value;

  // If the path is not public and there's no token, redirect to login
  if (!isPublicPath && !token) {
    const url = new URL('/login', request.url);
    url.searchParams.set('callbackUrl', encodeURIComponent(pathname));
    return NextResponse.redirect(url);
  }

  // If the user is authenticated and trying to access login/register, redirect to home
  if (token && (pathname.startsWith('/login') || pathname.startsWith('/register'))) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Continue with the request
  return NextResponse.next();
}

// Don't invoke Middleware on some paths
export const config = {
  matcher: [
    // Exclude static files and favicon
    '/((?!_next/static|_next/image|favicon.ico).*)'
  ]
};
