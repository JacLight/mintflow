import { makeClient, ActiveCampaignAuth, CreateAccountRequest } from '../../common/index.js';

export const createAccount = {
    name: "create_account",
    description: "Creates a new account in ActiveCampaign",
    inputSchema: {
        type: "object",
        properties: {
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
        required: ["name"]
    },
    outputSchema: {
        type: "object",
        properties: {
            account: {
                type: "object",
                description: "The created account"
            }
        }
    },
    exampleInput: {
        name: "Acme Corporation",
        accountUrl: "https://acme.example.com",
        customFields: {
            "1": "Value for custom field 1"
        }
    },
    exampleOutput: {
        account: {
            id: "123",
            name: "Acme Corporation",
            accountUrl: "https://acme.example.com"
        }
    },
    execute: async (input: any, auth: ActiveCampaignAuth) => {
        try {
            const { name, accountUrl, customFields = {} } = input.data || {};

            if (!name) {
                return { error: "Account name is required" };
            }

            const createAccountParams: CreateAccountRequest = {
                name,
                accountUrl,
                fields: []
            };

            // Add custom fields
            Object.entries(customFields).forEach(([key, value]) => {
                createAccountParams.fields!.push({
                    customFieldId: Number(key),
                    fieldValue: value
                });
            });

            const client = makeClient(auth);
            const result = await client.createAccount(createAccountParams);
            return result;
        } catch (error: any) {
            return {
                error: `Error creating account: ${error.message || 'Unknown error'}`
            };
        }
    }
};
