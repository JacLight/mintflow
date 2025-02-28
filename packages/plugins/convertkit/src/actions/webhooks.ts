import { createClient } from '../common/index.js';
import { EventType } from '../common/types.js';

export const createWebhookAction = {
    name: 'create_webhook',
    description: 'Creates a new webhook',
    inputSchema: {
        type: 'object',
        properties: {
            apiSecret: {
                type: 'string',
                description: 'ConvertKit API Secret',
            },
            targetUrl: {
                type: 'string',
                description: 'URL to send webhook events to',
            },
            event: {
                type: 'string',
                description: 'Event type to trigger the webhook',
                enum: Object.values(EventType),
            },
            formId: {
                type: 'string',
                description: 'ID of the form (required for form_subscribe event)',
            },
            sequenceId: {
                type: 'string',
                description: 'ID of the sequence (required for course_subscribe and course_complete events)',
            },
            tagId: {
                type: 'string',
                description: 'ID of the tag (required for tag_add and tag_remove events)',
            },
            productId: {
                type: 'string',
                description: 'ID of the product (required for product_purchase event)',
            },
        },
        required: ['apiSecret', 'targetUrl', 'event'],
    },
    outputSchema: {
        type: 'object',
        properties: {
            id: { type: 'number' },
            account_id: { type: 'number' },
            event: {
                type: 'object',
                properties: {
                    name: { type: 'string' },
                },
            },
            target_url: { type: 'string' },
        },
    },
    exampleInput: {
        apiSecret: 'your-api-secret',
        targetUrl: 'https://example.com/webhook',
        event: 'subscriber.tag_add',
        tagId: '123',
    },
    exampleOutput: {
        id: 456,
        account_id: 789,
        event: {
            name: 'subscriber.tag_add',
            tag_id: '123',
        },
        target_url: 'https://example.com/webhook',
    },
    execute: async (input: any) => {
        const {
            apiSecret,
            targetUrl,
            event,
            formId,
            sequenceId,
            tagId,
            productId
        } = input;

        const client = createClient(apiSecret);

        try {
            // Prepare the webhook payload
            const webhookPayload: any = {
                target_url: targetUrl,
                event: {
                    name: event,
                },
            };

            // Add the appropriate parameter based on the event type
            if (event === EventType.formSubscribe && formId) {
                webhookPayload.event.form_id = formId;
            } else if ((event === EventType.courseSubscribe || event === EventType.courseComplete) && sequenceId) {
                webhookPayload.event.sequence_id = sequenceId;
            } else if ((event === EventType.tagAdd || event === EventType.tagRemove) && tagId) {
                webhookPayload.event.tag_id = tagId;
            } else if (event === EventType.productPurchase && productId) {
                webhookPayload.event.product_id = productId;
            }

            // Validate required parameters based on event type
            if (event === EventType.formSubscribe && !formId) {
                throw new Error('formId is required for form_subscribe event');
            } else if ((event === EventType.courseSubscribe || event === EventType.courseComplete) && !sequenceId) {
                throw new Error('sequenceId is required for course_subscribe and course_complete events');
            } else if ((event === EventType.tagAdd || event === EventType.tagRemove) && !tagId) {
                throw new Error('tagId is required for tag_add and tag_remove events');
            } else if (event === EventType.productPurchase && !productId) {
                throw new Error('productId is required for product_purchase event');
            }

            const webhook = await client.createWebhook(webhookPayload);
            return webhook;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to create webhook: ${error.message}`);
            }
            throw new Error('Failed to create webhook: Unknown error');
        }
    },
};

export const deleteWebhookAction = {
    name: 'delete_webhook',
    description: 'Deletes a webhook',
    inputSchema: {
        type: 'object',
        properties: {
            apiSecret: {
                type: 'string',
                description: 'ConvertKit API Secret',
            },
            webhookId: {
                type: 'number',
                description: 'ID of the webhook to delete',
            },
        },
        required: ['apiSecret', 'webhookId'],
    },
    outputSchema: {
        type: 'object',
        properties: {
            success: { type: 'boolean' },
        },
    },
    exampleInput: {
        apiSecret: 'your-api-secret',
        webhookId: 123,
    },
    exampleOutput: {
        success: true,
    },
    execute: async (input: any) => {
        const { apiSecret, webhookId } = input;
        const client = createClient(apiSecret);

        try {
            const success = await client.removeWebhook(webhookId);
            return { success };
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to delete webhook: ${error.message}`);
            }
            throw new Error('Failed to delete webhook: Unknown error');
        }
    },
};
