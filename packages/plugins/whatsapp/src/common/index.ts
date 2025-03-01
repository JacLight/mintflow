import axios, { AxiosInstance } from 'axios';

export interface WhatsAppCredentials {
    accessToken: string;
    businessAccountId: string;
    phoneNumberId: string;
}

export interface WhatsAppClient {
    sendMessage: (to: string, text: string) => Promise<any>;
    sendMedia: (to: string, mediaType: string, mediaUrl: string, caption?: string, filename?: string) => Promise<any>;
    sendTemplateMessage: (to: string, templateName: string, templateLanguage: string, components: any[]) => Promise<any>;
    getPhoneNumbers: () => Promise<any>;
    getMessageTemplates: () => Promise<any>;
    getMessageTemplate: (templateId: string) => Promise<any>;
}

export const supportedMediaTypes = ['image', 'audio', 'document', 'sticker', 'video'];
export const capitalizeFirstLetter = (word: string) => word.charAt(0).toUpperCase() + word.slice(1);
export const mediaTypeSupportsCaption = (type: string) => ['image', 'video', 'document'].includes(type);

export function createClient(credentials: WhatsAppCredentials): WhatsAppClient {
    const { accessToken, phoneNumberId } = credentials;

    const axiosInstance: AxiosInstance = axios.create({
        baseURL: 'https://graph.facebook.com/v20.0',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    });

    return {
        sendMessage: async (to: string, text: string) => {
            const response = await axiosInstance.post(`/${phoneNumberId}/messages`, {
                messaging_product: 'whatsapp',
                recipient_type: 'individual',
                to,
                type: 'text',
                text: {
                    body: text
                }
            });
            return response.data;
        },

        sendMedia: async (to: string, mediaType: string, mediaUrl: string, caption?: string, filename?: string) => {
            const body: any = {
                messaging_product: 'whatsapp',
                recipient_type: 'individual',
                to,
                type: mediaType,
                [mediaType]: {
                    link: mediaUrl
                }
            };

            if (caption && mediaTypeSupportsCaption(mediaType)) {
                body[mediaType].caption = caption;
            }

            if (filename && mediaType === 'document') {
                body[mediaType].filename = filename;
            }

            const response = await axiosInstance.post(`/${phoneNumberId}/messages`, body);
            return response.data;
        },

        sendTemplateMessage: async (to: string, templateName: string, templateLanguage: string, components: any[]) => {
            const response = await axiosInstance.post(`/${phoneNumberId}/messages`, {
                messaging_product: 'whatsapp',
                recipient_type: 'individual',
                to,
                type: 'template',
                template: {
                    name: templateName,
                    language: {
                        code: templateLanguage
                    },
                    components
                }
            });
            return response.data;
        },

        getPhoneNumbers: async () => {
            const response = await axiosInstance.get(`/${credentials.businessAccountId}/phone_numbers`, {
                params: {
                    fields: 'verified_name,id,display_phone_number'
                }
            });
            return response.data;
        },

        getMessageTemplates: async () => {
            const response = await axiosInstance.get(`/${credentials.businessAccountId}/message_templates`, {
                params: {
                    fields: 'id,name,language'
                }
            });
            return response.data;
        },

        getMessageTemplate: async (templateId: string) => {
            const response = await axiosInstance.get(`/${templateId}`, {
                params: {
                    fields: 'id,name,language,components'
                }
            });
            return response.data;
        }
    };
}
