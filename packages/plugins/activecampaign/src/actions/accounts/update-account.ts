import { ActiveCampaignClient } from '../../common/client.js';
import { CreateAccountRequest } from '../../common/types.js';

export const updateAccountAction = {
    name: 'update_account',
    description: 'Updates an existing account in ActiveCampaign',
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
            accountId: {
                type: 'string',
                description: 'ID of the account to update',
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
        required: ['apiUrl', 'apiKey', 'accountId'],
    },
    outputSchema: {
        type: 'object',
        properties: {
            account: {
                type: 'object',
                description: 'The updated account',
            },
        },
    },
    exampleInput: {
        apiUrl: 'https://your-account.api-us1.com',
        apiKey: 'your-api-key',
        accountId: '123',
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
        const { apiUrl, apiKey, accountId, name, accountUrl, customFields } = input;

        const client = new ActiveCampaignClient(apiUrl, apiKey);

        const updateAccountParams: Partial<CreateAccountRequest> = {
            fields: [],
        };

        // Only add fields that are provided
        if (name !== undefined) updateAccountParams.name = name;
        if (accountUrl !== undefined) updateAccountParams.accountUrl = accountUrl;

        // Add custom fields if provided
        if (customFields && typeof customFields === 'object') {
            Object.entries(customFields).forEach(([key, value]) => {
                updateAccountParams.fields!.push({
                    customFieldId: parseInt(key, 10),
                    fieldValue: value
                });
            });
        }

        try {
            const response = await client.updateAccount(parseInt(accountId, 10), updateAccountParams);
            return response;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to update account: ${error.message}`);
            }
            throw new Error('Failed to update account: Unknown error');
        }
    },
};
