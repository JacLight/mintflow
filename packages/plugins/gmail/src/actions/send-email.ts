import axios from 'axios';
import { gmailCommons, OAuthConfig } from '../common.js';

export const sendEmail = {
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
    outputSchema: {
        type: 'object',
        properties: {
            id: { type: 'string' },
            threadId: { type: 'string' },
            labelIds: { type: 'array', items: { type: 'string' } },
        },
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
    exampleOutput: {
        id: '12345abcdef',
        threadId: '12345abcdef',
        labelIds: ['SENT']
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
            const email = emailLines.join('\\r\\n');
            const encodedEmail = Buffer.from(email).toString('base64')
                .replace(/\\+/g, '-')
                .replace(/\\//g, '_')
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
    },
};

export default sendEmail;