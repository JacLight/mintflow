import { IntercomClient } from './client.js';
import {
    IntercomAuth,
    IntercomAdmin,
    IntercomContact,
    IntercomUser,
    IntercomLead,
    IntercomCompany,
    IntercomTag,
    IntercomConversation,
    IntercomArticle,
    IntercomTicket,
    IntercomMessage,
    IntercomWebhookPayload
} from './models.js';
import crypto from 'crypto';

// Create a default client instance with empty auth
const defaultClient = new IntercomClient({
    accessToken: '',
    region: 'intercom'
});

const intercomPlugin = {
    name: "Intercom",
    icon: "",
    description: "Customer messaging platform for sales, marketing, and support",
    groups: ["crm"],
    tags: ["crm","marketing","customer","lead","sales"],
    version: '1.0.0',
    id: "intercom",
    runner: "node",
    inputSchema: {
        type: "object",
        properties: {
            action: {
                type: 'string',
                enum: [
                    // Contact actions
                    'list_contacts',
                    'find_contact',
                    'search_contacts',
                    'create_user',
                    'update_user',
                    'create_or_update_user',
                    'create_or_update_lead',
                    'add_note_to_user',
                    'add_tag_to_contact',
                    'remove_tag_from_contact',

                    // Company actions
                    'list_companies',
                    'find_company',
                    'search_companies',
                    'add_tag_to_company',
                    'remove_tag_from_company',

                    // Conversation actions
                    'list_conversations',
                    'get_conversation',
                    'search_conversations',
                    'create_conversation',
                    'reply_to_conversation',
                    'add_note_to_conversation',
                    'add_tag_to_conversation',
                    'remove_tag_from_conversation',

                    // Message actions
                    'send_message',

                    // Article actions
                    'create_article',

                    // Ticket actions
                    'create_ticket',
                    'update_ticket',

                    // Tag actions
                    'list_tags',

                    // Admin actions
                    'list_admins',
                    'get_admin',

                    // Webhook actions
                    'process_webhook'
                ],
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Action to perform on Intercom',
            },
            accessToken: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Your Intercom access token',
            },
            region: {
                type: 'string',
                enum: ['intercom', 'eu.intercom', 'au.intercom'],
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Your Intercom region',
                defaultValue: 'intercom'
            },

            // Contact parameters
            contactId: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Contact ID',
                rules: [
                    { operation: 'notEqual', valueA: 'find_contact', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'update_user', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'add_note_to_user', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'add_tag_to_contact', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'remove_tag_from_contact', valueB: '{{action}}', action: 'hide' },
                ],
            },
            contactData: {
                type: 'object',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Contact data',
                rules: [
                    { operation: 'notEqual', valueA: 'create_user', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'update_user', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'create_or_update_user', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'create_or_update_lead', valueB: '{{action}}', action: 'hide' },
                ],
            },
            searchQuery: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Search query',
                rules: [
                    { operation: 'notEqual', valueA: 'search_contacts', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'search_companies', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'search_conversations', valueB: '{{action}}', action: 'hide' },
                ],
            },
            noteBody: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Note body',
                rules: [
                    { operation: 'notEqual', valueA: 'add_note_to_user', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'add_note_to_conversation', valueB: '{{action}}', action: 'hide' },
                ],
            },

            // Company parameters
            companyId: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Company ID',
                rules: [
                    { operation: 'notEqual', valueA: 'find_company', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'add_tag_to_company', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'remove_tag_from_company', valueB: '{{action}}', action: 'hide' },
                ],
            },

            // Conversation parameters
            conversationId: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Conversation ID',
                rules: [
                    { operation: 'notEqual', valueA: 'get_conversation', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'reply_to_conversation', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'add_note_to_conversation', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'add_tag_to_conversation', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'remove_tag_from_conversation', valueB: '{{action}}', action: 'hide' },
                ],
            },
            conversationData: {
                type: 'object',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Conversation data',
                rules: [
                    { operation: 'notEqual', valueA: 'create_conversation', valueB: '{{action}}', action: 'hide' },
                ],
            },
            replyData: {
                type: 'object',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Reply data',
                rules: [
                    { operation: 'notEqual', valueA: 'reply_to_conversation', valueB: '{{action}}', action: 'hide' },
                ],
            },

            // Message parameters
            messageData: {
                type: 'object',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Message data',
                rules: [
                    { operation: 'notEqual', valueA: 'send_message', valueB: '{{action}}', action: 'hide' },
                ],
            },

            // Article parameters
            articleData: {
                type: 'object',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Article data',
                rules: [
                    { operation: 'notEqual', valueA: 'create_article', valueB: '{{action}}', action: 'hide' },
                ],
            },

            // Ticket parameters
            ticketData: {
                type: 'object',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Ticket data',
                rules: [
                    { operation: 'notEqual', valueA: 'create_ticket', valueB: '{{action}}', action: 'hide' },
                ],
            },
            ticketId: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Ticket ID',
                rules: [
                    { operation: 'notEqual', valueA: 'update_ticket', valueB: '{{action}}', action: 'hide' },
                ],
            },
            ticketUpdateData: {
                type: 'object',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Ticket update data',
                rules: [
                    { operation: 'notEqual', valueA: 'update_ticket', valueB: '{{action}}', action: 'hide' },
                ],
            },

            // Tag parameters
            tagId: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Tag ID',
                rules: [
                    { operation: 'notEqual', valueA: 'add_tag_to_contact', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'remove_tag_from_contact', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'add_tag_to_company', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'remove_tag_from_company', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'add_tag_to_conversation', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'remove_tag_from_conversation', valueB: '{{action}}', action: 'hide' },
                ],
            },

            // Admin parameters
            adminId: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Admin ID',
                rules: [
                    { operation: 'notEqual', valueA: 'get_admin', valueB: '{{action}}', action: 'hide' },
                ],
            },

            // Webhook parameters
            webhookPayload: {
                type: 'object',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Webhook payload',
                rules: [
                    { operation: 'notEqual', valueA: 'process_webhook', valueB: '{{action}}', action: 'hide' },
                ],
            },
            webhookSecret: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Webhook secret',
                rules: [
                    { operation: 'notEqual', valueA: 'process_webhook', valueB: '{{action}}', action: 'hide' },
                ],
            },
        },
        required: ['action', 'accessToken', 'region'],
    },
    outputSchema: {
        type: "object",
    },
    exampleInput: {
        action: 'list_contacts',
        accessToken: 'your-access-token',
        region: 'intercom'
    },
    exampleOutput: {
        "data": [
            {
                "id": "5f7f3c5d7a4e5e3a2b1c9d8e",
                "type": "contact",
                "role": "user",
                "name": "John Doe",
                "email": "john.doe@example.com"
            }
        ]
    },
    documentation: "https://developers.intercom.com/intercom-api-reference/reference",
    method: "exec",
    actions: [
        {
            name: 'intercom',
            execute: async (input: any, context?: any): Promise<any> => {
                const { action, accessToken, region } = input;

                if (!action || !accessToken || !region) {
                    throw new Error('Missing required parameters: action, accessToken, region');
                }

                // Create a client instance, using the context's axios instance if provided
                const auth: IntercomAuth = {
                    accessToken,
                    region
                };

                const client = context?.axiosInstance ?
                    new IntercomClient(auth, context.axiosInstance) :
                    new IntercomClient(auth);

                switch (action) {
                    // Contact actions
                    case 'list_contacts': {
                        return await client.listContacts();
                    }

                    case 'find_contact': {
                        const { contactId } = input;
                        if (!contactId) {
                            throw new Error('Missing required parameter: contactId');
                        }
                        return await client.findContact(contactId);
                    }

                    case 'search_contacts': {
                        const { searchQuery } = input;
                        if (!searchQuery) {
                            throw new Error('Missing required parameter: searchQuery');
                        }
                        return await client.searchContacts(searchQuery);
                    }

                    case 'create_user': {
                        const { contactData } = input;
                        if (!contactData) {
                            throw new Error('Missing required parameter: contactData');
                        }
                        return await client.createUser(contactData);
                    }

                    case 'update_user': {
                        const { contactId, contactData } = input;
                        if (!contactId || !contactData) {
                            throw new Error('Missing required parameters: contactId, contactData');
                        }
                        return await client.updateUser(contactId, contactData);
                    }

                    case 'create_or_update_user': {
                        const { contactData } = input;
                        if (!contactData) {
                            throw new Error('Missing required parameter: contactData');
                        }
                        return await client.createOrUpdateUser(contactData);
                    }

                    case 'create_or_update_lead': {
                        const { contactData } = input;
                        if (!contactData) {
                            throw new Error('Missing required parameter: contactData');
                        }
                        return await client.createOrUpdateLead(contactData);
                    }

                    case 'add_note_to_user': {
                        const { contactId, noteBody } = input;
                        if (!contactId || !noteBody) {
                            throw new Error('Missing required parameters: contactId, noteBody');
                        }
                        return await client.addNoteToUser(contactId, noteBody);
                    }

                    case 'add_tag_to_contact': {
                        const { contactId, tagId } = input;
                        if (!contactId || !tagId) {
                            throw new Error('Missing required parameters: contactId, tagId');
                        }
                        return await client.addTagToContact(contactId, tagId);
                    }

                    case 'remove_tag_from_contact': {
                        const { contactId, tagId } = input;
                        if (!contactId || !tagId) {
                            throw new Error('Missing required parameters: contactId, tagId');
                        }
                        return await client.removeTagFromContact(contactId, tagId);
                    }

                    // Company actions
                    case 'list_companies': {
                        return await client.listCompanies();
                    }

                    case 'find_company': {
                        const { companyId } = input;
                        if (!companyId) {
                            throw new Error('Missing required parameter: companyId');
                        }
                        return await client.findCompany(companyId);
                    }

                    case 'search_companies': {
                        const { searchQuery } = input;
                        if (!searchQuery) {
                            throw new Error('Missing required parameter: searchQuery');
                        }
                        return await client.searchCompanies(searchQuery);
                    }

                    case 'add_tag_to_company': {
                        const { companyId, tagId } = input;
                        if (!companyId || !tagId) {
                            throw new Error('Missing required parameters: companyId, tagId');
                        }
                        return await client.addTagToCompany(companyId, tagId);
                    }

                    case 'remove_tag_from_company': {
                        const { companyId, tagId } = input;
                        if (!companyId || !tagId) {
                            throw new Error('Missing required parameters: companyId, tagId');
                        }
                        return await client.removeTagFromCompany(companyId, tagId);
                    }

                    // Conversation actions
                    case 'list_conversations': {
                        return await client.listConversations();
                    }

                    case 'get_conversation': {
                        const { conversationId } = input;
                        if (!conversationId) {
                            throw new Error('Missing required parameter: conversationId');
                        }
                        return await client.getConversation(conversationId);
                    }

                    case 'search_conversations': {
                        const { searchQuery } = input;
                        if (!searchQuery) {
                            throw new Error('Missing required parameter: searchQuery');
                        }
                        return await client.searchConversations(searchQuery);
                    }

                    case 'create_conversation': {
                        const { conversationData } = input;
                        if (!conversationData) {
                            throw new Error('Missing required parameter: conversationData');
                        }
                        return await client.createConversation(conversationData);
                    }

                    case 'reply_to_conversation': {
                        const { conversationId, replyData } = input;
                        if (!conversationId || !replyData) {
                            throw new Error('Missing required parameters: conversationId, replyData');
                        }
                        return await client.replyToConversation(conversationId, replyData);
                    }

                    case 'add_note_to_conversation': {
                        const { conversationId, noteBody } = input;
                        if (!conversationId || !noteBody) {
                            throw new Error('Missing required parameters: conversationId, noteBody');
                        }
                        return await client.addNoteToConversation(conversationId, noteBody);
                    }

                    case 'add_tag_to_conversation': {
                        const { conversationId, tagId } = input;
                        if (!conversationId || !tagId) {
                            throw new Error('Missing required parameters: conversationId, tagId');
                        }
                        return await client.addTagToConversation(conversationId, tagId);
                    }

                    case 'remove_tag_from_conversation': {
                        const { conversationId, tagId } = input;
                        if (!conversationId || !tagId) {
                            throw new Error('Missing required parameters: conversationId, tagId');
                        }
                        return await client.removeTagFromConversation(conversationId, tagId);
                    }

                    // Message actions
                    case 'send_message': {
                        const { messageData } = input;
                        if (!messageData) {
                            throw new Error('Missing required parameter: messageData');
                        }
                        return await client.sendMessage(messageData);
                    }

                    // Article actions
                    case 'create_article': {
                        const { articleData } = input;
                        if (!articleData) {
                            throw new Error('Missing required parameter: articleData');
                        }
                        return await client.createArticle(articleData);
                    }

                    // Ticket actions
                    case 'create_ticket': {
                        const { ticketData } = input;
                        if (!ticketData) {
                            throw new Error('Missing required parameter: ticketData');
                        }
                        return await client.createTicket(ticketData);
                    }

                    case 'update_ticket': {
                        const { ticketId, ticketUpdateData } = input;
                        if (!ticketId || !ticketUpdateData) {
                            throw new Error('Missing required parameters: ticketId, ticketUpdateData');
                        }
                        return await client.updateTicket(ticketId, ticketUpdateData);
                    }

                    // Tag actions
                    case 'list_tags': {
                        return await client.listTags();
                    }

                    // Admin actions
                    case 'list_admins': {
                        return await client.listAdmins();
                    }

                    case 'get_admin': {
                        const { adminId } = input;
                        if (!adminId) {
                            throw new Error('Missing required parameter: adminId');
                        }
                        return await client.getAdmin(adminId);
                    }

                    // Webhook actions
                    case 'process_webhook': {
                        const { webhookPayload, webhookSecret } = input;
                        if (!webhookPayload) {
                            throw new Error('Missing required parameter: webhookPayload');
                        }

                        // Verify webhook signature if secret is provided
                        if (webhookSecret && webhookPayload.headers && webhookPayload.headers['x-hub-signature'] && webhookPayload.rawBody) {
                            const signature = webhookPayload.headers['x-hub-signature'];
                            const hmac = crypto.createHmac('sha1', webhookSecret);
                            hmac.update(webhookPayload.rawBody);
                            const computedSignature = `sha1=${hmac.digest('hex')}`;

                            if (signature !== computedSignature) {
                                throw new Error('Invalid webhook signature');
                            }
                        }

                        // Process the webhook payload
                        const payload = webhookPayload.body as IntercomWebhookPayload;

                        return {
                            event: payload.topic,
                            data: payload.data
                        };
                    }

                    default:
                        throw new Error(`Unsupported action: ${action}`);
                }
            }
        }
    ]
};

export { IntercomClient };
export default intercomPlugin;
