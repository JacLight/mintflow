import { createClient } from '../common/index.js';

export const removeProfileFromListAction = {
    name: 'remove_profile_from_list',
    description: 'Remove a profile from a list in Klaviyo',
    inputSchema: {
        type: 'object',
        properties: {
            apiKey: {
                type: 'string',
                description: 'Klaviyo API Key',
            },
            listId: {
                type: 'string',
                description: 'ID of the list to remove the profile from',
            },
            email: {
                type: 'string',
                description: 'Email address of the profile to remove',
            },
        },
        required: ['apiKey', 'listId', 'email'],
    },
    outputSchema: {
        type: 'object',
        properties: {
            success: {
                type: 'boolean',
                description: 'Whether the profile was removed successfully',
            },
            message: {
                type: 'string',
                description: 'Error message if the profile failed to remove',
            },
            errors: {
                type: 'array',
                description: 'List of errors if the profile failed to remove',
                items: {
                    type: 'object',
                },
            },
        },
    },
    exampleInput: {
        apiKey: 'pk_1234567890',
        listId: 'abc123',
        email: 'customer@example.com',
    },
    exampleOutput: {
        success: true,
    },
    execute: async (input: any) => {
        const { apiKey, listId, email } = input;

        const client = createClient(apiKey);

        try {
            const result = await client.removeProfileFromList(listId, email);
            return result;
        } catch (error) {
            if (error instanceof Error) {
                return {
                    success: false,
                    message: `Failed to remove profile from list: ${error.message}`,
                };
            }
            return {
                success: false,
                message: 'Failed to remove profile from list: Unknown error',
            };
        }
    },
};
