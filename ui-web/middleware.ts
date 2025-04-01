export { auth as middleware } from '@/app/(auth)/auth';

// Don't invoke Middleware on some paths
export const config = {
  matcher: [
    // Exclude NextAuth.js API routes
    '/((?!api/auth|_next/static|_next/image|favicon.ico).*)'
  ]
};
