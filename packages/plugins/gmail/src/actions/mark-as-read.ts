import axios from 'axios';
import { gmailCommons, OAuthConfig } from '../common.js';

export const markAsRead = {
    name: 'mark_as_read',
    description: 'Mark Gmail messages as read',
    inputSchema: {
        type: 'object',
        properties: {
            client_id: {
                type: 'string',
                description: 'Google OAuth client ID',
            },
            client_secret: {
                type: 'string',
                description: 'Google OAuth client secret',
                displayStyle: 'password',
            },
            refresh_token: {
                type: 'string',
                description: 'Google OAuth refresh token',
                displayStyle: 'password',
            },
            message_ids: {
                type: 'array',
                items: { type: 'string' },
                description: 'Array of message IDs to mark as read',
            },
        },
        required: ['client_id', 'client_secret', 'refresh_token', 'message_ids'],
    },
    outputSchema: {
        type: 'object',
        properties: {
            success: { type: 'boolean' },
            modified_messages: { type: 'number' }
        },
    },
    exampleInput: {
        client_id: '123456789-abcdefg.apps.googleusercontent.com',
        client_secret: 'GOCSPX-abcdefg123456',
        refresh_token: '1//abcdefg123456',
        message_ids: ['msg123', 'msg456']
    },
    exampleOutput: {
        success: true,
        modified_messages: 2
    },
    execute: async (input: any): Promise<any> => {
        try {
            // Validate input
            if (!Array.isArray(input.message_ids) || input.message_ids.length === 0) {
                throw new Error('message_ids must be a non-empty array');
            }
            
            // Configure OAuth
            const config: OAuthConfig = {
                client_id: input.client_id,
                client_secret: input.client_secret,
                refresh_token: input.refresh_token,
                redirect_uri: 'https://mintflow.app/oauth/callback',
            };
            
            // Get a fresh access token
            const authConfig = await gmailCommons.refreshToken(config);
            
            // Batch modify messages
            const response = await axios.post(
                gmailCommons.getApiUrl('messages/batchModify'),
                {
                    ids: input.message_ids,
                    removeLabelIds: ['UNREAD']
                },
                {
                    headers: {
                        'Authorization': `Bearer ${authConfig.access_token}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            
            // The batchModify endpoint returns an empty response on success (204 No Content)
            return {
                success: true,
                modified_messages: input.message_ids.length
            };
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(`Gmail API error: ${error.message}`);
            } else if (error instanceof Error) {
                throw new Error(`Unexpected error: ${error.message}`);
            } else {
                throw new Error('Unknown error occurred');
            }
        }
    },
};

export default markAsRead;