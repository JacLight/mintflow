import { commonSchema, googleApiUrls, googleBusinessUtils } from '../common.js';
import axios from 'axios';

export const listAccounts = {
    name: 'list_accounts',
    displayName: 'List Accounts',
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
            accounts: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        name: { type: 'string' },
                        accountName: { type: 'string' },
                        type: { type: 'string' },
                        role: { type: 'string' },
                        state: { 
                            type: 'object',
                            properties: {
                                status: { type: 'string' }
                            }
                        }
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
        accounts: [
            {
                name: 'accounts/123456789',
                accountName: 'Example Business',
                type: 'LOCATION_GROUP',
                role: 'OWNER',
                state: {
                    status: 'ACTIVE'
                }
            }
        ]
    },
    execute: async (input: any, context: any) => {
        try {
            const { auth } = input;

            if (!googleBusinessUtils.validateToken(auth.access_token)) {
                throw new Error('Invalid or missing access token');
            }

            // Make API request
            const response = await axios.get(
                `${googleApiUrls.businessInformation}/accounts`,
                {
                    headers: {
                        Authorization: `Bearer ${auth.access_token}`
                    }
                }
            );
            
            return response.data;
        } catch (error: unknown) {
            return googleBusinessUtils.handleApiError(error);
        }
    }
};
