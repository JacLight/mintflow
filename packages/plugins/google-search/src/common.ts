import { google } from 'googleapis';

export const commonSchema = {
    exampleInput: {
        // Example input will be specific to each action
    },
    description: "Google Search Console integration for MintFlow",
    documentation: "https://docs.mintflow.com/plugins/google-search",
    method: 'exec',
};

// Common URLs for Google APIs
export const googleApiUrls = {
    searchConsole: 'https://www.googleapis.com/webmasters/v3',
};

// Create authenticated client for Google Search Console API
export const createAuthClient = (accessToken: string) => {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    return google.webmasters({ version: 'v3', auth });
};

// Common utility functions
export const googleSearchUtils = {
    // Validate OAuth token
    validateToken: (token: string): boolean => {
        return !!token && token.length > 0;
    },

    // Handle API errors
    handleApiError: (error: any): any => {
        console.error('Google API Error:', error);
        if (error.response) {
            return {
                error: true,
                status: error.response.status,
                message: error.response.data?.error?.message || 'Unknown error',
                details: error.response.data
            };
        }
        return {
            error: true,
            message: error.message || 'Unknown error'
        };
    }
};
