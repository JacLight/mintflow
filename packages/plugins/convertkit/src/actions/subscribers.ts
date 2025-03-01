import { createClient } from '../common/index.js';

export const getSubscriberByIdAction = {
    name: 'get_subscriber_by_id',
    description: 'Returns data for a single subscriber by ID',
    inputSchema: {
        type: 'object',
        properties: {
            apiSecret: {
                type: 'string',
                description: 'ConvertKit API Secret',
            },
            subscriberId: {
                type: 'string',
                description: 'ID of the subscriber',
            },
        },
        required: ['apiSecret', 'subscriberId'],
    },
    outputSchema: {
        type: 'object',
        properties: {
            id: { type: 'string' },
            first_name: { type: 'string' },
            email_address: { type: 'string' },
            state: { type: 'string' },
            created_at: { type: 'string' },
            fields: { type: 'object' },
        },
    },
    exampleInput: {
        apiSecret: 'your-api-secret',
        subscriberId: '123456',
    },
    exampleOutput: {
        id: '123456',
        first_name: 'John',
        email_address: 'john@example.com',
        state: 'active',
        created_at: '2023-01-01T00:00:00Z',
        fields: {},
    },
    execute: async (input: any) => {
        const { apiSecret, subscriberId } = input;
        const client = createClient(apiSecret);

        try {
            const subscriber = await client.fetchSubscriberById(subscriberId);
            return subscriber;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to get subscriber: ${error.message}`);
            }
            throw new Error('Failed to get subscriber: Unknown error');
        }
    },
};

export const getSubscriberByEmailAction = {
    name: 'get_subscriber_by_email',
    description: 'Returns data for a single subscriber by email',
    inputSchema: {
        type: 'object',
        properties: {
            apiSecret: {
                type: 'string',
                description: 'ConvertKit API Secret',
            },
            email: {
                type: 'string',
                description: 'Email address of the subscriber',
            },
        },
        required: ['apiSecret', 'email'],
    },
    outputSchema: {
        type: 'object',
        properties: {
            id: { type: 'string' },
            first_name: { type: 'string' },
            email_address: { type: 'string' },
            state: { type: 'string' },
            created_at: { type: 'string' },
            fields: { type: 'object' },
        },
    },
    exampleInput: {
        apiSecret: 'your-api-secret',
        email: 'john@example.com',
    },
    exampleOutput: {
        id: '123456',
        first_name: 'John',
        email_address: 'john@example.com',
        state: 'active',
        created_at: '2023-01-01T00:00:00Z',
        fields: {},
    },
    execute: async (input: any) => {
        const { apiSecret, email } = input;
        const client = createClient(apiSecret);

        try {
            const subscriber = await client.fetchSubscriberByEmail(email);
            return subscriber;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to get subscriber: ${error.message}`);
            }
            throw new Error('Failed to get subscriber: Unknown error');
        }
    },
};

export const listSubscribersAction = {
    name: 'list_subscribers',
    description: 'Returns a list of all subscribers',
    inputSchema: {
        type: 'object',
        properties: {
            apiSecret: {
                type: 'string',
                description: 'ConvertKit API Secret',
            },
            page: {
                type: 'number',
                description: 'Page number for pagination',
            },
            from: {
                type: 'string',
                description: 'Filter subscribers created from this date (YYYY-MM-DD)',
            },
            to: {
                type: 'string',
                description: 'Filter subscribers created to this date (YYYY-MM-DD)',
            },
            updatedFrom: {
                type: 'string',
                description: 'Filter subscribers updated from this date (YYYY-MM-DD)',
            },
            updatedTo: {
                type: 'string',
                description: 'Filter subscribers updated to this date (YYYY-MM-DD)',
            },
            emailAddress: {
                type: 'string',
                description: 'Filter subscribers by email address',
            },
            sortOrder: {
                type: 'string',
                description: 'Sort order (asc or desc)',
                enum: ['asc', 'desc'],
            },
            sortField: {
                type: 'string',
                description: 'Field to sort by',
                enum: ['created_at', 'email_address', 'first_name', 'updated_at'],
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
                first_name: { type: 'string' },
                email_address: { type: 'string' },
                state: { type: 'string' },
                created_at: { type: 'string' },
                fields: { type: 'object' },
            },
        },
    },
    exampleInput: {
        apiSecret: 'your-api-secret',
        page: 1,
        sortOrder: 'desc',
        sortField: 'created_at',
    },
    exampleOutput: [
        {
            id: '123456',
            first_name: 'John',
            email_address: 'john@example.com',
            state: 'active',
            created_at: '2023-01-01T00:00:00Z',
            fields: {},
        },
    ],
    execute: async (input: any) => {
        const {
            apiSecret,
            page,
            from,
            to,
            updatedFrom,
            updatedTo,
            emailAddress,
            sortOrder,
            sortField
        } = input;

        const client = createClient(apiSecret);

        try {
            const params: any = {
                page: page || 1,
            };

            if (from) params.from = from;
            if (to) params.to = to;
            if (updatedFrom) params.updated_from = updatedFrom;
            if (updatedTo) params.updated_to = updatedTo;
            if (emailAddress) params.email_address = emailAddress;
            if (sortOrder) params.sort_order = sortOrder;
            if (sortField) params.sort_field = sortField;

            const subscribers = await client.listSubscribers(params);
            return subscribers;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to list subscribers: ${error.message}`);
            }
            throw new Error('Failed to list subscribers: Unknown error');
        }
    },
};

export const updateSubscriberAction = {
    name: 'update_subscriber',
    description: 'Updates a subscriber',
    inputSchema: {
        type: 'object',
        properties: {
            apiSecret: {
                type: 'string',
                description: 'ConvertKit API Secret',
            },
            subscriberId: {
                type: 'string',
                description: 'ID of the subscriber to update',
            },
            emailAddress: {
                type: 'string',
                description: 'New email address for the subscriber',
            },
            firstName: {
                type: 'string',
                description: 'New first name for the subscriber',
            },
            fields: {
                type: 'object',
                description: 'Custom fields to update',
                additionalProperties: true,
            },
        },
        required: ['apiSecret', 'subscriberId'],
    },
    outputSchema: {
        type: 'object',
        properties: {
            id: { type: 'string' },
            first_name: { type: 'string' },
            email_address: { type: 'string' },
            state: { type: 'string' },
            created_at: { type: 'string' },
            fields: { type: 'object' },
        },
    },
    exampleInput: {
        apiSecret: 'your-api-secret',
        subscriberId: '123456',
        emailAddress: 'john.updated@example.com',
        firstName: 'John Updated',
        fields: {
            custom_field_1: 'value1',
        },
    },
    exampleOutput: {
        id: '123456',
        first_name: 'John Updated',
        email_address: 'john.updated@example.com',
        state: 'active',
        created_at: '2023-01-01T00:00:00Z',
        fields: {
            custom_field_1: 'value1',
        },
    },
    execute: async (input: any) => {
        const { apiSecret, subscriberId, emailAddress, firstName, fields } = input;
        const client = createClient(apiSecret);

        try {
            const data: any = {};

            if (emailAddress !== undefined) data.email_address = emailAddress;
            if (firstName !== undefined) data.first_name = firstName;
            if (fields !== undefined) data.fields = fields;

            const subscriber = await client.updateSubscriber(subscriberId, data);
            return subscriber;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to update subscriber: ${error.message}`);
            }
            throw new Error('Failed to update subscriber: Unknown error');
        }
    },
};

