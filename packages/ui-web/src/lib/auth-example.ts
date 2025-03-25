import { getAppmintAuth } from './appmint-auth';

/**
 * Example usage of the AppmintAuth service
 * This file demonstrates how to use the custom authentication endpoints
 */

// Get the AppmintAuth instance
const appmintAuth = getAppmintAuth();

/**
 * Example: User login
 */
async function loginExample(email: string, password: string) {
    try {
        // Call the login method
        const response = await appmintAuth.login(email, password);

        // Handle successful login
        console.log('Login successful:', response);

        // You might want to store the auth token in localStorage or a state management system
        if (response?.token) {
            // Example: storing token in localStorage
            localStorage.setItem('authToken', response.token);

            // Example: storing user info
            if (response.user) {
                localStorage.setItem('user', JSON.stringify(response.user));
            }
        }

        return response;
    } catch (error) {
        // Handle login error
        console.error('Login failed:', error);
        throw error;
    }
}

/**
 * Example: User registration
 */
async function registerExample(userData: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
}) {
    try {
        // Call the register method
        const response = await appmintAuth.register(userData);

        // Handle successful registration
        console.log('Registration successful:', response);

        // You might want to automatically log the user in after registration
        // or redirect them to a login page

        return response;
    } catch (error) {
        // Handle registration error
        console.error('Registration failed:', error);
        throw error;
    }
}

/**
 * Example: Forgot password
 */
async function forgotPasswordExample(email: string) {
    try {
        // Call the forgotPassword method
        const response = await appmintAuth.forgotPassword(email);

        // Handle successful forgot password request
        console.log('Forgot password request sent:', response);

        // You might want to show a message to the user to check their email

        return response;
    } catch (error) {
        // Handle forgot password error
        console.error('Forgot password request failed:', error);
        throw error;
    }
}

/**
 * Example: Reset password
 */
async function resetPasswordExample(token: string, newPassword: string) {
    try {
        // Call the resetPassword method
        const response = await appmintAuth.resetPassword(token, newPassword);

        // Handle successful password reset
        console.log('Password reset successful:', response);

        // You might want to redirect the user to the login page

        return response;
    } catch (error) {
        // Handle password reset error
        console.error('Password reset failed:', error);
        throw error;
    }
}

/**
 * Example: Update user profile
 */
async function updateProfileExample(userData: any) {
    try {
        // Get the auth token from localStorage or your state management system
        const authToken = localStorage.getItem('authToken');

        if (!authToken) {
            throw new Error('User not authenticated');
        }

        // Call the updateProfile method
        const response = await appmintAuth.updateProfile(userData, authToken);

        // Handle successful profile update
        console.log('Profile update successful:', response);

        // You might want to update the user info in localStorage or your state management system
        if (response?.user) {
            localStorage.setItem('user', JSON.stringify(response.user));
        }

        return response;
    } catch (error) {
        // Handle profile update error
        console.error('Profile update failed:', error);
        throw error;
    }
}

/**
 * Example: Refresh token
 */
async function refreshTokenExample() {
    try {
        // Get the refresh token from localStorage or your state management system
        const refreshToken = localStorage.getItem('refreshToken');

        if (!refreshToken) {
            throw new Error('Refresh token not found');
        }

        // Call the refreshToken method
        const response = await appmintAuth.refreshToken(refreshToken);

        // Handle successful token refresh
        console.log('Token refresh successful:', response);

        // Update the tokens in localStorage or your state management system
        if (response?.token) {
            localStorage.setItem('authToken', response.token);
        }

        if (response?.refreshToken) {
            localStorage.setItem('refreshToken', response.refreshToken);
        }

        return response;
    } catch (error) {
        // Handle token refresh error
        console.error('Token refresh failed:', error);
        throw error;
    }
}

// Export the example functions
export {
    loginExample,
    registerExample,
    forgotPasswordExample,
    resetPasswordExample,
    updateProfileExample,
    refreshTokenExample
};
