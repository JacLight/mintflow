import { Client } from '@microsoft/microsoft-graph-client';

/**
 * Initialize Microsoft Graph client with the provided token
 */
export const initGraphClient = (token: string): Client => {
    return Client.initWithMiddleware({
        authProvider: {
            getAccessToken: () => Promise.resolve(token),
        },
    });
};

/**
 * Handle Microsoft Graph API errors
 */
export const handleGraphError = (error: any): Error => {
    if (error instanceof Error) {
        return new Error(`Microsoft Graph API error: ${error.message}`);
    }
    return error;
};
