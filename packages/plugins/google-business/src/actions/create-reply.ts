import { commonSchema, googleApiUrls, googleBusinessUtils } from '../common.js';
import axios from 'axios';

export const createReply = {
    name: 'create_reply',
    displayName: 'Create or Update Reply',
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
            reviewName: {
                type: 'string',
                description: 'The name of the review to reply to (format: accounts/*/locations/*/reviews/*)'
            },
            comment: {
                type: 'string',
                description: 'The text of the reply'
            }
        },
        required: ['auth', 'reviewName', 'comment']
    },
    outputSchema: {
        type: 'object',
        properties: {
            name: { type: 'string' },
            reviewReply: { 
                type: 'object',
                properties: {
                    comment: { type: 'string' },
                    updateTime: { type: 'string' }
                }
            }
        }
    },
    exampleInput: {
        auth: {
            access_token: 'ya29.a0AfB_byC...'
        },
        reviewName: 'accounts/123456789/locations/987654321/reviews/12345',
        comment: 'Thank you for your feedback! We appreciate your business and look forward to serving you again.'
    },
    exampleOutput: {
        name: 'accounts/123456789/locations/987654321/reviews/12345',
        reviewReply: {
            comment: 'Thank you for your feedback! We appreciate your business and look forward to serving you again.',
            updateTime: '2023-01-15T10:30:00Z'
        }
    },
    execute: async (input: any, context: any) => {
        try {
            const { auth, reviewName, comment } = input;

            if (!googleBusinessUtils.validateToken(auth.access_token)) {
                throw new Error('Invalid or missing access token');
            }

            // Validate review name format
            if (!reviewName.match(/accounts\/.*\/locations\/.*\/reviews\/.*/)) {
                throw new Error('Invalid review name format. Expected format: accounts/*/locations/*/reviews/*');
            }

            // Make API request
            const response = await axios.put(
                `${googleApiUrls.mybusiness}/${reviewName}/reply`,
                { comment },
                {
                    headers: {
                        Authorization: `Bearer ${auth.access_token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            
            return response.data;
        } catch (error: unknown) {
            return googleBusinessUtils.handleApiError(error);
        }
    }
};
