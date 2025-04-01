# NextAuth.js Troubleshooting Guide

If you're encountering server errors with NextAuth.js authentication, follow these troubleshooting steps:

## 1. Check Environment Variables

Make sure all required environment variables are correctly set in `.env.local`:

```
# NextAuth.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=mintflow-nextauth-secret-key-for-jwt-encryption-and-cookies

# OAuth Providers
GITHUB_ID=Ov23li0xb8hxrmnR3dDh
GITHUB_SECRET=360f73aac4773826c724f8ffe40e8f931e42e351

GOOGLE_ID=183221293525-7arotq7dbe38stt7m5dr53slug9gc8v2.apps.googleusercontent.com
GOOGLE_SECRET=your-google-client-secret

FACEBOOK_ID=517369844777814
FACEBOOK_SECRET=bfdc5c5635d4ff645aa85221d3a479ba
```

- `NEXTAUTH_URL` must match the base URL of your application
- `NEXTAUTH_SECRET` must be a strong, unique string used for encryption
- OAuth provider credentials must match those from the respective developer consoles

## 2. Check API Routes

Ensure your NextAuth.js API route is correctly set up:

```typescript
// ui-web/src/app/api/auth/[...nextauth]/route.ts
import { handlers } from '@/app/(auth)/auth';
export const { GET, POST } = handlers;
```

Make sure the import path is correct. If you're getting a module not found error, try using a relative path:

```typescript
import { handlers } from '../../../(auth)/auth';
export const { GET, POST } = handlers;
```

## 3. Check NextAuth.js Configuration

Review your NextAuth.js configuration in `auth.ts`:

```typescript
export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  debug: true, // Enable debug mode for detailed logs
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    // Other providers...
  ],
  // Callbacks and other configuration...
});
```

## 4. Check for Missing Google Client Secret

If you're seeing an error specifically with Google authentication, make sure you've added the Google client secret to your `.env.local` file:

```
GOOGLE_SECRET=your-google-client-secret
```

## 5. Verify OAuth Provider Configuration

Make sure the callback URLs are correctly configured in each provider's developer console:

- **GitHub**: `http://localhost:3000/api/auth/callback/github`
- **Google**: `http://localhost:3000/api/auth/callback/google`
- **Facebook**: `http://localhost:3000/api/auth/callback/facebook`

## 6. Check for Path Inconsistencies

Make sure the paths in your NextAuth.js configuration match the actual file structure:

- If your auth.ts file is in `ui-web/src/app/(auth)/auth.ts`, make sure imports reference this path correctly
- If your login page is at `ui-web/src/app/(auth)/login/page.tsx`, make sure the `pages.signIn` path in your NextAuth.js configuration is set to `/auth/login`

## 7. Simplify Configuration for Testing

Try simplifying your NextAuth.js configuration to isolate the issue:

```typescript
export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  ],
  debug: true,
});
```

## 8. Check for Middleware Conflicts

If you have a `middleware.ts` file, make sure it's not interfering with the NextAuth.js routes:

```typescript
// ui-web/middleware.ts
export { default } from "next-auth/middleware";

export const config = {
  matcher: [
    // Exclude paths that should not be protected
    "/((?!api|_next/static|_next/image|favicon.ico|login|register).*)",
  ],
};
```

## 9. Check for Next.js Version Compatibility

Make sure you're using a version of NextAuth.js that's compatible with your Next.js version:

```bash
# Check Next.js version
npm list next

# Check NextAuth.js version
npm list next-auth
```

For Next.js 13 or later with the App Router, make sure you're using NextAuth.js v4.22.1 or later.

## 10. Check Server Logs

Look at the server logs for more detailed error information:

```bash
# If using Next.js development server
npm run dev

# Check for any error messages in the terminal output
```

## 11. Try a Clean Build

Sometimes clearing the Next.js cache and rebuilding can resolve issues:

```bash
# Remove the .next directory
rm -rf .next

# Rebuild the application
npm run build

# Start the development server
npm run dev
```

## 12. Check for CORS Issues

If you're running the frontend and backend on different domains or ports, you might encounter CORS issues:

1. Make sure your backend has CORS configured to allow requests from your frontend domain
2. Check for CORS-related errors in the browser console

## 13. Try a Different Browser or Incognito Mode

Sometimes browser extensions or cached data can interfere with OAuth flows:

1. Try using an incognito/private browsing window
2. Try a different browser
3. Clear your browser cookies and cache

## Next Steps

If you've gone through all these steps and are still encountering issues:

1. Check the [NextAuth.js documentation](https://next-auth.js.org/getting-started/introduction)
2. Look for similar issues in the [NextAuth.js GitHub repository](https://github.com/nextauthjs/next-auth/issues)
3. Try implementing a minimal authentication setup to isolate the issue
