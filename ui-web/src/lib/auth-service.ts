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
        if (data.token && data.user) {
            activeSession.setActiveSession(data.token, data.user, data.refreshToken || '');
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
        if (data.token && data.user) {
            activeSession.setActiveSession(data.token, data.user, data.refreshToken || '');
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
