import { ActiveCampaignClient } from '../../common/client.js';
import { CreateContactRequest } from '../../common/types.js';

export const createContactAction = {
    name: 'create_contact',
    description: 'Creates a new contact in ActiveCampaign',
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
            email: {
                type: 'string',
                description: 'Email address of the contact',
            },
            firstName: {
                type: 'string',
                description: 'First name of the contact',
            },
            lastName: {
                type: 'string',
                description: 'Last name of the contact',
            },
            phone: {
                type: 'string',
                description: 'Phone number of the contact',
            },
            customFields: {
                type: 'object',
                description: 'Custom fields for the contact',
                additionalProperties: true,
            },
        },
        required: ['apiUrl', 'apiKey', 'email'],
    },
    outputSchema: {
        type: 'object',
        properties: {
            contact: {
                type: 'object',
                description: 'The created contact',
            },
        },
    },
    exampleInput: {
        apiUrl: 'https://your-account.api-us1.com',
        apiKey: 'your-api-key',
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        phone: '123-456-7890',
        customFields: {
            // Custom field ID: value
            '1': 'Value for custom field 1',
        },
    },
    exampleOutput: {
        contact: {
            id: '123',
            email: 'john.doe@example.com',
            firstName: 'John',
            lastName: 'Doe',
            // ... other contact properties
        },
    },
    execute: async (input: any) => {
        const { apiUrl, apiKey, email, firstName, lastName, phone, customFields } = input;

        const client = new ActiveCampaignClient(apiUrl, apiKey);

        const createContactParams: CreateContactRequest = {
            email,
            firstName,
            lastName,
            phone,
            fieldValues: [],
        };

        // Add custom fields if provided
        if (customFields && typeof customFields === 'object') {
            Object.entries(customFields).forEach(([key, value]) => {
                createContactParams.fieldValues.push({ field: key, value: value });
            });
        }

        try {
            const response = await client.createContact(createContactParams);
            return response;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to create contact: ${error.message}`);
            }
            throw new Error('Failed to create contact: Unknown error');
        }
    },
};
