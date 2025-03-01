import { ActiveCampaignClient } from '../../common/client.js';
import { CreateAccountRequest } from '../../common/types.js';

export const createAccountAction = {
    name: 'create_account',
    description: 'Creates a new account in ActiveCampaign',
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
            name: {
                type: 'string',
                description: 'Name of the account',
            },
            accountUrl: {
                type: 'string',
                description: 'URL of the account',
            },
            customFields: {
                type: 'object',
                description: 'Custom fields for the account',
                additionalProperties: true,
            },
        },
        required: ['apiUrl', 'apiKey', 'name'],
    },
    outputSchema: {
        type: 'object',
        properties: {
            account: {
                type: 'object',
                description: 'The created account',
            },
        },
    },
    exampleInput: {
        apiUrl: 'https://your-account.api-us1.com',
        apiKey: 'your-api-key',
        name: 'Acme Corporation',
        accountUrl: 'https://acme.com',
        customFields: {
            // Custom field ID: value
            '1': 'Value for custom field 1',
        },
    },
    exampleOutput: {
        account: {
            id: '123',
            name: 'Acme Corporation',
            // ... other account properties
        },
    },
    execute: async (input: any) => {
        const { apiUrl, apiKey, name, accountUrl, customFields } = input;

        const client = new ActiveCampaignClient(apiUrl, apiKey);

        const createAccountParams: CreateAccountRequest = {
            name,
            accountUrl,
            fields: [],
        };

        // Add custom fields if provided
        if (customFields && typeof customFields === 'object') {
            Object.entries(customFields).forEach(([key, value]) => {
                createAccountParams.fields!.push({
                    customFieldId: parseInt(key, 10),
                    fieldValue: value
                });
            });
        }

        try {
            const response = await client.createAccount(createAccountParams);
            return response;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to create account: ${error.message}`);
            }
            throw new Error('Failed to create account: Unknown error');
        }
    },
};
