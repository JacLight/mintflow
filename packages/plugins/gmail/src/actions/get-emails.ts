import axios from 'axios';
import { gmailCommons, OAuthConfig } from '../common.js';

export const getEmails = {
    name: 'get_emails',
    description: 'Get emails from Gmail inbox',
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
            max_results: {
                type: 'number',
                description: 'Maximum number of emails to retrieve',
                default: 10,
            },
            query: {
                type: 'string',
                description: 'Search query to filter emails (e.g., "is:unread", "from:someone@example.com")',
                default: '',
            },
            include_body: {
                type: 'boolean',
                description: 'Whether to include email body content',
                default: true,
            }
        },
        required: ['client_id', 'client_secret', 'refresh_token'],
    },
    outputSchema: {
        type: 'object',
        properties: {
            emails: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        threadId: { type: 'string' },
                        labelIds: { type: 'array', items: { type: 'string' } },
                        snippet: { type: 'string' },
                        from: { type: 'string' },
                        to: { type: 'string' },
                        subject: { type: 'string' },
                        date: { type: 'string' },
                        body: { type: 'string' },
                    }
                }
            },
            nextPageToken: { type: 'string' }
        },
    },
    exampleInput: {
        client_id: '123456789-abcdefg.apps.googleusercontent.com',
        client_secret: 'GOCSPX-abcdefg123456',
        refresh_token: '1//abcdefg123456',
        max_results: 5,
        query: 'is:unread',
        include_body: true
    },
    exampleOutput: {
        emails: [
            {
                id: 'msg123',
                threadId: 'thread123',
                labelIds: ['INBOX', 'UNREAD'],
                snippet: 'This is a preview of the email content...',
                from: 'sender@example.com',
                to: 'me@example.com',
                subject: 'Important Message',
                date: '2025-04-29T10:30:45Z',
                body: 'Full email body content...'
            }
        ],
        nextPageToken: 'abc123'
    },
    execute: async (input: any): Promise<any> => {
        try {
            // Configure OAuth
            const config: OAuthConfig = {
                client_id: input.client_id,
                client_secret: input.client_secret,
                refresh_token: input.refresh_token,
                redirect_uri: 'https://mintflow.app/oauth/callback',
            };
            
            // Get a fresh access token
            const authConfig = await gmailCommons.refreshToken(config);
            
            // Get list of messages based on query
            let listUrl = gmailCommons.getApiUrl('messages') + 
                `?maxResults=${input.max_results || 10}`;
            
            if (input.query) {
                listUrl += `&q=${encodeURIComponent(input.query)}`;
            }
            
            const listResponse = await axios.get(listUrl, {
                headers: {
                    'Authorization': `Bearer ${authConfig.access_token}`
                }
            });
            
            const messagesList = listResponse.data;
            
            // If no messages found, return empty array
            if (!messagesList.messages || !messagesList.messages.length) {
                return {
                    emails: [],
                    nextPageToken: messagesList.nextPageToken || null
                };
            }
            
            // Get detailed data for each message
            const emails = await Promise.all(
                messagesList.messages.map(async (msg: any) => {
                    const messageResponse = await axios.get(
                        gmailCommons.getApiUrl(`messages/${msg.id}`),
                        {
                            headers: {
                                'Authorization': `Bearer ${authConfig.access_token}`
                            }
                        }
                    );
                    
                    const message = messageResponse.data;
                    const headers = message.payload.headers;
                    
                    // Extract header fields
                    const getHeader = (name: string) => {
                        const header = headers.find((h: any) => h.name.toLowerCase() === name.toLowerCase());
                        return header ? header.value : '';
                    };
                    
                    // Extract body content if requested
                    let body = '';
                    if (input.include_body) {
                        if (message.payload.body && message.payload.body.data) {
                            // Decode body data from base64
                            body = Buffer.from(message.payload.body.data, 'base64').toString('utf-8');
                        } else if (message.payload.parts) {
                            // Handle multipart message
                            const textParts = message.payload.parts.filter((part: any) => 
                                part.mimeType === 'text/plain' || part.mimeType === 'text/html'
                            );
                            
                            if (textParts.length > 0 && textParts[0].body && textParts[0].body.data) {
                                body = Buffer.from(textParts[0].body.data, 'base64').toString('utf-8');
                            }
                        }
                    }
                    
                    return {
                        id: message.id,
                        threadId: message.threadId,
                        labelIds: message.labelIds,
                        snippet: message.snippet,
                        from: getHeader('from'),
                        to: getHeader('to'),
                        subject: getHeader('subject'),
                        date: getHeader('date'),
                        body: body
                    };
                })
            );
            
            return {
                emails,
                nextPageToken: messagesList.nextPageToken || null
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

export default getEmails;