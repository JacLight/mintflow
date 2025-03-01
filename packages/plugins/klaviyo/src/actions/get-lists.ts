import { createClient } from '../common/index.js';

export const getListsAction = {
    name: 'get_lists',
    description: 'Get all lists from Klaviyo',
    inputSchema: {
        type: 'object',
        properties: {
            apiKey: {
                type: 'string',
                description: 'Klaviyo API Key',
            },
        },
        required: ['apiKey'],
    },
    outputSchema: {
        type: 'object',
        properties: {
            success: {
                type: 'boolean',
                description: 'Whether the lists were retrieved successfully',
            },
            message: {
                type: 'string',
                description: 'Error message if the lists failed to retrieve',
            },
            errors: {
                type: 'array',
                description: 'List of errors if the lists failed to retrieve',
                items: {
                    type: 'object',
                },
            },
            data: {
                type: 'array',
                description: 'List of lists',
                items: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            description: 'ID of the list',
                        },
                        name: {
                            type: 'string',
                            description: 'Name of the list',
                        },
                        created: {
                            type: 'string',
                            description: 'Date the list was created',
                        },
                        updated: {
                            type: 'string',
                            description: 'Date the list was last updated',
                        },
                    },
                },
            },
        },
    },
    exampleInput: {
        apiKey: 'pk_1234567890',
    },
    exampleOutput: {
        success: true,
        data: [
            {
                id: 'abc123',
                name: 'Newsletter Subscribers',
                created: '2023-01-01T00:00:00+00:00',
                updated: '2023-01-01T00:00:00+00:00',
            },
        ],
    },
    execute: async (input: any) => {
        const { apiKey } = input;

        const client = createClient(apiKey);

        try {
            const result = await client.getLists();
            return result;
        } catch (error) {
            if (error instanceof Error) {
                return {
                    success: false,
                    message: `Failed to get lists: ${error.message}`,
                };
            }
            return {
                success: false,
                message: 'Failed to get lists: Unknown error',
            };
        }
    },
};
