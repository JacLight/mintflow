import { createAuthClient, commonSchema, googleSearchUtils } from '../common.js';

export const listSites = {
    name: 'list_sites',
    displayName: 'List Sites',
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
            }
        },
        required: ['auth']
    },
    outputSchema: {
        type: 'object',
        properties: {
            siteEntry: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        siteUrl: { type: 'string' },
                        permissionLevel: { type: 'string' }
                    }
                }
            }
        }
    },
    exampleInput: {
        auth: {
            access_token: 'ya29.a0AfB_byC...'
        }
    },
    exampleOutput: {
        siteEntry: [
            {
                siteUrl: 'https://example.com/',
                permissionLevel: 'siteOwner'
            },
            {
                siteUrl: 'https://blog.example.com/',
                permissionLevel: 'siteOwner'
            }
        ]
    },
    execute: async (input: any, context: any) => {
        try {
            const { auth } = input;

            if (!googleSearchUtils.validateToken(auth.access_token)) {
                throw new Error('Invalid or missing access token');
            }

            const webmasters = createAuthClient(auth.access_token);
            
            // Make API request
            const response = await webmasters.sites.list();
            
            return response.data;
        } catch (error: unknown) {
            return googleSearchUtils.handleApiError(error);
        }
    }
};
