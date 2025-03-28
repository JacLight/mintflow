import { getAppmintAuth } from './appmint-auth';

/**
 * Integration service for AppMint authentication with NextAuth
 * Provides methods for validating users with AppMint after social login
 */

// Get the AppMint Auth instance
const appmintAuth = getAppmintAuth();

/**
 * Check if a user exists in AppMint
 * @param email User's email
 * @returns Promise with login response or null if user doesn't exist
 */
export async function checkUserExistsInAppMint(email: string): Promise<any> {
    try {
        // Try to login with a dummy password to check if user exists
        // This is a workaround since AppMint doesn't provide a direct way to check if a user exists
        // The actual implementation might vary based on AppMint's API
        const response = await appmintAuth.login(email, 'dummy-password-for-check');

        // If login succeeds, user exists
        return response;
    } catch (error: any) {
        // If error is "Invalid credentials" but not "User not found", user exists
        if (error.message && error.message.includes('Invalid credentials') && !error.message.includes('User not found')) {
            return { exists: true, error };
        }

        // User doesn't exist or other error
        return null;
    }
}

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
export async function validateSocialLoginWithAppMint(user: any): Promise<any> {
    try {
        // Check if user exists in AppMint
        const existingUser = await checkUserExistsInAppMint(user.email);

        if (existingUser && !existingUser.error) {
            // User exists, return the AppMint user data
            return {
                ...user,
                appmintUser: existingUser,
            };
        } else if (existingUser && existingUser.exists) {
            // User exists but we couldn't login (expected since we used a dummy password)
            // We could potentially get user details from AppMint here if needed
            return {
                ...user,
                appmintUserExists: true,
            };
        } else {
            // User doesn't exist, register them in AppMint
            const registeredUser = await registerUserInAppMint({
                email: user.email,
                name: user.name,
                image: user.image,
                // Include any other fields from the social login that might be useful
            });

            return {
                ...user,
                appmintUser: registeredUser,
            };
        }
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
