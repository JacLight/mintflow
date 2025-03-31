import {
    getUser,
    listEvents,
    getEvent,
    listScheduledEvents,
    getScheduledEvent,
    listInvitees,
    getInvitee,
    cancelInvitee,
    listWebhooks,
    createWebhook,
    deleteWebhook
} from './utils.js';

const calendlyPlugin = {
    name: "Calendly",
    icon: "",
    description: "Simple, modern scheduling",
    groups: ["productivity"],
    tags: ["productivity","collaboration","organization","workflow","task"],
    version: '1.0.0',
    id: "calendly",
    runner: "node",
    inputSchema: {
        type: "object",
        properties: {
            action: {
                type: 'string',
                enum: [
                    'get_user',
                    'list_events',
                    'get_event',
                    'list_scheduled_events',
                    'get_scheduled_event',
                    'list_invitees',
                    'get_invitee',
                    'cancel_invitee',
                    'list_webhooks',
                    'create_webhook',
                    'delete_webhook'
                ],
                description: 'Action to perform on Calendly',
            },
            token: {
                type: 'string',
                description: 'Calendly Personal Token',
            },
            // List events parameters
            organization: {
                type: 'boolean',
                description: 'Use organization scope instead of user scope',
                rules: [
                    { operation: 'notEqual', valueA: 'list_events', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'list_scheduled_events', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'list_webhooks', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'create_webhook', valueB: '{{action}}', action: 'hide' },
                ],
            },
            count: {
                type: 'number',
                description: 'Number of results to return',
                rules: [
                    { operation: 'notEqual', valueA: 'list_events', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'list_scheduled_events', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'list_invitees', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'list_webhooks', valueB: '{{action}}', action: 'hide' },
                ],
            },
            page_token: {
                type: 'string',
                description: 'Token for pagination',
                rules: [
                    { operation: 'notEqual', valueA: 'list_events', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'list_scheduled_events', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'list_invitees', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'list_webhooks', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Get event parameters
            eventUuid: {
                type: 'string',
                description: 'UUID of the event',
                rules: [
                    { operation: 'notEqual', valueA: 'get_event', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // List scheduled events parameters
            min_start_time: {
                type: 'string',
                description: 'Minimum start time (ISO 8601)',
                rules: [
                    { operation: 'notEqual', valueA: 'list_scheduled_events', valueB: '{{action}}', action: 'hide' },
                ],
            },
            max_start_time: {
                type: 'string',
                description: 'Maximum start time (ISO 8601)',
                rules: [
                    { operation: 'notEqual', valueA: 'list_scheduled_events', valueB: '{{action}}', action: 'hide' },
                ],
            },
            status: {
                type: 'string',
                enum: ['active', 'canceled'],
                description: 'Status of the scheduled event',
                rules: [
                    { operation: 'notEqual', valueA: 'list_scheduled_events', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'list_invitees', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Get scheduled event parameters
            scheduledEventUuid: {
                type: 'string',
                description: 'UUID of the scheduled event',
                rules: [
                    { operation: 'notEqual', valueA: 'get_scheduled_event', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'list_invitees', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // List invitees parameters
            email: {
                type: 'string',
                description: 'Email of the invitee',
                rules: [
                    { operation: 'notEqual', valueA: 'list_invitees', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Get invitee parameters
            inviteeUuid: {
                type: 'string',
                description: 'UUID of the invitee',
                rules: [
                    { operation: 'notEqual', valueA: 'get_invitee', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'cancel_invitee', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Cancel invitee parameters
            reason: {
                type: 'string',
                description: 'Reason for cancellation',
                rules: [
                    { operation: 'notEqual', valueA: 'cancel_invitee', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // List webhooks parameters
            scope: {
                type: 'string',
                enum: ['user', 'organization'],
                description: 'Scope of the webhook',
                rules: [
                    { operation: 'notEqual', valueA: 'list_webhooks', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'create_webhook', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Create webhook parameters
            url: {
                type: 'string',
                description: 'URL to send webhook events to',
                rules: [
                    { operation: 'notEqual', valueA: 'create_webhook', valueB: '{{action}}', action: 'hide' },
                ],
            },
            events: {
                type: 'array',
                items: {
                    type: 'string',
                    enum: [
                        'invitee.created',
                        'invitee.canceled',
                        'routing_form_submission.created'
                    ]
                },
                description: 'Events to subscribe to',
                rules: [
                    { operation: 'notEqual', valueA: 'create_webhook', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Delete webhook parameters
            webhookUuid: {
                type: 'string',
                description: 'UUID of the webhook',
                rules: [
                    { operation: 'notEqual', valueA: 'delete_webhook', valueB: '{{action}}', action: 'hide' },
                ],
            },
        },
        required: ['action', 'token'],
    },
    outputSchema: {
        type: "object",
    },
    exampleInput: {
        action: 'get_user',
        token: 'your-calendly-personal-token'
    },
    exampleOutput: {
        uri: 'https://api.calendly.com/users/ABCDEFGHIJKLMNOPQRST',
        name: 'John Doe',
        email: 'john.doe@example.com',
        current_organization: 'https://api.calendly.com/organizations/ABCDEFGHIJKLMNOPQRST'
    },
    documentation: "https://developer.calendly.com/api-docs",
    method: "exec",
    actions: [
        {
            name: 'calendly',
            execute: async (input: any): Promise<any> => {
                const { action, token } = input;

                if (!action || !token) {
                    throw new Error('Missing required parameters: action, token');
                }

                switch (action) {
                    case 'get_user': {
                        return await getUser({
                            token
                        });
                    }

                    case 'list_events': {
                        const { organization, count, page_token } = input;

                        return await listEvents({
                            token,
                            organization,
                            count,
                            page_token
                        });
                    }

                    case 'get_event': {
                        const { eventUuid } = input;

                        if (!eventUuid) {
                            throw new Error('Missing required parameter: eventUuid');
                        }

                        return await getEvent({
                            token,
                            eventUuid
                        });
                    }

                    case 'list_scheduled_events': {
                        const { organization, count, page_token, min_start_time, max_start_time, status } = input;

                        return await listScheduledEvents({
                            token,
                            organization,
                            count,
                            page_token,
                            min_start_time,
                            max_start_time,
                            status
                        });
                    }

                    case 'get_scheduled_event': {
                        const { scheduledEventUuid } = input;

                        if (!scheduledEventUuid) {
                            throw new Error('Missing required parameter: scheduledEventUuid');
                        }

                        return await getScheduledEvent({
                            token,
                            scheduledEventUuid
                        });
                    }

                    case 'list_invitees': {
                        const { scheduledEventUuid, count, page_token, email, status } = input;

                        if (!scheduledEventUuid) {
                            throw new Error('Missing required parameter: scheduledEventUuid');
                        }

                        return await listInvitees({
                            token,
                            scheduledEventUuid,
                            count,
                            page_token,
                            email,
                            status
                        });
                    }

                    case 'get_invitee': {
                        const { inviteeUuid } = input;

                        if (!inviteeUuid) {
                            throw new Error('Missing required parameter: inviteeUuid');
                        }

                        return await getInvitee({
                            token,
                            inviteeUuid
                        });
                    }

                    case 'cancel_invitee': {
                        const { inviteeUuid, reason } = input;

                        if (!inviteeUuid) {
                            throw new Error('Missing required parameter: inviteeUuid');
                        }

                        await cancelInvitee({
                            token,
                            inviteeUuid,
                            reason
                        });

                        return { success: true, message: 'Invitee canceled successfully' };
                    }

                    case 'list_webhooks': {
                        const { organization, scope, count, page_token } = input;

                        return await listWebhooks({
                            token,
                            organization,
                            scope,
                            count,
                            page_token
                        });
                    }

                    case 'create_webhook': {
                        const { url, events, scope, organization } = input;

                        if (!url || !events || !scope) {
                            throw new Error('Missing required parameters: url, events, scope');
                        }

                        return await createWebhook({
                            token,
                            url,
                            events,
                            scope,
                            organization
                        });
                    }

                    case 'delete_webhook': {
                        const { webhookUuid } = input;

                        if (!webhookUuid) {
                            throw new Error('Missing required parameter: webhookUuid');
                        }

                        await deleteWebhook({
                            token,
                            webhookUuid
                        });

                        return { success: true, message: 'Webhook deleted successfully' };
                    }

                    default:
                        throw new Error(`Unsupported action: ${action}`);
                }
            }
        }
    ]
};

export default calendlyPlugin;
