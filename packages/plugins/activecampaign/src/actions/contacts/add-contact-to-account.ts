import { ActiveCampaignClient } from '../../common/client.js';

export const addContactToAccountAction = {
    name: 'add_contact_to_account',
    description: 'Associates a contact with an account in ActiveCampaign',
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
            accountId: {
                type: 'string',
                description: 'ID of the account',
            },
            jobTitle: {
                type: 'string',
                description: 'Job title of the contact at the account',
            },
        },
        required: ['apiUrl', 'apiKey', 'contactId', 'accountId'],
    },
    outputSchema: {
        type: 'object',
        properties: {
            accountContact: {
                type: 'object',
                description: 'The account contact association',
            },
        },
    },
    exampleInput: {
        apiUrl: 'https://your-account.api-us1.com',
        apiKey: 'your-api-key',
        contactId: '123',
        accountId: '456',
        jobTitle: 'Marketing Manager',
    },
    exampleOutput: {
        accountContact: {
            id: '789',
            contact: '123',
            account: '456',
            jobTitle: 'Marketing Manager',
            // ... other properties
        },
    },
    execute: async (input: any) => {
        const { apiUrl, apiKey, contactId, accountId, jobTitle } = input;

        const client = new ActiveCampaignClient(apiUrl, apiKey);

        try {
            const response = await client.createAccountContactAssociation(
                parseInt(contactId, 10),
                parseInt(accountId, 10),
                jobTitle
            );
            return response;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to add contact to account: ${error.message}`);
            }
            throw new Error('Failed to add contact to account: Unknown error');
        }
    },
};