export const unsubscribeSubscriberAction = {
    name: 'unsubscribe_subscriber',
    description: 'Unsubscribes a subscriber',
    inputSchema: {
        type: 'object',
        properties: {
            apiSecret: {
                type: 'string',
                description: 'ConvertKit API Secret',
            },
            email: {
                type: 'string',
                description: 'Email address of the subscriber to unsubscribe',
            },
        },
        required: ['apiSecret', 'email'],
    },
    outputSchema: {
        type: 'object',
        properties: {
            id: { type: 'string' },
            first_name: { type: 'string' },
            email_address: { type: 'string' },
            state: { type: 'string' },
            created_at: { type: 'string' },
            fields: { type: 'object' },
        },
    },
    exampleInput: {
        apiSecret: 'your-api-secret',
        email: 'john@example.com',
    },
    exampleOutput: {
        id: '123456',
        first_name: 'John',
        email_address: 'john@example.com',
        state: 'cancelled',
        created_at: '2023-01-01T00:00:00Z',
        fields: {},
    },
    execute: async (input: any) => {
        const { apiSecret, email } = input;
        const client = createClient(apiSecret);

        try {
            const subscriber = await client.unsubscribeSubscriber(email);
            return subscriber;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to unsubscribe subscriber: ${error.message}`);
            }
            throw new Error('Failed to unsubscribe subscriber: Unknown error');
        }
    },
};

export const listTagsBySubscriberIdAction = {
    name: 'list_tags_by_subscriber_id',
    description: 'Returns a list of all tags for a subscriber',
    inputSchema: {
        type: 'object',
        properties: {
            apiSecret: {
                type: 'string',
                description: 'ConvertKit API Secret',
            },
            subscriberId: {
                type: 'string',
                description: 'ID of the subscriber',
            },
        },
        required: ['apiSecret', 'subscriberId'],
    },
    outputSchema: {
        type: 'array',
        items: {
            type: 'object',
            properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                created_at: { type: 'string' },
            },
        },
    },
    exampleInput: {
        apiSecret: 'your-api-secret',
        subscriberId: '123456',
    },
    exampleOutput: [
        {
            id: '789',
            name: 'Tag Name',
            created_at: '2023-01-01T00:00:00Z',
        },
    ],
    execute: async (input: any) => {
        const { apiSecret, subscriberId } = input;
        const client = createClient(apiSecret);

        try {
            const tags = await client.fetchSubscribedTags(subscriberId);
            return tags;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to list tags: ${error.message}`);
            }
            throw new Error('Failed to list tags: Unknown error');
        }
    },
};

export const listTagsByEmailAction = {
    name: 'list_tags_by_email',
    description: 'Returns a list of all tags for a subscriber by email',
    inputSchema: {
        type: 'object',
        properties: {
            apiSecret: {
                type: 'string',
                description: 'ConvertKit API Secret',
            },
            email: {
                type: 'string',
                description: 'Email address of the subscriber',
            },
        },
        required: ['apiSecret', 'email'],
    },
    outputSchema: {
        type: 'array',
        items: {
            type: 'object',
            properties: {
                id: { type: 'string' },
                name: { type: 'string' },
                created_at: { type: 'string' },
            },
        },
    },
    exampleInput: {
        apiSecret: 'your-api-secret',
        email: 'john@example.com',
    },
    exampleOutput: [
        {
            id: '789',
            name: 'Tag Name',
            created_at: '2023-01-01T00:00:00Z',
        },
    ],
    execute: async (input: any) => {
        const { apiSecret, email } = input;
        const client = createClient(apiSecret);

        try {
            const subscriber = await client.fetchSubscriberByEmail(email);
            const tags = await client.fetchSubscribedTags(subscriber.id);
            return tags;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to list tags: ${error.message}`);
            }
            throw new Error('Failed to list tags: Unknown error');
        }
    },
};
