import { createClient } from '../common/index.js';
import { SendgridEmailAddress, SendgridMailData } from '../common/types.js';

export const sendEmailAction = {
    name: 'send_email',
    description: 'Send a text or HTML email',
    inputSchema: {
        type: 'object',
        properties: {
            apiKey: {
                type: 'string',
                description: 'SendGrid API Key',
            },
            to: {
                type: 'array',
                description: 'Email addresses of the recipients',
                items: {
                    type: 'string',
                },
            },
            cc: {
                type: 'array',
                description: 'Email addresses for CC',
                items: {
                    type: 'string',
                },
            },
            bcc: {
                type: 'array',
                description: 'Email addresses for BCC',
                items: {
                    type: 'string',
                },
            },
            from: {
                type: 'string',
                description: 'Sender email address',
            },
            fromName: {
                type: 'string',
                description: 'Sender name',
            },
            replyTo: {
                type: 'string',
                description: 'Reply-to email address',
            },
            subject: {
                type: 'string',
                description: 'Email subject',
            },
            contentType: {
                type: 'string',
                description: 'Content type (text or html)',
                enum: ['text', 'html'],
            },
            content: {
                type: 'string',
                description: 'Email content',
            },
        },
        required: ['apiKey', 'to', 'from', 'subject', 'contentType', 'content'],
    },
    outputSchema: {
        type: 'object',
        properties: {
            success: {
                type: 'boolean',
                description: 'Whether the email was sent successfully',
            },
            message: {
                type: 'string',
                description: 'Error message if the email failed to send',
            },
            errors: {
                type: 'array',
                description: 'List of errors if the email failed to send',
                items: {
                    type: 'object',
                },
            },
        },
    },
    exampleInput: {
        apiKey: 'SG.your-api-key',
        to: ['recipient@example.com'],
        from: 'sender@example.com',
        fromName: 'Sender Name',
        subject: 'Hello from SendGrid',
        contentType: 'html',
        content: '<p>This is a test email from SendGrid</p>',
    },
    exampleOutput: {
        success: true,
    },
    execute: async (input: any) => {
        const {
            apiKey,
            to,
            cc,
            bcc,
            from,
            fromName,
            replyTo,
            subject,
            contentType,
            content,
        } = input;

        const client = createClient(apiKey);

        // Prepare email addresses
        const toAddresses: SendgridEmailAddress[] = to.map((email: string) => ({
            email: email.trim(),
        }));

        const ccAddresses: SendgridEmailAddress[] | undefined = cc
            ? cc.map((email: string) => ({ email: email.trim() }))
            : undefined;

        const bccAddresses: SendgridEmailAddress[] | undefined = bcc
            ? bcc.map((email: string) => ({ email: email.trim() }))
            : undefined;

        // Prepare mail data
        const mailData: SendgridMailData = {
            personalizations: [
                {
                    to: toAddresses,
                    cc: ccAddresses,
                    bcc: bccAddresses,
                },
            ],
            from: {
                email: from,
                name: fromName,
            },
            reply_to: replyTo
                ? {
                    email: replyTo,
                }
                : undefined,
            subject,
            content: [
                {
                    type: contentType === 'text' ? 'text/plain' : 'text/html',
                    value: content,
                },
            ],
        };

        try {
            const result = await client.sendMail(mailData);
            return result;
        } catch (error) {
            if (error instanceof Error) {
                return {
                    success: false,
                    message: `Failed to send email: ${error.message}`,
                };
            }
            return {
                success: false,
                message: 'Failed to send email: Unknown error',
            };
        }
    },
};
