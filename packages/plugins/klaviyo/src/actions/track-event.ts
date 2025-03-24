import { createClient } from '../common/index.js';
import { KlaviyoEvent } from '../common/types.js';

export const trackEventAction = {
    name: 'track_event',
    description: 'Track an event in Klaviyo',
    inputSchema: {
        type: 'object',
        properties: {
            apiKey: {
                type: 'string',
                description: 'Klaviyo API Key',
            },
            event: {
                type: 'string',
                description: 'Name of the event to track',
            },
            email: {
                type: 'string',
                description: 'Email address of the customer',
            },
            firstName: {
                type: 'string',
                description: 'First name of the customer',
            },
            lastName: {
                type: 'string',
                description: 'Last name of the customer',
            },
            phoneNumber: {
                type: 'string',
                description: 'Phone number of the customer',
            },
            externalId: {
                type: 'string',
                description: 'External ID of the customer',
            },
            properties: {
                type: 'object',
                description: 'Additional properties for the event',
            },
        },
        required: ['apiKey', 'event', 'email'],
    },
    outputSchema: {
        type: 'object',
        properties: {
            success: {
                type: 'boolean',
                description: 'Whether the event was tracked successfully',
            },
            message: {
                type: 'string',
                description: 'Error message if the event failed to track',
            },
            errors: {
                type: 'array',
                description: 'List of errors if the event failed to track',
                items: {
                    type: 'object',
                },
            },
        },
    },
    exampleInput: {
        apiKey: 'pk_1234567890',
        event: 'Viewed Product',
        email: 'customer@example.com',
        firstName: 'John',
        lastName: 'Doe',
        properties: {
            productId: '123',
            productName: 'Example Product',
            price: 99.99,
        },
    },
    exampleOutput: {
        success: true,
    },
    execute: async (input: any) => {
        const {
            apiKey,
            event,
            email,
            firstName,
            lastName,
            phoneNumber,
            externalId,
            properties,
        } = input;

        const client = createClient(apiKey);

        // Prepare event data
        const eventData: KlaviyoEvent = {
            event,
            customer_properties: {
                email,
                first_name: firstName,
                last_name: lastName,
                phone_number: phoneNumber,
                external_id: externalId,
            },
            properties: properties || {},
        };

        try {
            const result = await client.trackEvent(eventData);
            return result;
        } catch (error) {
            if (error instanceof Error) {
                return {
                    success: false,
                    message: `Failed to track event: ${error.message}`,
                };
            }
            return {
                success: false,
                message: 'Failed to track event: Unknown error',
            };
        }
    },
};
