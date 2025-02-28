import { makeClient, ActiveCampaignAuth } from '../../common/index.js';

export const addContactToAccount = {
    name: "add_contact_to_account",
    description: "Associates a contact with an account in ActiveCampaign",
    inputSchema: {
        type: "object",
        properties: {
            contactId: {
                type: "string",
                description: "ID of the contact"
            },
            accountId: {
                type: "string",
                description: "ID of the account"
            },
            jobTitle: {
                type: "string",
                description: "Job title of the contact at the account (optional)"
            }
        },
        required: ["contactId", "accountId"]
    },
    outputSchema: {
        type: "object",
        properties: {
            accountContact: {
                type: "object",
                description: "The created account-contact association"
            }
        }
    },
    exampleInput: {
        contactId: "123",
        accountId: "456",
        jobTitle: "Marketing Manager"
    },
    exampleOutput: {
        accountContact: {
            id: "789",
            contact: "123",
            account: "456",
            jobTitle: "Marketing Manager"
        }
    },
    execute: async (input: any, auth: ActiveCampaignAuth) => {
        try {
            const { contactId, accountId, jobTitle } = input.data || {};

            if (!contactId) {
                return { error: "Contact ID is required" };
            }

            if (!accountId) {
                return { error: "Account ID is required" };
            }

            const client = makeClient(auth);
            const result = await client.createAccountContactAssociation(
                Number(contactId),
                Number(accountId),
                jobTitle
            );
            return result;
        } catch (error: any) {
            return {
                error: `Error adding contact to account: ${error.message || 'Unknown error'}`
            };
        }
    }
};
