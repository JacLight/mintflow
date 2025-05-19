# Debugging MintFlow Web Application

This guide provides instructions on how to debug the MintFlow web application using different methods.

## VS Code Debugging

We've set up VS Code launch configurations to make debugging easier. To use them:

1. Open the project in VS Code
2. Go to the "Run and Debug" view (Ctrl+Shift+D or Cmd+Shift+D on Mac)
3. Select one of the following configurations from the dropdown:

   - **Next.js: debug server-side**: Debug server-side code only
   - **Next.js: debug client-side**: Debug client-side code in Chrome
   - **Next.js: debug full stack**: Debug both server and client code simultaneously

4. Click the green play button or press F5 to start debugging

You can now set breakpoints in your code by clicking in the gutter next to line numbers. When the code execution reaches a breakpoint, it will pause, allowing you to inspect variables, step through code, etc.

## Using npm Scripts

We've also added npm scripts for debugging that work cross-platform:

```bash
# Start the application with the Node.js inspector enabled
npm run debug

# Start with the inspector and break on the first line of code
npm run debug-brk
```

When using these scripts, you can:

1. Open Chrome and navigate to `chrome://inspect`
2. Click on "Open dedicated DevTools for Node"
3. Set breakpoints and debug your application

The debugger will be available at `chrome://inspect` or at `http://localhost:9229/json/list` (you can open this URL in Chrome DevTools).

## Debugging Authentication Flow

To debug the Google Authentication flow specifically:

1. Set breakpoints in the following files:
   - `src/app/(auth)/auth/google/callback/page.tsx`
   - `src/app/(auth)/auth/callback-action.tsx`
   - `src/lib/auth-service.ts`
   - `src/lib/appmint-auth.ts`
   - `src/lib/appmint-client.ts`

2. Start the application in debug mode using one of the methods above

3. Try to log in with Google and observe the execution flow

## Environment Variables

Make sure your environment variables are correctly set in `.env.local`:

```
APPENGINE_ENDPOINT=https://appengine.appmint.io
APP_ID=demo
APP_SECRET=vf2m4h82kajh3g6unnne
APP_KEY=wpfipw8ekwqhe5z46hss
ORG_ID=demo
SITE_NAME=demo
DOMAIN_AS_ORG=true
```

## Common Issues

1. **"searchParams should be awaited" error**: Make sure you're properly awaiting searchParams in Next.js route handlers:

```typescript
// Incorrect
const { code, state } = searchParams;

// Correct
const params = await Promise.resolve(searchParams);
const code = params.code;
const state = params.state;
```

2. **"Invalid URL" error**: Check that APPENGINE_ENDPOINT is correctly set in your environment variables.

3. **OAuth redirect issues**: Verify that the OAuth callback URLs are correctly configured in the Google Developer Console.
