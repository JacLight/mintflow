import { createClient, WhatsAppCredentials } from '../common/index.js';

export interface SendMessageInput {
    accessToken: {
        accessToken: string;
        businessAccountId: string;
        phoneNumberId: string;
    };
    to: string;
    text: string;
}

export interface SendMessageOutput {
    messaging_product?: string;
    contacts?: Array<{
        input: string;
        wa_id: string;
    }>;
    messages?: Array<{
        id: string;
    }>;
    error?: string;
}

export const sendMessageAction = {
    name: 'send_message',
    displayName: 'Send Message',
    description: 'Send a text message through WhatsApp',

    inputSchema: {
        type: 'object',
        required: ['accessToken', 'to', 'text'],
        properties: {
            accessToken: {
                type: 'object',
                title: 'WhatsApp Credentials',
                required: ['accessToken', 'businessAccountId', 'phoneNumberId'],
                properties: {
                    accessToken: {
                        type: 'string',
                        title: 'Access Token',
                        description: 'The system user access token of your WhatsApp business account',
                        secret: true
                    },
                    businessAccountId: {
                        type: 'string',
                        title: 'Business Account ID',
                        description: 'The business account ID of your WhatsApp business account'
                    },
                    phoneNumberId: {
                        type: 'string',
                        title: 'Phone Number ID',
                        description: 'The phone number ID that will be used to send the message'
                    }
                }
            },
            to: {
                type: 'string',
                title: 'To',
                description: 'The recipient phone number in international format (e.g., +1234567890)'
            },
            text: {
                type: 'string',
                title: 'Message',
                description: 'The text message to send'
            }
        }
    },

    outputSchema: {
        type: 'object',
        properties: {
            messaging_product: {
                type: 'string'
            },
            contacts: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        input: {
                            type: 'string'
                        },
                        wa_id: {
                            type: 'string'
                        }
                    }
                }
            },
            messages: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string'
                        }
                    }
                }
            },
            error: {
                type: 'string'
            }
        }
    },

    async execute(input: SendMessageInput, context: any): Promise<SendMessageOutput> {
        try {
            const { accessToken, to, text } = input;

            const credentials: WhatsAppCredentials = {
                accessToken: accessToken.accessToken,
                businessAccountId: accessToken.businessAccountId,
                phoneNumberId: accessToken.phoneNumberId
            };

            const client = createClient(credentials);

            const response = await client.sendMessage(to, text);
            return response;
        } catch (error) {
            console.error('Error sending WhatsApp message:', error);
            return {
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }
};
