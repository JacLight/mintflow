import { makeClient, ActiveCampaignAuth, CreateAccountRequest } from '../../common/index.js';

export const updateAccount = {
    name: "update_account",
    description: "Updates an existing account in ActiveCampaign",
    inputSchema: {
        type: "object",
        properties: {
            accountId: {
                type: "string",
                description: "ID of the account to update"
            },
            name: {
                type: "string",
                description: "Name of the account"
            },
            accountUrl: {
                type: "string",
                description: "URL of the account's website"
            },
            customFields: {
                type: "object",
                description: "Custom fields for the account (field ID as key, field value as value)"
            }
        },
        required: ["accountId"]
    },
    outputSchema: {
        type: "object",
        properties: {
            account: {
                type: "object",
                description: "The updated account"
            }
        }
    },
    exampleInput: {
        accountId: "123",
        name: "Acme Corporation Updated",
        accountUrl: "https://acme-updated.example.com",
        customFields: {
            "1": "Updated value for custom field 1"
        }
    },
    exampleOutput: {
        account: {
            id: "123",
            name: "Acme Corporation Updated",
            accountUrl: "https://acme-updated.example.com"
        }
    },
    execute: async (input: any, auth: ActiveCampaignAuth) => {
        try {
            const { accountId, name, accountUrl, customFields = {} } = input.data || {};

            if (!accountId) {
                return { error: "Account ID is required" };
            }

            const updateAccountParams: Partial<CreateAccountRequest> = {
                fields: []
            };

            // Only include fields that are provided
            if (name !== undefined) updateAccountParams.name = name;
            if (accountUrl !== undefined) updateAccountParams.accountUrl = accountUrl;

            // Add custom fields
            Object.entries(customFields).forEach(([key, value]) => {
                updateAccountParams.fields!.push({
                    customFieldId: Number(key),
                    fieldValue: value
                });
            });

            const client = makeClient(auth);
            const result = await client.updateAccount(Number(accountId), updateAccountParams);
            return result;
        } catch (error: any) {
            return {
                error: `Error updating account: ${error.message || 'Unknown error'}`
            };
        }
    }
};
