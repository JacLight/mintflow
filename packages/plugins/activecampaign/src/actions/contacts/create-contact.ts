import { makeClient, ActiveCampaignAuth, CreateContactRequest } from '../../common/index.js';

export const createContact = {
    name: "create_contact",
    description: "Creates a new contact in ActiveCampaign",
    inputSchema: {
        type: "object",
        properties: {
            email: {
                type: "string",
                description: "Email address of the contact"
            },
            firstName: {
                type: "string",
                description: "First name of the contact"
            },
            lastName: {
                type: "string",
                description: "Last name of the contact"
            },
            phone: {
                type: "string",
                description: "Phone number of the contact"
            },
            customFields: {
                type: "object",
                description: "Custom fields for the contact (field ID as key, field value as value)"
            }
        },
        required: ["email"]
    },
    outputSchema: {
        type: "object",
        properties: {
            contact: {
                type: "object",
                description: "The created contact"
            }
        }
    },
    exampleInput: {
        email: "john.doe@example.com",
        firstName: "John",
        lastName: "Doe",
        phone: "123-456-7890",
        customFields: {
            "1": "Value for custom field 1"
        }
    },
    exampleOutput: {
        contact: {
            id: "123",
            email: "john.doe@example.com",
            firstName: "John",
            lastName: "Doe"
        }
    },
    execute: async (input: any, auth: ActiveCampaignAuth) => {
        try {
            const { email, firstName, lastName, phone, customFields = {} } = input.data || {};

            if (!email) {
                return { error: "Email is required" };
            }

            const createContactParams: CreateContactRequest = {
                email,
                firstName,
                lastName,
                phone,
                fieldValues: []
            };

            // Add custom fields
            Object.entries(customFields).forEach(([key, value]) => {
                createContactParams.fieldValues.push({ field: key, value });
            });

            const client = makeClient(auth);
            const result = await client.createContact(createContactParams);
            return result;
        } catch (error: any) {
            return {
                error: `Error creating contact: ${error.message || 'Unknown error'}`
            };
        }
    }
};
