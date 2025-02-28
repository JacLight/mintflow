import { ActiveCampaignClient } from '../../common/client.js';

export const subscribeUnsubscribeContactAction = {
    name: 'subscribe_unsubscribe_contact',
    description: 'Subscribes or unsubscribes a contact from a list in ActiveCampaign',
    inputSchema: {
        type: 'object',
        properties: {
            apiUrl: {
                type: 'string',
                description: 'ActiveCampaign API URL',
            },
            apiKey: {
                type: 'string',
                description: 'ActiveCampaign API Key',
            },
            contactId: {
                type: 'string',
                description: 'ID of the contact',
            },
            listId: {
                type: 'string',
                description: 'ID of the list',
            },
            status: {
                type: 'string',
                description: 'Subscription status',
                enum: ['1', '2'],
                enumNames: ['Subscribed', 'Unsubscribed'],
            },
        },
        required: ['apiUrl', 'apiKey', 'contactId', 'listId', 'status'],
    },
    outputSchema: {
        type: 'object',
        properties: {
            contactList: {
                type: 'object',
                description: 'The contact list association',
            },
        },
    },
    exampleInput: {
        apiUrl: 'https://your-account.api-us1.com',
        apiKey: 'your-api-key',
        contactId: '123',
        listId: '456',
        status: '1', // 1 = Subscribed, 2 = Unsubscribed
    },
    exampleOutput: {
        contactList: {
            id: '789',
            contact: '123',
            list: '456',
            status: '1',
            // ... other properties
        },
    },
    execute: async (input: any) => {
        const { apiUrl, apiKey, contactId, listId, status } = input;

        const client = new ActiveCampaignClient(apiUrl, apiKey);

        try {
            const response = await client.addContactToList(listId, contactId, status);
            return response;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to update contact subscription: ${error.message}`);
            }
            throw new Error('Failed to update contact subscription: Unknown error');
        }
    },
};
