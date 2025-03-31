import { google } from 'googleapis';
import axios from 'axios';

export const commonSchema = {
    exampleInput: {
        // Example input will be specific to each action
    },
    description: "Google My Business integration for MintFlow",
    documentation: "https://docs.mintflow.com/plugins/google-business",
    method: 'exec',
};

// Common URLs for Google APIs
export const googleApiUrls = {
    businessInformation: 'https://mybusinessbusinessinformation.googleapis.com/v1',
    mybusiness: 'https://mybusiness.googleapis.com/v4',
};

// Common utility functions
export const googleBusinessUtils = {
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
    },

    // Get accounts for a user
    getAccounts: async (accessToken: string): Promise<any[]> => {
        try {
            const response = await axios.get(
                `${googleApiUrls.businessInformation}/accounts`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`
                    }
                }
            );
            return response.data.accounts || [];
        } catch (error) {
            console.error('Error fetching accounts:', error);
            return [];
        }
    },

    // Get locations for an account
    getLocations: async (accessToken: string, accountName: string): Promise<any[]> => {
        try {
            const locations = [];
            let nextPageToken;
            
            do {
                const params: any = {
                    pageSize: 100,
                    readMask: 'title,name'
                };
                
                if (nextPageToken) {
                    params.pageToken = nextPageToken;
                }
                
                const response = await axios.get(
                    `${googleApiUrls.businessInformation}/${accountName}/locations`,
                    {
                        headers: {
                            Authorization: `Bearer ${accessToken}`
                        },
                        params
                    }
                );
                
                if (response.data.locations && Array.isArray(response.data.locations)) {
                    locations.push(...response.data.locations);
                }
                
                nextPageToken = response.data.nextPageToken;
            } while (nextPageToken);
            
            return locations;
        } catch (error) {
            console.error('Error fetching locations:', error);
            return [];
        }
    }
};
