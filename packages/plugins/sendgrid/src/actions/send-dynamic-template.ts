import { createClient } from '../common/index.js';
import { SendgridEmailAddress, SendgridMailData } from '../common/types.js';

export const sendDynamicTemplateAction = {
    name: 'send_dynamic_template',
    description: 'Send an email using a dynamic template',
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
            templateId: {
                type: 'string',
                description: 'SendGrid dynamic template ID',
            },
            templateData: {
                type: 'object',
                description: 'Dynamic template data',
                additionalProperties: true,
            },
        },
        required: ['apiKey', 'to', 'from', 'templateId', 'templateData'],
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
        templateId: 'd-f3ecfbd9a7dd46a39f70d0a42a9a649a',
        templateData: {
            name: 'John Doe',
            company: 'Acme Inc.',
            verificationLink: 'https://example.com/verify',
        },
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
            templateId,
            templateData,
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
                    dynamic_template_data: templateData,
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
            template_id: templateId,
        };

        try {
            const result = await client.sendMail(mailData);
            return result;
        } catch (error) {
            if (error instanceof Error) {
                return {
                    success: false,
                    message: `Failed to send template email: ${error.message}`,
                };
            }
            return {
                success: false,
                message: 'Failed to send template email: Unknown error',
            };
        }
    },
};
