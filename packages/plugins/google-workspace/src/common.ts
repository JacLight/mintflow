import { validateValue } from '@mintflow/common';

export const commonSchema = {
    exampleInput: {
        // Example input will be specific to each action
    },
    description: "Google Workspace integration for MintFlow",
    documentation: "https://docs.mintflow.com/plugins/google-workspace",
    method: 'exec',
};

// Common URLs for Google APIs
export const googleApiUrls = {
    calendar: 'https://www.googleapis.com/calendar/v3',
    contacts: 'https://people.googleapis.com/v1/people',
    docs: 'https://docs.googleapis.com/v1',
    drive: 'https://www.googleapis.com/drive/v3',
    tasks: 'https://tasks.googleapis.com/tasks/v1',
};

// Common utility functions
export const googleWorkspaceUtils = {
    // Format date to ISO string
    formatDate: (date: Date | string): string => {
        if (typeof date === 'string') {
            date = new Date(date);
        }
        return date.toISOString();
    },

    // Parse response from Google API
    parseResponse: (response: any): any => {
        try {
            if (typeof response === 'string') {
                return JSON.parse(response);
            }
            return response;
        } catch (error) {
            console.error('Error parsing response:', error);
            return response;
        }
    },

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
