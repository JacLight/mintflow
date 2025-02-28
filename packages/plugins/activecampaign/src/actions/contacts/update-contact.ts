import { makeClient, ActiveCampaignAuth, CreateContactRequest } from '../../common/index.js';

export const updateContact = {
    name: "update_contact",
    description: "Updates an existing contact in ActiveCampaign",
    inputSchema: {
        type: "object",
        properties: {
            contactId: {
                type: "string",
                description: "ID of the contact to update"
            },
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
        required: ["contactId"]
    },
    outputSchema: {
        type: "object",
        properties: {
            contact: {
                type: "object",
                description: "The updated contact"
            }
        }
    },
    exampleInput: {
        contactId: "123",
        email: "john.doe@example.com",
        firstName: "John",
        lastName: "Smith",
        phone: "123-456-7890",
        customFields: {
            "1": "Updated value for custom field 1"
        }
    },
    exampleOutput: {
        contact: {
            id: "123",
            email: "john.doe@example.com",
            firstName: "John",
            lastName: "Smith"
        }
    },
    execute: async (input: any, auth: ActiveCampaignAuth) => {
        try {
            const { contactId, email, firstName, lastName, phone, customFields = {} } = input.data || {};

            if (!contactId) {
                return { error: "Contact ID is required" };
            }

            const updateContactParams: Partial<CreateContactRequest> = {
                fieldValues: []
            };

            // Only include fields that are provided
            if (email !== undefined) updateContactParams.email = email;
            if (firstName !== undefined) updateContactParams.firstName = firstName;
            if (lastName !== undefined) updateContactParams.lastName = lastName;
            if (phone !== undefined) updateContactParams.phone = phone;

            // Add custom fields
            Object.entries(customFields).forEach(([key, value]) => {
                updateContactParams.fieldValues!.push({ field: key, value });
            });

            const client = makeClient(auth);
            const result = await client.updateContact(Number(contactId), updateContactParams);
            return result;
        } catch (error: any) {
            return {
                error: `Error updating contact: ${error.message || 'Unknown error'}`
            };
        }
    }
};
