import { createClient, WhatsAppCredentials } from '../common/index.js';

export interface SendTemplateInput {
    accessToken: {
        accessToken: string;
        businessAccountId: string;
        phoneNumberId: string;
    };
    to: string;
    templateName: string;
    templateLanguage: string;
    headerParameters?: Record<string, string>;
    bodyParameters?: Record<string, string>;
    buttonParameters?: Record<string, string>;
}

export interface SendTemplateOutput {
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

export const sendTemplateAction = {
    name: 'send_template',
    displayName: 'Send Template Message',
    description: 'Send a template message through WhatsApp',

    inputSchema: {
        type: 'object',
        required: ['accessToken', 'to', 'templateName', 'templateLanguage'],
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
            templateName: {
                type: 'string',
                title: 'Template Name',
                description: 'The name of the template to use'
            },
            templateLanguage: {
                type: 'string',
                title: 'Template Language',
                description: 'The language code of the template (e.g., en_US, es_ES)'
            },
            headerParameters: {
                type: 'object',
                title: 'Header Parameters',
                description: 'Parameters for the header section of the template',
                optional: true,
                additionalProperties: {
                    type: 'string'
                }
            },
            bodyParameters: {
                type: 'object',
                title: 'Body Parameters',
                description: 'Parameters for the body section of the template',
                optional: true,
                additionalProperties: {
                    type: 'string'
                }
            },
            buttonParameters: {
                type: 'object',
                title: 'Button Parameters',
                description: 'Parameters for the button section of the template',
                optional: true,
                additionalProperties: {
                    type: 'string'
                }
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

    async execute(input: SendTemplateInput, context: any): Promise<SendTemplateOutput> {
        try {
            const {
                accessToken,
                to,
                templateName,
                templateLanguage,
                headerParameters,
                bodyParameters,
                buttonParameters
            } = input;

            const credentials: WhatsAppCredentials = {
                accessToken: accessToken.accessToken,
                businessAccountId: accessToken.businessAccountId,
                phoneNumberId: accessToken.phoneNumberId
            };

            const client = createClient(credentials);

            // Construct components array
            const components: any[] = [];

            // Add header parameters if provided
            if (headerParameters && Object.keys(headerParameters).length > 0) {
                const headerParams = Object.values(headerParameters).map(value => ({
                    type: 'text',
                    text: value
                }));

                if (headerParams.length > 0) {
                    components.push({
                        type: 'header',
                        parameters: headerParams
                    });
                }
            }

            // Add body parameters if provided
            if (bodyParameters && Object.keys(bodyParameters).length > 0) {
                const bodyParams = Object.values(bodyParameters).map(value => ({
                    type: 'text',
                    text: value
                }));

                if (bodyParams.length > 0) {
                    components.push({
                        type: 'body',
                        parameters: bodyParams
                    });
                }
            }

            // Add button parameters if provided
            if (buttonParameters && Object.keys(buttonParameters).length > 0) {
                const buttonParams = Object.values(buttonParameters).map(value => ({
                    type: 'text',
                    text: value
                }));

                if (buttonParams.length > 0) {
                    components.push({
                        type: 'button',
                        sub_type: 'url',
                        index: 0,
                        parameters: buttonParams
                    });
                }
            }

            const response = await client.sendTemplateMessage(
                to,
                templateName,
                templateLanguage,
                components
            );

            return response;
        } catch (error) {
            console.error('Error sending WhatsApp template message:', error);
            return {
                error: error instanceof Error ? error.message : 'Unknown error occurred'
            };
        }
    }
};
