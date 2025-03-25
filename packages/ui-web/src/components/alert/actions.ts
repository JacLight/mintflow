'use server';

import { AlertType } from './types';
import { revalidatePath } from 'next/cache';

interface ServerAlertProps {
    title: string;
    message: string;
    alertType: AlertType;
    details?: string;
    path?: string;
}

export async function createServerAlert({
    title,
    message,
    alertType,
    details,
    path = '/',
}: ServerAlertProps) {
    try {
        // Create a new alert via the API route
        const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/alerts`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                title,
                message,
                alertType,
                details,
            }),
        });

        if (!response.ok) {
            throw new Error('Failed to create alert');
        }

        // Revalidate the page to show the new alert
        if (path) {
            revalidatePath(path);
        }

        return { success: true };
    } catch (error) {
        console.error('Error creating server alert:', error);
        return { success: false, error };
    }
}
