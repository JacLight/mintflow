# GitHub OAuth Troubleshooting Guide

If you're encountering a server error when trying to authenticate with GitHub, follow these troubleshooting steps:

## 1. Check GitHub OAuth App Configuration

The most common issue is a mismatch between the callback URL configured in your GitHub OAuth app and the one expected by NextAuth.js.

### Verify GitHub OAuth App Settings

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Select your OAuth App
3. Check the "Authorization callback URL" setting
4. It should be exactly: `http://localhost:3000/api/auth/callback/github` (for development)
   - For production, it would be: `https://your-domain.com/api/auth/callback/github`
5. If it's different, update it to match the correct URL

## 2. Verify Environment Variables

Make sure your environment variables are correctly set in `.env.local`:

```
GITHUB_ID=Ov23li0xb8hxrmnR3dDh
GITHUB_SECRET=360f73aac4773826c724f8ffe40e8f931e42e351
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=mintflow-nextauth-secret-key-for-jwt-encryption-and-cookies
```

- `GITHUB_ID` and `GITHUB_SECRET` must match the values from your GitHub OAuth App
- `NEXTAUTH_URL` must match the base URL of your application
- `NEXTAUTH_SECRET` must be a strong, unique string used for encryption

## 3. Check Server Logs

Look at the server logs for more detailed error information:

```bash
# If using Next.js development server
npm run dev

# Check for any error messages in the terminal output
```

Common error messages and their solutions:

- **"The redirect_uri MUST match the registered callback URL"**: The callback URL in your GitHub OAuth app doesn't match the one NextAuth.js is using.
- **"Client authentication failed"**: The client ID or secret is incorrect.
- **"The requested scope is invalid"**: The scopes requested by NextAuth.js are not enabled for your GitHub OAuth app.

## 4. Verify API Routes

Make sure your NextAuth.js API route is correctly set up:

```typescript
// ui-web/src/app/api/auth/[...nextauth]/route.ts
import { handlers } from '@/app/(auth)/auth';
export const { GET, POST } = handlers;
```

## 5. Check for CORS Issues

If you're running the frontend and backend on different domains or ports, you might encounter CORS issues:

1. Make sure your backend has CORS configured to allow requests from your frontend domain
2. Check for CORS-related errors in the browser console

## 6. Try a Different Browser or Incognito Mode

Sometimes browser extensions or cached data can interfere with OAuth flows:

1. Try using an incognito/private browsing window
2. Try a different browser
3. Clear your browser cookies and cache

## 7. Debug NextAuth.js

You can enable debug mode in NextAuth.js to get more detailed logs:

```typescript
// ui-web/src/app/(auth)/auth.ts
export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  debug: true,  // Add this line
  // ...
});
```

## 8. Check GitHub API Status

Rarely, GitHub's OAuth API might be experiencing issues:

1. Check [GitHub Status](https://www.githubstatus.com/) for any reported outages
2. Wait and try again later if there are known issues

## 9. Restart Your Development Server

Sometimes simply restarting your development server can resolve issues:

```bash
# Stop the current server (Ctrl+C)
# Then restart it
npm run dev
```

## 10. Verify Network Connectivity

Make sure your development machine can connect to GitHub's API:

```bash
curl -I https://api.github.com
```

You should receive a `HTTP/2 200` response if the connection is successful.

## Next Steps

If you've gone through all these steps and are still encountering issues, try:

1. Temporarily creating a new GitHub OAuth App with minimal configuration
2. Checking if the issue persists with other OAuth providers (Google, Facebook)
3. Looking for similar issues in the [NextAuth.js GitHub repository](https://github.com/nextauthjs/next-auth/issues)
