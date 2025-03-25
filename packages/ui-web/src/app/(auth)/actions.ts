'use server';
// app/auth/actions.ts

import { redirect } from 'next/navigation';
import { registerUserInAppMint, loginWithAppMint } from '@/lib/appmint-auth-integration';

// Server action for credentials login
export async function loginWithCredentials(formData: FormData) {
    console.log('loginWithCredentials');

    try {
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        // Use AppMint for login
        const response = await loginWithAppMint(email, password);

        if (response && response.token) {
            // Login successful, return success and redirect URL
            // Note: In a real implementation, you would need to set cookies or session
            // This is a simplified version
            return { success: true, redirectUrl: '/ui' };
        } else {
            // Login failed
            return { error: 'Invalid credentials' };
        }
    } catch (error) {
        console.error('Login error:', error);
        return { error: 'Login failed. Please try again.' };
    }
}

// Server action for magic link
export async function sendMagicLink(formData: FormData) {
    const email = formData.get('magic-email') as string;

    try {
        // Implementation would depend on your magic link provider
        // For now, we'll just simulate a successful magic link send

        // In a real implementation, you would:
        // 1. Validate the email
        // 2. Generate a token
        // 3. Send an email with a magic link
        // 4. Store the token in a database with an expiration time

        return { success: true, redirectUrl: '/login' };
    } catch (error) {
        console.error('Magic link error:', error);
        return { error: 'Failed to send magic link. Please try again.' };
    }
}

// Server action for user registration
export async function registerUser(formData: FormData) {
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const name = formData.get('name') as string;

    try {
        // First register the user in AppMint
        const nameParts = name.split(' ');
        const firstName = nameParts[0];
        const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

        const registrationResult = await registerUserInAppMint({
            email,
            password,
            firstName,
            lastName,
            name
        });

        if (registrationResult) {
            // Registration successful, now login
            const loginResult = await loginWithAppMint(email, password);

            if (loginResult && loginResult.token) {
                // Login successful, return success and redirect URL
                return { success: true, redirectUrl: '/' };
            }
        }

        return { success: true };
    } catch (error) {
        console.error('Registration error:', error);
        // Return error information
        return { error: 'Registration failed. Please try again.' };
    }
}
