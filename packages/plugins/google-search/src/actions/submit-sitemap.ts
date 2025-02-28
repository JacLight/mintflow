import { createAuthClient, commonSchema, googleSearchUtils } from '../common.js';

export const submitSitemap = {
    name: 'submit_sitemap',
    displayName: 'Submit Sitemap',
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
                description: 'The URL of the site to submit the sitemap to'
            },
            feedpath: {
                type: 'string',
                description: 'The URL of the sitemap to submit'
            }
        },
        required: ['auth', 'siteUrl', 'feedpath']
    },
    outputSchema: {
        type: 'object',
        properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
        }
    },
    exampleInput: {
        auth: {
            access_token: 'ya29.a0AfB_byC...'
        },
        siteUrl: 'https://example.com',
        feedpath: 'https://example.com/sitemap.xml'
    },
    exampleOutput: {
        success: true,
        message: 'Sitemap submitted successfully'
    },
    execute: async (input: any, context: any) => {
        try {
            const { auth, siteUrl, feedpath } = input;

            if (!googleSearchUtils.validateToken(auth.access_token)) {
                throw new Error('Invalid or missing access token');
            }

            const webmasters = createAuthClient(auth.access_token);
            
            // Make API request
            await webmasters.sitemaps.submit({
                siteUrl: siteUrl,
                feedpath: feedpath
            });
            
            return {
                success: true,
                message: 'Sitemap submitted successfully'
            };
        } catch (error: unknown) {
            return googleSearchUtils.handleApiError(error);
        }
    }
};
