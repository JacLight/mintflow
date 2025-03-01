import { createClient } from '../common/index.js';

export const listSequencesAction = {
    name: 'list_sequences',
    description: 'Returns a list of all sequences',
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
                hold: { type: 'boolean' },
                repeat: { type: 'boolean' },
            },
        },
    },
    exampleInput: {
        apiSecret: 'your-api-secret',
    },
    exampleOutput: [
        {
            id: '123',
            name: 'Sequence Name',
            created_at: '2023-01-01T00:00:00Z',
            hold: false,
            repeat: false,
        },
    ],
    execute: async (input: any) => {
        const { apiSecret } = input;
        const client = createClient(apiSecret);

        try {
            const sequences = await client.fetchSequences();
            return sequences;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to list sequences: ${error.message}`);
            }
            throw new Error('Failed to list sequences: Unknown error');
        }
    },
};

export const addSubscriberToSequenceAction = {
    name: 'add_subscriber_to_sequence',
    description: 'Adds a subscriber to a sequence',
    inputSchema: {
        type: 'object',
        properties: {
            apiSecret: {
                type: 'string',
                description: 'ConvertKit API Secret',
            },
            sequenceId: {
                type: 'string',
                description: 'ID of the sequence',
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
        required: ['apiSecret', 'sequenceId', 'email'],
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
        sequenceId: '123',
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
        const { apiSecret, sequenceId, email, firstName, fields, tags } = input;
        const client = createClient(apiSecret);

        try {
            const data: any = {
                email,
            };

            if (firstName !== undefined) data.first_name = firstName;
            if (fields !== undefined) data.fields = fields;
            if (tags !== undefined) data.tags = tags;

            const subscription = await client.addSubscriberToSequence(sequenceId, data);
            return { subscription };
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to add subscriber to sequence: ${error.message}`);
            }
            throw new Error('Failed to add subscriber to sequence: Unknown error');
        }
    },
};

export const listSubscriptionsToSequenceAction = {
    name: 'list_subscriptions_to_sequence',
    description: 'Returns a list of all subscriptions to a sequence',
    inputSchema: {
        type: 'object',
        properties: {
            apiSecret: {
                type: 'string',
                description: 'ConvertKit API Secret',
            },
            sequenceId: {
                type: 'string',
                description: 'ID of the sequence',
            },
        },
        required: ['apiSecret', 'sequenceId'],
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
        sequenceId: '123',
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
        const { apiSecret, sequenceId } = input;
        const client = createClient(apiSecret);

        try {
            // This is a placeholder as the reference plugin doesn't have a direct method for this
            // In a real implementation, you would need to make a request to the ConvertKit API
            // to get all subscriptions to a sequence
            throw new Error('This action is not yet implemented');
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to list sequence subscriptions: ${error.message}`);
            }
            throw new Error('Failed to list sequence subscriptions: Unknown error');
        }
    },
};
