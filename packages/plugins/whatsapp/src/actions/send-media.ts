import { createClient, WhatsAppCredentials, supportedMediaTypes, capitalizeFirstLetter } from '../common/index.js';

export interface SendMediaInput {
    accessToken: {
        accessToken: string;
        businessAccountId: string;
        phoneNumberId: string;
    };
    to: string;
    mediaType: string;
    mediaUrl: string;
    caption?: string;
    filename?: string;
}

export interface SendMediaOutput {
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

export const sendMediaAction = {
    name: 'send_media',
    displayName: 'Send Media',
    description: 'Send a media message (image, audio, document, sticker, or video) through WhatsApp',

    inputSchema: {
        type: 'object',
        required: ['accessToken', 'to', 'mediaType', 'mediaUrl'],
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
            mediaType: {
                type: 'string',
                title: 'Media Type',
                description: 'The type of media to send',
                enum: supportedMediaTypes,
                enumNames: supportedMediaTypes.map(capitalizeFirstLetter)
            },
            mediaUrl: {
                type: 'string',
                title: 'Media URL',
                description: 'The URL of the media to send'
            },
            caption: {
                type: 'string',
                title: 'Caption',
                description: 'A caption for the media (supported for image, video, and document)',
                optional: true
            },
            filename: {
                type: 'string',
                title: 'Filename',
                description: 'Filename of the document to send (only applicable for document type)',
                optional: true
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

    async execute(input: SendMediaInput, context: any): Promise<SendMediaOutput> {
        try {
            const { accessToken, to, mediaType, mediaUrl, caption, filename } = input;

            const credentials: WhatsAppCredentials = {
                accessToken: accessToken.accessToken,
                businessAccountId: accessToken.businessAccountId,
                phoneNumberId: accessToken.phoneNumberId
            };

            const client = createClient(credentials);

            const response = await client.sendMedia(to, mediaType, mediaUrl, caption, filename);
            return response;
        } catch (error) {
            console.error('Error sending WhatsApp media:', error);
            return {
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }
};
