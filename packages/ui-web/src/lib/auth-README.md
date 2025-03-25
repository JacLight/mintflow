# Appmint Custom Authentication

This module provides a custom authentication implementation using the Appmint API client. It includes functionality for user authentication operations such as login, registration, password reset, and profile management.

## Files Overview

1. **appmint-auth.ts**: Core authentication service that provides methods for interacting with Appmint authentication endpoints.
2. **auth-example.ts**: Example usage of the authentication service in a TypeScript environment.
3. **AuthExample.tsx**: React component example demonstrating how to implement authentication UI with the service.

## Authentication Service (AppmintAuth)

The `AppmintAuth` class provides the following methods:

### Login

```typescript
async login(email: string, password: string): Promise<any>
```

Authenticates a user with their email and password.

### Register

```typescript
async register(userData: {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  [key: string]: any;
}): Promise<any>
```

Registers a new user with the provided user data.

### Forgot Password

```typescript
async forgotPassword(email: string): Promise<any>
```

Sends a password reset request for the specified email.

### Reset Password

```typescript
async resetPassword(token: string, password: string): Promise<any>
```

Resets a user's password using the provided token and new password.

### Refresh Token

```typescript
async refreshToken(refreshToken: string): Promise<any>
```

Refreshes the user's authentication token using a refresh token.

### Update Profile

```typescript
async updateProfile(userData: any, authToken: string): Promise<any>
```

Updates a user's profile information.

## Usage

### Basic Usage

```typescript
import { getAppmintAuth } from './appmint-auth';

// Get the AppmintAuth instance
const appmintAuth = getAppmintAuth();

// Login example
async function loginUser(email: string, password: string) {
  try {
    const response = await appmintAuth.login(email, password);
    console.log('Login successful:', response);
    
    // Store the token
    if (response?.token) {
      localStorage.setItem('authToken', response.token);
    }
    
    return response;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
}
```

### React Component Integration

For React applications, you can use the `AuthExample.tsx` component as a reference for implementing authentication UI. The component includes:

- Login form
- Registration form
- Forgot password form
- Reset password form
- State management for authentication flows
- Error handling
- Success messaging

## Authentication Flow

1. **Server Token**: The Appmint client first authenticates with the Appmint server to get a server token using the `getToken()` method in `AppEngineClient`.

2. **User Authentication**: Once the server token is obtained, the client can make requests to the customer authentication endpoints:
   - Login: `profile/customer/signin`
   - Register: `profile/customer/signup`
   - Forgot Password: `profile/customer/password/forgot`
   - Reset Password: `profile/customer/password/reset`

3. **Token Management**: After successful authentication, the client receives tokens that should be stored securely (e.g., in localStorage) and used for subsequent authenticated requests.

## Configuration

The authentication service uses the configuration from `appmint-config.ts`, which includes:

- `APPENGINE_ENDPOINT`: The base URL for the Appmint API
- `APP_ID`: The application ID
- `APP_KEY`: The application key
- `APP_SECRET`: The application secret
- `ORG_ID`: The organization ID
- `SITE_NAME`: The site name
- `DOMAIN_AS_ORG`: Whether to use the domain as the organization

Ensure these environment variables are properly set in your application.

## Error Handling

All authentication methods include try-catch blocks to handle errors. In your implementation, you should handle these errors appropriately, such as displaying error messages to the user or logging them for debugging.

## Security Considerations

- Store authentication tokens securely
- Implement token refresh mechanisms to maintain user sessions
- Use HTTPS for all API requests
- Consider implementing additional security measures like rate limiting and CSRF protection
