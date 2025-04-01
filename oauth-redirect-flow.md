# OAuth Redirect Flow in MintFlow

This document explains how OAuth redirects are handled in the MintFlow application.

## Overview of OAuth Redirect Flow

The OAuth 2.0 authorization flow involves several redirects:

1. **Initial Redirect**: When a user clicks on a social login button (e.g., "Login with Google"), they are redirected to the OAuth provider's authorization page.
2. **Authorization Redirect**: After the user authorizes the application, the OAuth provider redirects back to our application with an authorization code.
3. **Post-Authentication Redirect**: After successful authentication, the user is redirected to the appropriate page in our application.

## Implementation in MintFlow

### 1. NextAuth.js Configuration

NextAuth.js handles most of the OAuth redirect flow automatically. The configuration is set up in two main files:

#### `ui-web/src/app/(auth)/auth.config.ts`

This file defines the basic configuration for NextAuth, including:

- Custom pages for sign-in, sign-up, etc.
- Authorization logic that determines where users should be redirected based on their authentication status and the page they're trying to access.

```typescript
export const authConfig = {
  pages: {
    signIn: '/login',
    newUser: '/',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      // Redirect logic based on authentication status and requested URL
      // ...
    },
  },
} satisfies NextAuthConfig;
```

#### `ui-web/src/app/(auth)/auth.ts`

This file configures the OAuth providers and defines callbacks for the authentication process:

```typescript
export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  providers: [
    GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
    Google({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_SECRET,
    }),
    Facebook({
      clientId: process.env.FACEBOOK_ID,
      clientSecret: process.env.FACEBOOK_SECRET,
    }),
    // ...
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Logic executed after successful sign-in
      // ...
    },
    // ...
  },
  pages: {
    signIn: '/auth/login',
  }
});
```

### 2. API Routes for OAuth Callbacks

NextAuth.js requires API routes to handle OAuth callbacks. These are defined in:

#### `ui-web/src/app/api/auth/[...nextauth]/route.ts`

```typescript
import { handlers } from '@/app/(auth)/auth';
export const { GET, POST } = handlers;
```

This file exports the NextAuth.js handlers that process OAuth callbacks. When an OAuth provider redirects back to our application, the request is handled by these routes.

### 3. OAuth Redirect URLs

For OAuth to work correctly, you must configure the correct redirect URLs in each OAuth provider's developer console:

- **Google**: `https://your-domain.com/api/auth/callback/google`
- **GitHub**: `https://your-domain.com/api/auth/callback/github`
- **Facebook**: `https://your-domain.com/api/auth/callback/facebook`

In development, these would be:

- `http://localhost:3000/api/auth/callback/google`
- `http://localhost:3000/api/auth/callback/github`
- `http://localhost:3000/api/auth/callback/facebook`

### 4. Social Login Buttons

The social login buttons in the UI trigger the OAuth flow:

#### `ui-web/src/app/(auth)/social-logins.tsx`

```typescript
export function SocialLogins() {
    const router = useRouter();

    const handleSocialLogin = (provider: 'github' | 'google' | 'facebook') => {
        router.push(socialLoginUrls[provider]);
    };

    return (
        <div className="space-y-3">
            <Button
                className="w-full h-11"
                variant="outline"
                onClick={() => handleSocialLogin('github')}
            >
                <Github className="mr-2 h-5 w-5" />
                Continue with GitHub
            </Button>
            // ... other buttons
        </div>
    );
}
```

#### `ui-web/src/app/(auth)/social-login-urls.ts`

```typescript
export const socialLoginUrls = {
    github: '/api/auth/signin/github?callbackUrl=/',
    google: '/api/auth/signin/google?callbackUrl=/',
    facebook: '/api/auth/signin/facebook?callbackUrl=/'
};
```

The `callbackUrl` parameter specifies where the user should be redirected after successful authentication.

## Complete OAuth Flow

1. User clicks "Login with Google" button
2. NextAuth.js redirects to Google's authorization page
3. User authorizes the application on Google
4. Google redirects back to `/api/auth/callback/google`
5. NextAuth.js processes the callback:
   - Exchanges the authorization code for an access token
   - Retrieves the user's profile information
   - Creates or updates the user in our database
   - Creates a session for the user
6. NextAuth.js redirects the user to the URL specified in `callbackUrl` (in this case, the home page '/')

## Customizing Redirects

You can customize where users are redirected after authentication by:

1. **Changing the default redirect in `social-login-urls.ts`**:

   ```typescript
   export const socialLoginUrls = {
       github: '/api/auth/signin/github?callbackUrl=/dashboard',
       // ...
   };
   ```

2. **Dynamically setting the redirect URL**:

   ```typescript
   const handleSocialLogin = (provider: 'github' | 'google' | 'facebook') => {
       const baseUrl = socialLoginUrls[provider].split('?')[0];
       const callbackUrl = encodeURIComponent('/dashboard');
       router.push(`${baseUrl}?callbackUrl=${callbackUrl}`);
   };
   ```

3. **Modifying the `authorized` callback in `auth.config.ts`** to implement custom redirect logic based on user roles or other criteria.

## Troubleshooting OAuth Redirects

If you encounter issues with OAuth redirects:

1. **Check OAuth Provider Configuration**:
   - Verify that the redirect URIs are correctly configured in each provider's developer console
   - Ensure the client IDs and secrets in `.env.local` match those in the provider's console

2. **Check NextAuth.js Configuration**:
   - Verify that the `NEXTAUTH_URL` environment variable is set correctly
   - Ensure that the API routes are properly set up

3. **Check for Redirect Errors**:
   - Look for error parameters in the redirect URL
   - Check the browser console for any errors
   - Check the server logs for authentication-related errors

4. **Common Issues**:
   - Mismatched redirect URIs
   - Invalid client IDs or secrets
   - Missing or incorrect scopes
   - CORS issues in development
