import { commonSchema, googleApiUrls, googleBusinessUtils } from '../common.js';
import axios from 'axios';

export const listLocations = {
    name: 'list_locations',
    displayName: 'List Locations',
    ...commonSchema,
    inputSchema: {
        type: 'object',
        properties: {
            auth: {
                type: 'object',
                properties: {
                    access_token: { type: 'string' }
                },
                required: ['access_token']
            },
            accountName: {
                type: 'string',
                description: 'The name of the account to list locations for (format: accounts/*)'
            },
            pageSize: {
                type: 'number',
                description: 'The maximum number of locations to return per page (max: 100)'
            },
            pageToken: {
                type: 'string',
                description: 'The page token from a previous response for pagination'
            },
            readMask: {
                type: 'string',
                description: 'The specific fields to include in the response (comma-separated list)'
            }
        },
        required: ['auth', 'accountName']
    },
    outputSchema: {
        type: 'object',
        properties: {
            locations: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        name: { type: 'string' },
                        title: { type: 'string' },
                        storeCode: { type: 'string' },
                        primaryPhone: { type: 'string' },
                        primaryCategory: { type: 'object' },
                        websiteUri: { type: 'string' },
                        regularHours: { type: 'object' },
                        specialHours: { type: 'object' },
                        serviceArea: { type: 'object' },
                        locationKey: { type: 'object' },
                        labels: { type: 'array' },
                        adWordsLocationExtensions: { type: 'object' },
                        latlng: { type: 'object' },
                        openInfo: { type: 'object' },
                        metadata: { type: 'object' },
                        profile: { type: 'object' },
                        relationshipData: { type: 'object' }
                    }
                }
            },
            nextPageToken: { type: 'string' }
        }
    },
    exampleInput: {
        auth: {
            access_token: 'ya29.a0AfB_byC...'
        },
        accountName: 'accounts/123456789',
        pageSize: 50,
        readMask: 'title,name,primaryPhone,websiteUri,storefrontAddress'
    },
    exampleOutput: {
        locations: [
            {
                name: 'accounts/123456789/locations/987654321',
                title: 'Example Business - Downtown',
                primaryPhone: '+1 555-123-4567',
                websiteUri: 'https://example.com',
                storefrontAddress: {
                    regionCode: 'US',
                    languageCode: 'en',
                    postalCode: '94105',
                    administrativeArea: 'CA',
                    locality: 'San Francisco',
                    addressLines: ['123 Main St', 'Suite 100']
                }
            }
        ],
        nextPageToken: 'token_for_next_page'
    },
    execute: async (input: any, context: any) => {
        try {
            const { auth, accountName, pageSize, pageToken, readMask } = input;

            if (!googleBusinessUtils.validateToken(auth.access_token)) {
                throw new Error('Invalid or missing access token');
            }

            // Validate account name format
            if (!accountName.match(/accounts\/.*/)) {
                throw new Error('Invalid account name format. Expected format: accounts/*');
            }

            // Prepare query parameters
            const params: Record<string, any> = {};
            
            if (pageSize) {
                params.pageSize = Math.min(pageSize, 100); // Max 100 per page
            } else {
                params.pageSize = 100; // Default to max
            }
            
            if (pageToken) {
                params.pageToken = pageToken;
            }
            
            if (readMask) {
                params.readMask = readMask;
            } else {
                params.readMask = 'title,name'; // Default to minimal fields
            }

            // Make API request
            const response = await axios.get(
                `${googleApiUrls.businessInformation}/${accountName}/locations`,
                {
                    headers: {
                        Authorization: `Bearer ${auth.access_token}`
                    },
                    params
                }
            );
            
            return response.data;
        } catch (error: unknown) {
            return googleBusinessUtils.handleApiError(error);
        }
    }
};
