import { NextRequest, NextResponse } from 'next/server';
import { AlertType } from './types';

// Type for the alert request body
interface AlertRequest {
    title: string;
    message: string;
    alertType: AlertType;
    details?: string;
}

export async function POST(request: NextRequest) {
    try {
        const alertData: AlertRequest = await request.json();

        // Validate the required fields
        if (!alertData.title || !alertData.message || !alertData.alertType) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        // Here you could store the alert in a database if needed
        // For now we'll just return success

        return NextResponse.json(
            { success: true, message: 'Alert created' },
            { status: 201 }
        );
    } catch (error) {
        console.error('Error creating alert:', error);
        return NextResponse.json(
            { error: 'Failed to create alert' },
            { status: 500 }
        );
    }
}
