import { getAppEngineClient } from './appmint-client';
import { appmintEndpoints } from './appmint-endpoints';

/**
 * Authentication service for Appmint
 * Provides methods for user authentication operations like login, register, 
 * forgot password, and reset password
 */
export class AppmintAuth {
    private appEngineClient = getAppEngineClient();

    /**
     * Login a user with email and password
     * @param email User's email
     * @param password User's password
     * @returns Promise with login response
     */
    async login(email: string, password: string) {
        try {
            const data = {
                email,
                password,
            };

            const response = await this.appEngineClient.processRequest(
                appmintEndpoints.login.method,
                appmintEndpoints.login.path,
                data
            );

            return response;
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
    async register(userData: {
        email: string;
        password: string;
        firstName?: string;
        lastName?: string;
        phone?: string;
        [key: string]: any;
    }) {
        try {
            const response = await this.appEngineClient.processRequest(
                appmintEndpoints.register.method,
                appmintEndpoints.register.path,
                userData
            );

            return response;
        } catch (error) {
            console.error('Registration error:', error);
            throw error;
        }
    }

    /**
     * Send a forgot password request
     * @param email User's email
     * @returns Promise with forgot password response
     */
    async forgotPassword(email: string) {
        try {
            // The endpoint is GET, so we pass the email as a query parameter
            const path = `${appmintEndpoints.forget_password.path}?email=${encodeURIComponent(email)}`;

            const response = await this.appEngineClient.processRequest(
                appmintEndpoints.forget_password.method,
                path
            );

            return response;
        } catch (error) {
            console.error('Forgot password error:', error);
            throw error;
        }
    }

    /**
     * Reset user password with token
     * @param token Reset password token
     * @param password New password
     * @returns Promise with reset password response
     */
    async resetPassword(token: string, password: string) {
        try {
            const data = {
                token,
                password,
            };

            const response = await this.appEngineClient.processRequest(
                appmintEndpoints.reset_password.method,
                appmintEndpoints.reset_password.path,
                data
            );

            return response;
        } catch (error) {
            console.error('Reset password error:', error);
            throw error;
        }
    }

    /**
     * Refresh the user's authentication token
     * @param refreshToken The refresh token
     * @returns Promise with new tokens
     */
    async refreshToken(refreshToken: string) {
        try {
            const data = {
                refreshToken,
            };

            const response = await this.appEngineClient.processRequest(
                appmintEndpoints.refresh_token.method,
                appmintEndpoints.refresh_token.path,
                data
            );

            return response;
        } catch (error) {
            console.error('Refresh token error:', error);
            throw error;
        }
    }

    /**
     * Update user profile
     * @param userData User profile data to update
     * @param authToken User's authentication token
     * @returns Promise with update response
     */
    async updateProfile(userData: any, authToken: string) {
        try {
            const response = await this.appEngineClient.processRequest(
                appmintEndpoints.profile_update.method,
                appmintEndpoints.profile_update.path,
                userData,
                authToken
            );

            return response;
        } catch (error) {
            console.error('Profile update error:', error);
            throw error;
        }
    }
}

// Create a singleton instance
let appmintAuth: AppmintAuth;

/**
 * Get the AppmintAuth instance
 * @returns AppmintAuth instance
 */
export const getAppmintAuth = (): AppmintAuth => {
    if (!appmintAuth) {
        appmintAuth = new AppmintAuth();
    }
    return appmintAuth;
};
