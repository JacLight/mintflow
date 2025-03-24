import { createClient } from '../common/index.js';

export const getCampaignsAction = {
    name: 'get_campaigns',
    description: 'Get all campaigns from Klaviyo',
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
                description: 'Whether the campaigns were retrieved successfully',
            },
            message: {
                type: 'string',
                description: 'Error message if the campaigns failed to retrieve',
            },
            errors: {
                type: 'array',
                description: 'List of errors if the campaigns failed to retrieve',
                items: {
                    type: 'object',
                },
            },
            data: {
                type: 'array',
                description: 'List of campaigns',
                items: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            description: 'ID of the campaign',
                        },
                        name: {
                            type: 'string',
                            description: 'Name of the campaign',
                        },
                        subject: {
                            type: 'string',
                            description: 'Subject of the campaign',
                        },
                        from_email: {
                            type: 'string',
                            description: 'From email of the campaign',
                        },
                        from_name: {
                            type: 'string',
                            description: 'From name of the campaign',
                        },
                        status: {
                            type: 'string',
                            description: 'Status of the campaign',
                        },
                        created: {
                            type: 'string',
                            description: 'Date the campaign was created',
                        },
                        updated: {
                            type: 'string',
                            description: 'Date the campaign was last updated',
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
                name: 'Monthly Newsletter',
                subject: 'Monthly Newsletter - January 2023',
                from_email: 'newsletter@example.com',
                from_name: 'Example Company',
                status: 'sent',
                created: '2023-01-01T00:00:00+00:00',
                updated: '2023-01-01T00:00:00+00:00',
            },
        ],
    },
    execute: async (input: any) => {
        const { apiKey } = input;

        const client = createClient(apiKey);

        try {
            const result = await client.getCampaigns();
            return result;
        } catch (error) {
            if (error instanceof Error) {
                return {
                    success: false,
                    message: `Failed to get campaigns: ${error.message}`,
                };
            }
            return {
                success: false,
                message: 'Failed to get campaigns: Unknown error',
            };
        }
    },
};
