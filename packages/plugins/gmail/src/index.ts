import axios from 'axios';
import { gmailCommons, OAuthConfig } from './common.js';

const gmailPlugin = {
    name: "Gmail",
    icon: "FaEnvelope",
    description: "Integrate with Gmail to send emails, read messages, and manage your inbox",
    groups: ["communication", "google"],
    tags: ["email", "google", "integration", "connector"],
    version: '1.0.0',
    id: "gmail",
    runner: "node",
    type: "node",
    inputSchema: {
        type: "object"
    },
    outputSchema: {
        type: "object"
    },
    exampleInput: {},
    exampleOutput: {},
    documentation: "https://developers.google.com/gmail/api",
    method: "exec",
    actions: [
        {
            name: 'send_email',
            description: 'Send an email through Gmail',
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
                    to: {
                        type: 'string',
                        description: 'Email recipient(s). For multiple recipients, separate with commas.',
                    },
                    subject: {
                        type: 'string',
                        description: 'Email subject',
                    },
                    body: {
                        type: 'string',
                        description: 'Email body content',
                        format: 'textarea',
                    },
                    cc: {
                        type: 'string',
                        description: 'Carbon copy recipient(s). For multiple recipients, separate with commas.',
                    },
                    bcc: {
                        type: 'string',
                        description: 'Blind carbon copy recipient(s). For multiple recipients, separate with commas.',
                    },
                    is_html: {
                        type: 'boolean',
                        description: 'Whether the body is HTML',
                        default: false,
                    },
                },
                required: ['client_id', 'client_secret', 'refresh_token', 'to', 'subject', 'body'],
            },
            exampleInput: {
                client_id: '123456789-abcdefg.apps.googleusercontent.com',
                client_secret: 'GOCSPX-abcdefg123456',
                refresh_token: '1//abcdefg123456',
                to: 'recipient@example.com',
                subject: 'Test email from MintFlow',
                body: 'This is a test email sent from MintFlow Gmail integration!',
                is_html: false,
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
                    
                    // Construct email payload
                    const emailLines = [];
                    
                    // Add headers
                    emailLines.push(`To: ${input.to}`);
                    if (input.cc) emailLines.push(`Cc: ${input.cc}`);
                    if (input.bcc) emailLines.push(`Bcc: ${input.bcc}`);
                    emailLines.push(`Subject: ${input.subject}`);
                    
                    // Add content type
                    if (input.is_html) {
                        emailLines.push('Content-Type: text/html; charset=UTF-8');
                    } else {
                        emailLines.push('Content-Type: text/plain; charset=UTF-8');
                    }
                    
                    // Add blank line between headers and body
                    emailLines.push('');
                    
                    // Add body
                    emailLines.push(input.body);
                    
                    // Create the raw message
                    const email = emailLines.join('\r\n');
                    const encodedEmail = Buffer.from(email).toString('base64')
                        .replace(/\+/g, '-')
                        .replace(/\//g, '_')
                        .replace(/=+$/, '');
                    
                    // Send the email
                    const response = await axios.post(
                        gmailCommons.getApiUrl('messages/send'),
                        { raw: encodedEmail },
                        {
                            headers: {
                                'Authorization': `Bearer ${authConfig.access_token}`,
                                'Content-Type': 'application/json',
                            },
                        }
                    );
                    
                    return response.data;
                } catch (error) {
                    if (axios.isAxiosError(error)) {
                        throw new Error(`Gmail API error: ${error.message}`);
                    } else if (error instanceof Error) {
                        throw new Error(`Unexpected error: ${error.message}`);
                    } else {
                        throw new Error('Unknown error occurred');
                    }
                }
            }
        },
        {
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
            exampleInput: {
                client_id: '123456789-abcdefg.apps.googleusercontent.com',
                client_secret: 'GOCSPX-abcdefg123456',
                refresh_token: '1//abcdefg123456',
                max_results: 5,
                query: 'is:unread',
                include_body: true
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
            }
        },
        {
            name: 'create_draft',
            description: 'Create a draft email in Gmail',
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
                    to: {
                        type: 'string',
                        description: 'Email recipient(s). For multiple recipients, separate with commas.',
                    },
                    subject: {
                        type: 'string',
                        description: 'Email subject',
                    },
                    body: {
                        type: 'string',
                        description: 'Email body content',
                        format: 'textarea',
                    },
                    cc: {
                        type: 'string',
                        description: 'Carbon copy recipient(s). For multiple recipients, separate with commas.',
                    },
                    bcc: {
                        type: 'string',
                        description: 'Blind carbon copy recipient(s). For multiple recipients, separate with commas.',
                    },
                    is_html: {
                        type: 'boolean',
                        description: 'Whether the body is HTML',
                        default: false,
                    },
                },
                required: ['client_id', 'client_secret', 'refresh_token', 'to', 'subject', 'body'],
            },
            exampleInput: {
                client_id: '123456789-abcdefg.apps.googleusercontent.com',
                client_secret: 'GOCSPX-abcdefg123456',
                refresh_token: '1//abcdefg123456',
                to: 'recipient@example.com',
                subject: 'Draft email from MintFlow',
                body: 'This is a draft email created by MintFlow Gmail integration!',
                is_html: false,
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
                    
                    // Construct email payload
                    const emailLines = [];
                    
                    // Add headers
                    emailLines.push(`To: ${input.to}`);
                    if (input.cc) emailLines.push(`Cc: ${input.cc}`);
                    if (input.bcc) emailLines.push(`Bcc: ${input.bcc}`);
                    emailLines.push(`Subject: ${input.subject}`);
                    
                    // Add content type
                    if (input.is_html) {
                        emailLines.push('Content-Type: text/html; charset=UTF-8');
                    } else {
                        emailLines.push('Content-Type: text/plain; charset=UTF-8');
                    }
                    
                    // Add blank line between headers and body
                    emailLines.push('');
                    
                    // Add body
                    emailLines.push(input.body);
                    
                    // Create the raw message
                    const email = emailLines.join('\r\n');
                    const encodedEmail = Buffer.from(email).toString('base64')
                        .replace(/\+/g, '-')
                        .replace(/\//g, '_')
                        .replace(/=+$/, '');
                    
                    // Create draft
                    const response = await axios.post(
                        gmailCommons.getApiUrl('drafts'),
                        { 
                            message: {
                                raw: encodedEmail
                            }
                        },
                        {
                            headers: {
                                'Authorization': `Bearer ${authConfig.access_token}`,
                                'Content-Type': 'application/json',
                            },
                        }
                    );
                    
                    return response.data;
                } catch (error) {
                    if (axios.isAxiosError(error)) {
                        throw new Error(`Gmail API error: ${error.message}`);
                    } else if (error instanceof Error) {
                        throw new Error(`Unexpected error: ${error.message}`);
                    } else {
                        throw new Error('Unknown error occurred');
                    }
                }
            }
        },
        {
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
            exampleInput: {
                client_id: '123456789-abcdefg.apps.googleusercontent.com',
                client_secret: 'GOCSPX-abcdefg123456',
                refresh_token: '1//abcdefg123456',
                message_ids: ['msg123', 'msg456']
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
            }
        }
    ]
};

export default gmailPlugin;