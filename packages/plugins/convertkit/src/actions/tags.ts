import { createClient } from '../common/index.js';

export const listTagsAction = {
    name: 'list_tags',
    description: 'Returns a list of all tags',
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
            },
        },
    },
    exampleInput: {
        apiSecret: 'your-api-secret',
    },
    exampleOutput: [
        {
            id: '123',
            name: 'Tag Name',
            created_at: '2023-01-01T00:00:00Z',
        },
    ],
    execute: async (input: any) => {
        const { apiSecret } = input;
        const client = createClient(apiSecret);

        try {
            const tags = await client.fetchTags();
            return tags;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to list tags: ${error.message}`);
            }
            throw new Error('Failed to list tags: Unknown error');
        }
    },
};

export const createTagAction = {
    name: 'create_tag',
    description: 'Creates a new tag',
    inputSchema: {
        type: 'object',
        properties: {
            apiSecret: {
                type: 'string',
                description: 'ConvertKit API Secret',
            },
            name: {
                type: 'string',
                description: 'Name of the tag',
            },
        },
        required: ['apiSecret', 'name'],
    },
    outputSchema: {
        type: 'object',
        properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            created_at: { type: 'string' },
        },
    },
    exampleInput: {
        apiSecret: 'your-api-secret',
        name: 'New Tag',
    },
    exampleOutput: {
        id: '123',
        name: 'New Tag',
        created_at: '2023-01-01T00:00:00Z',
    },
    execute: async (input: any) => {
        const { apiSecret, name } = input;
        const client = createClient(apiSecret);

        try {
            const tag = await client.createTag(name);
            return tag;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to create tag: ${error.message}`);
            }
            throw new Error('Failed to create tag: Unknown error');
        }
    },
};

export const tagSubscriberAction = {
    name: 'tag_subscriber',
    description: 'Adds a tag to a subscriber',
    inputSchema: {
        type: 'object',
        properties: {
            apiSecret: {
                type: 'string',
                description: 'ConvertKit API Secret',
            },
            tagId: {
                type: 'string',
                description: 'ID of the tag',
            },
            email: {
                type: 'string',
                description: 'Email address of the subscriber',
            },
        },
        required: ['apiSecret', 'tagId', 'email'],
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
        tagId: '123',
        email: 'john@example.com',
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
        const { apiSecret, tagId, email } = input;
        const client = createClient(apiSecret);

        try {
            const subscription = await client.tagSubscriber(tagId, email);
            return subscription;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to tag subscriber: ${error.message}`);
            }
            throw new Error('Failed to tag subscriber: Unknown error');
        }
    },
};

export const removeTagFromSubscriberByEmailAction = {
    name: 'remove_tag_from_subscriber_by_email',
    description: 'Removes a tag from a subscriber by email',
    inputSchema: {
        type: 'object',
        properties: {
            apiSecret: {
                type: 'string',
                description: 'ConvertKit API Secret',
            },
            tagId: {
                type: 'string',
                description: 'ID of the tag',
            },
            email: {
                type: 'string',
                description: 'Email address of the subscriber',
            },
        },
        required: ['apiSecret', 'tagId', 'email'],
    },
    outputSchema: {
        type: 'object',
        properties: {
            success: { type: 'boolean' },
        },
    },
    exampleInput: {
        apiSecret: 'your-api-secret',
        tagId: '123',
        email: 'john@example.com',
    },
    exampleOutput: {
        success: true,
    },
    execute: async (input: any) => {
        const { apiSecret, tagId, email } = input;
        const client = createClient(apiSecret);

        try {
            // First, get the subscriber ID from the email
            const subscriber = await client.fetchSubscriberByEmail(email);

            // Then remove the tag
            const result = await client.removeTagFromSubscriber(tagId, subscriber.id);
            return { success: true };
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to remove tag from subscriber: ${error.message}`);
            }
            throw new Error('Failed to remove tag from subscriber: Unknown error');
        }
    },
};

export const removeTagFromSubscriberByIdAction = {
    name: 'remove_tag_from_subscriber_by_id',
    description: 'Removes a tag from a subscriber by ID',
    inputSchema: {
        type: 'object',
        properties: {
            apiSecret: {
                type: 'string',
                description: 'ConvertKit API Secret',
            },
            tagId: {
                type: 'string',
                description: 'ID of the tag',
            },
            subscriberId: {
                type: 'string',
                description: 'ID of the subscriber',
            },
        },
        required: ['apiSecret', 'tagId', 'subscriberId'],
    },
    outputSchema: {
        type: 'object',
        properties: {
            success: { type: 'boolean' },
        },
    },
    exampleInput: {
        apiSecret: 'your-api-secret',
        tagId: '123',
        subscriberId: '456',
    },
    exampleOutput: {
        success: true,
    },
    execute: async (input: any) => {
        const { apiSecret, tagId, subscriberId } = input;
        const client = createClient(apiSecret);

        try {
            const result = await client.removeTagFromSubscriber(tagId, subscriberId);
            return { success: true };
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to remove tag from subscriber: ${error.message}`);
            }
            throw new Error('Failed to remove tag from subscriber: Unknown error');
        }
    },
};

export const listSubscriptionsToTagAction = {
    name: 'list_subscriptions_to_tag',
    description: 'Returns a list of all subscriptions to a tag',
    inputSchema: {
        type: 'object',
        properties: {
            apiSecret: {
                type: 'string',
                description: 'ConvertKit API Secret',
            },
            tagId: {
                type: 'string',
                description: 'ID of the tag',
            },
        },
        required: ['apiSecret', 'tagId'],
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
        tagId: '123',
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
        const { apiSecret, tagId } = input;
        const client = createClient(apiSecret);

        try {
            // This is a placeholder as the reference plugin doesn't have a direct method for this
            // In a real implementation, you would need to make a request to the ConvertKit API
            // to get all subscriptions to a tag
            throw new Error('This action is not yet implemented');
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to list subscriptions to tag: ${error.message}`);
            }
            throw new Error('Failed to list subscriptions to tag: Unknown error');
        }
    },
};
