import { ActiveCampaignClient } from '../../common/client.js';

export const addTagToContactAction = {
    name: 'add_tag_to_contact',
    description: 'Adds a tag to a contact in ActiveCampaign',
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
            tagId: {
                type: 'string',
                description: 'ID of the tag to add',
            },
        },
        required: ['apiUrl', 'apiKey', 'contactId', 'tagId'],
    },
    outputSchema: {
        type: 'object',
        properties: {
            contactTag: {
                type: 'object',
                description: 'The contact tag association',
            },
        },
    },
    exampleInput: {
        apiUrl: 'https://your-account.api-us1.com',
        apiKey: 'your-api-key',
        contactId: '123',
        tagId: '456',
    },
    exampleOutput: {
        contactTag: {
            id: '789',
            contact: '123',
            tag: '456',
            // ... other properties
        },
    },
    execute: async (input: any) => {
        const { apiUrl, apiKey, contactId, tagId } = input;

        const client = new ActiveCampaignClient(apiUrl, apiKey);

        try {
            const response = await client.addTagToContact(contactId, tagId);
            return response;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to add tag to contact: ${error.message}`);
            }
            throw new Error('Failed to add tag to contact: Unknown error');
        }
    },
};
