/**
 * Authentication service for the MintFlow application
 * Provides methods for user authentication operations like login, register, 
 * token refresh, and token verification
 */

import { activeSession } from './active-session';

// Base URL for API requests
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7001/api';

/**
 * Login a user with email and password
 * @param email User's email
 * @param password User's password
 * @returns Promise with login response
 */
export async function login(email: string, password: string) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Login failed');
        }

        const data = await response.json();

        // Store session data
        if (data.token && data.customer) {
            activeSession.setActiveSession(data.token, data.customer, data.refreshToken || '');
        }

        return data;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
}

/**
 * Register a new user
 * @param userData User registration data
 * @returns Promise with registration response
 */
export async function register(userData: {
    email: string;
    password: string;
    name?: string;
}) {
    try {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Registration failed');
        }

        const data = await response.json();

        // Store session data
        if (data.token && data.customer) {
            activeSession.setActiveSession(data.token, data.customer, data.refreshToken || '');
        }

        return data;
    } catch (error) {
        console.error('Registration error:', error);
        throw error;
    }
}

/**
 * Refresh the authentication token
 * @returns Promise with new token
 */
export async function refreshToken() {
    try {
        const refreshToken = activeSession.getRefreshToken();

        if (!refreshToken) {
            throw new Error('No refresh token available');
        }

        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token: refreshToken }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Token refresh failed');
        }

        const data = await response.json();

        // Update token in session
        if (data.token) {
            const user = activeSession.getUser();
            activeSession.setActiveSession(data.token, user, data.refreshToken || refreshToken);
        }

        return data;
    } catch (error) {
        console.error('Token refresh error:', error);
        throw error;
    }
}

/**
 * Verify the authentication token
 * @returns Promise with user data if token is valid
 */
export async function verifyToken() {
    try {
        const token = activeSession.getToken().replace('Bearer ', '');

        if (!token) {
            throw new Error('No token available');
        }

        const response = await fetch(`${API_BASE_URL}/auth/verify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ token }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Token verification failed');
        }

        return await response.json();
    } catch (error) {
        console.error('Token verification error:', error);
        throw error;
    }
}


import { getAppmintAuth } from './appmint-auth';

/**
 * Integration service for AppMint authentication with NextAuth
 * Provides methods for validating users with AppMint after social login
 */

// Get the AppMint Auth instance
const appmintAuth = getAppmintAuth();


/**
 * Register a user in AppMint
 * @param userData User data including email, name, etc.
 * @returns Promise with registration response
 */
export async function registerUserInAppMint(userData: {
    email: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    name?: string;
    [key: string]: any;
}): Promise<any> {
    try {
        // Generate a random password if not provided
        // This is useful for social login where we don't have a password
        const password = userData.password || Math.random().toString(36).slice(-12);

        // Extract first and last name from name if provided
        let firstName = userData.firstName;
        let lastName = userData.lastName;

        if (!firstName && !lastName && userData.name) {
            const nameParts = userData.name.split(' ');
            firstName = nameParts[0];
            lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
        }

        // Register user in AppMint
        const { email, name, ...otherFields } = userData;
        const response = await appmintAuth.register({
            email,
            password,
            firstName,
            lastName,
            ...otherFields, // Include any other fields except email and name which we've already handled
        });

        return response;
    } catch (error) {
        console.error('Failed to register user in AppMint:', error);
        throw error;
    }
}

/**
 * Validate a user with AppMint after social login
 * @param user User data from social login
 * @returns Promise with validated user data
 */
export async function validateSocialLoginWithAppMint(user: any, account?: any): Promise<any> {
    try {
        // Check if user exists in AppMint
        const result = await appmintAuth.validateSocialLogin({ user, account });
        if (typeof window !== 'undefined' && result.token && result.user) {
            activeSession.setActiveSession(
                result.token,
                result.user,
                result.refreshToken || ''
            );
        }
        // }

        return result;
    } catch (error) {
        console.error('Failed to validate social login with AppMint:', error);
        // Return the original user data if validation fails
        return user;
    }
}

/**
 * Login a user with AppMint
 * @param email User's email
 * @param password User's password
 * @returns Promise with login response
 */
export async function loginWithAppMint(email: string, password: string): Promise<any> {
    try {
        const response = await appmintAuth.login(email, password);
        return response;
    } catch (error) {
        console.error('Failed to login with AppMint:', error);
        throw error;
    }
}


/**
 * Logout the current user
 */
export function logout() {
    activeSession.clearSession();
}

/**
 * Check if the user is authenticated
 * @returns Boolean indicating if the user is authenticated
 */
export function isAuthenticated() {
    return !!activeSession.getToken();
}

/**
 * Get the current user
 * @returns User object or null if not authenticated
 */
export function getCurrentUser() {
    return activeSession.getUser();
}
