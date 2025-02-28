import { createClient } from '../common/index.js';

export const listFormsAction = {
    name: 'list_forms',
    description: 'Returns a list of all forms',
    inputSchema: {
        type: 'object',
        properties: {
            apiSecret: {
                type: 'string',
                description: 'ConvertKit API Secret',
            },
        },
        required: ['apiSecret'],
    },
    outputSchema: {
        type: 'array',
        items: {
            type: 'object',
            properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                created_at: { type: 'string' },
                type: { type: 'string' },
                format: { type: 'string' },
                embed_js: { type: 'string' },
                embed_url: { type: 'string' },
                archived: { type: 'boolean' },
                uid: { type: 'string' },
            },
        },
    },
    exampleInput: {
        apiSecret: 'your-api-secret',
    },
    exampleOutput: [
        {
            id: '123',
            name: 'Form Name',
            created_at: '2023-01-01T00:00:00Z',
            type: 'embed',
            format: 'inline',
            embed_js: 'https://...',
            embed_url: 'https://...',
            archived: false,
            uid: 'abc123',
        },
    ],
    execute: async (input: any) => {
        const { apiSecret } = input;
        const client = createClient(apiSecret);

        try {
            const forms = await client.fetchForms();
            return forms;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to list forms: ${error.message}`);
            }
            throw new Error('Failed to list forms: Unknown error');
        }
    },
};

export const addSubscriberToFormAction = {
    name: 'add_subscriber_to_form',
    description: 'Adds a subscriber to a form',
    inputSchema: {
        type: 'object',
        properties: {
            apiSecret: {
                type: 'string',
                description: 'ConvertKit API Secret',
            },
            formId: {
                type: 'string',
                description: 'ID of the form',
            },
            email: {
                type: 'string',
                description: 'Email address of the subscriber',
            },
            firstName: {
                type: 'string',
                description: 'First name of the subscriber',
            },
            fields: {
                type: 'object',
                description: 'Custom fields for the subscriber',
                additionalProperties: true,
            },
            tags: {
                type: 'array',
                description: 'Tags to add to the subscriber',
                items: {
                    type: 'string',
                },
            },
        },
        required: ['apiSecret', 'formId', 'email'],
    },
    outputSchema: {
        type: 'object',
        properties: {
            subscription: {
                type: 'object',
                description: 'The subscription object',
            },
        },
    },
    exampleInput: {
        apiSecret: 'your-api-secret',
        formId: '123',
        email: 'john@example.com',
        firstName: 'John',
        fields: {
            custom_field_1: 'value1',
        },
        tags: ['456', '789'],
    },
    exampleOutput: {
        subscription: {
            id: '456',
            state: 'active',
            created_at: '2023-01-01T00:00:00Z',
            // ... other properties
        },
    },
    execute: async (input: any) => {
        const { apiSecret, formId, email, firstName, fields, tags } = input;
        const client = createClient(apiSecret);

        try {
            const data: any = {
                email,
            };

            if (firstName !== undefined) data.first_name = firstName;
            if (fields !== undefined) data.fields = fields;
            if (tags !== undefined) data.tags = tags;

            const subscription = await client.addSubscriberToForm(formId, data);
            return { subscription };
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to add subscriber to form: ${error.message}`);
            }
            throw new Error('Failed to add subscriber to form: Unknown error');
        }
    },
};

export const listFormSubscriptionsAction = {
    name: 'list_form_subscriptions',
    description: 'Returns a list of all subscriptions to a form',
    inputSchema: {
        type: 'object',
        properties: {
            apiSecret: {
                type: 'string',
                description: 'ConvertKit API Secret',
            },
            formId: {
                type: 'string',
                description: 'ID of the form',
            },
        },
        required: ['apiSecret', 'formId'],
    },
    outputSchema: {
        type: 'array',
        items: {
            type: 'object',
            properties: {
                id: { type: 'string' },
                state: { type: 'string' },
                created_at: { type: 'string' },
                subscriber: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                        first_name: { type: 'string' },
                        email_address: { type: 'string' },
                    },
                },
            },
        },
    },
    exampleInput: {
        apiSecret: 'your-api-secret',
        formId: '123',
    },
    exampleOutput: [
        {
            id: '456',
            state: 'active',
            created_at: '2023-01-01T00:00:00Z',
            subscriber: {
                id: '789',
                first_name: 'John',
                email_address: 'john@example.com',
            },
        },
    ],
    execute: async (input: any) => {
        const { apiSecret, formId } = input;
        const client = createClient(apiSecret);

        try {
            // This is a placeholder as the reference plugin doesn't have a direct method for this
            // In a real implementation, you would need to make a request to the ConvertKit API
            // to get all subscriptions to a form
            throw new Error('This action is not yet implemented');
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to list form subscriptions: ${error.message}`);
            }
            throw new Error('Failed to list form subscriptions: Unknown error');
        }
    },
};
