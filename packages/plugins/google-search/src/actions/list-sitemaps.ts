import { createAuthClient, commonSchema, googleSearchUtils } from '../common.js';

export const listSitemaps = {
    name: 'list_sitemaps',
    displayName: 'List Sitemaps',
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
            siteUrl: {
                type: 'string',
                description: 'The URL of the site to list sitemaps for'
            }
        },
        required: ['auth', 'siteUrl']
    },
    outputSchema: {
        type: 'object',
        properties: {
            sitemap: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        path: { type: 'string' },
                        lastSubmitted: { type: 'string' },
                        lastDownloaded: { type: 'string' },
                        warnings: { type: 'string' },
                        errors: { type: 'string' },
                        isPending: { type: 'boolean' },
                        isSitemapsIndex: { type: 'boolean' },
                        contents: { type: 'array' }
                    }
                }
            }
        }
    },
    exampleInput: {
        auth: {
            access_token: 'ya29.a0AfB_byC...'
        },
        siteUrl: 'https://example.com'
    },
    exampleOutput: {
        sitemap: [
            {
                path: 'https://example.com/sitemap.xml',
                lastSubmitted: '2023-01-15T10:30:00Z',
                lastDownloaded: '2023-01-15T10:35:00Z',
                warnings: '0',
                errors: '0',
                isPending: false,
                isSitemapsIndex: true,
                contents: [
                    {
                        type: 'web',
                        submitted: '10',
                        indexed: '8'
                    }
                ]
            }
        ]
    },
    execute: async (input: any, context: any) => {
        try {
            const { auth, siteUrl } = input;

            if (!googleSearchUtils.validateToken(auth.access_token)) {
                throw new Error('Invalid or missing access token');
            }

            const webmasters = createAuthClient(auth.access_token);
            
            // Make API request
            const response = await webmasters.sitemaps.list({
                siteUrl: siteUrl
            });
            
            return response.data;
        } catch (error: unknown) {
            return googleSearchUtils.handleApiError(error);
        }
    }
};
