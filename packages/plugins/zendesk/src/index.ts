import { ZendeskClient } from './client.js';
import {
    ZendeskAuth,
    ZendeskTicket,
    ZendeskTicketStatus,
    ZendeskTicketPriority,
    ZendeskTicketType,
    ZendeskView,
    ZendeskWebhookPayload
} from './models.js';

// Create a default client instance with empty auth
const defaultClient = new ZendeskClient({
    email: '',
    token: '',
    subdomain: ''
});

const zendeskPlugin = {
    name: "Zendesk",
    icon: "",
    description: "Customer service software and support ticket system",
    id: "zendesk",
    runner: "node",
    inputSchema: {
        type: "object",
        properties: {
            action: {
                type: 'string',
                enum: [
                    // Ticket actions
                    'get_ticket',
                    'create_ticket',
                    'update_ticket',
                    'delete_ticket',
                    'add_ticket_comment',
                    'search_tickets',

                    // View actions
                    'get_views',
                    'get_view',
                    'get_tickets_from_view',

                    // User actions
                    'get_users',
                    'get_user',

                    // Group actions
                    'get_groups',
                    'get_group',

                    // Organization actions
                    'get_organizations',
                    'get_organization',

                    // Webhook actions
                    'process_webhook'
                ],
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Action to perform on Zendesk',
            },
            email: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'The email address you use to login to Zendesk',
            },
            token: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'The API token you can generate in Zendesk',
            },
            subdomain: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'The subdomain of your Zendesk instance (e.g., "example" for example.zendesk.com)',
            },

            // Ticket parameters
            ticketId: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Ticket ID',
                rules: [
                    { operation: 'notEqual', valueA: 'get_ticket', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'update_ticket', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'delete_ticket', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'add_ticket_comment', valueB: '{{action}}', action: 'hide' },
                ],
            },
            ticketData: {
                type: 'object',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Ticket data',
                rules: [
                    { operation: 'notEqual', valueA: 'create_ticket', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'update_ticket', valueB: '{{action}}', action: 'hide' },
                ],
            },
            comment: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Comment to add to the ticket',
                rules: [
                    { operation: 'notEqual', valueA: 'add_ticket_comment', valueB: '{{action}}', action: 'hide' },
                ],
            },
            isPublic: {
                type: 'boolean',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Whether the comment is public or internal',
                rules: [
                    { operation: 'notEqual', valueA: 'add_ticket_comment', valueB: '{{action}}', action: 'hide' },
                ],
            },
            searchQuery: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Search query for tickets',
                rules: [
                    { operation: 'notEqual', valueA: 'search_tickets', valueB: '{{action}}', action: 'hide' },
                ],
            },

            // View parameters
            viewId: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'View ID',
                rules: [
                    { operation: 'notEqual', valueA: 'get_view', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'get_tickets_from_view', valueB: '{{action}}', action: 'hide' },
                ],
            },
            sortOrder: {
                type: 'string',
                enum: ['asc', 'desc'],
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Sort order for tickets',
                rules: [
                    { operation: 'notEqual', valueA: 'get_tickets_from_view', valueB: '{{action}}', action: 'hide' },
                ],
            },
            sortBy: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Field to sort tickets by',
                rules: [
                    { operation: 'notEqual', valueA: 'get_tickets_from_view', valueB: '{{action}}', action: 'hide' },
                ],
            },
            perPage: {
                type: 'number',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Number of tickets to return per page',
                rules: [
                    { operation: 'notEqual', valueA: 'get_tickets_from_view', valueB: '{{action}}', action: 'hide' },
                ],
            },

            // User parameters
            userId: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'User ID',
                rules: [
                    { operation: 'notEqual', valueA: 'get_user', valueB: '{{action}}', action: 'hide' },
                ],
            },

            // Group parameters
            groupId: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Group ID',
                rules: [
                    { operation: 'notEqual', valueA: 'get_group', valueB: '{{action}}', action: 'hide' },
                ],
            },

            // Organization parameters
            organizationId: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Organization ID',
                rules: [
                    { operation: 'notEqual', valueA: 'get_organization', valueB: '{{action}}', action: 'hide' },
                ],
            },

            // Webhook parameters
            webhookPayload: {
                type: 'object',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Webhook payload',
                rules: [
                    { operation: 'notEqual', valueA: 'process_webhook', valueB: '{{action}}', action: 'hide' },
                ],
            },
        },
        required: ['action', 'email', 'token', 'subdomain'],
    },
    outputSchema: {
        type: "object",
    },
    exampleInput: {
        action: 'get_tickets_from_view',
        email: 'agent@example.com',
        token: 'your-api-token',
        subdomain: 'example',
        viewId: '12345'
    },
    exampleOutput: {
        "tickets": [
            {
                "id": 1,
                "subject": "Help with product",
                "description": "I need help with your product",
                "status": "open",
                "priority": "normal",
                "created_at": "2023-01-01T00:00:00Z",
                "updated_at": "2023-01-02T00:00:00Z"
            }
        ]
    },
    documentation: "https://developer.zendesk.com/api-reference/",
    method: "exec",
    actions: [
        {
            name: 'zendesk',
            execute: async (input: any, context?: any): Promise<any> => {
                const { action, email, token, subdomain } = input;

                if (!action || !email || !token || !subdomain) {
                    throw new Error('Missing required parameters: action, email, token, subdomain');
                }

                // Create a client instance, using the context's axios instance if provided
                const auth: ZendeskAuth = {
                    email,
                    token,
                    subdomain
                };

                const client = context?.axiosInstance ?
                    new ZendeskClient(auth, context.axiosInstance) :
                    new ZendeskClient(auth);

                switch (action) {
                    // Ticket actions
                    case 'get_ticket': {
                        const { ticketId } = input;
                        if (!ticketId) {
                            throw new Error('Missing required parameter: ticketId');
                        }
                        return await client.getTicket(ticketId);
                    }

                    case 'create_ticket': {
                        const { ticketData } = input;
                        if (!ticketData) {
                            throw new Error('Missing required parameter: ticketData');
                        }
                        return await client.createTicket(ticketData);
                    }

                    case 'update_ticket': {
                        const { ticketId, ticketData } = input;
                        if (!ticketId || !ticketData) {
                            throw new Error('Missing required parameters: ticketId, ticketData');
                        }
                        return await client.updateTicket(ticketId, ticketData);
                    }

                    case 'delete_ticket': {
                        const { ticketId } = input;
                        if (!ticketId) {
                            throw new Error('Missing required parameter: ticketId');
                        }
                        await client.deleteTicket(ticketId);
                        return { success: true, message: `Ticket ${ticketId} deleted successfully` };
                    }

                    case 'add_ticket_comment': {
                        const { ticketId, comment, isPublic } = input;
                        if (!ticketId || !comment) {
                            throw new Error('Missing required parameters: ticketId, comment');
                        }
                        return await client.addTicketComment(ticketId, {
                            body: comment,
                            public: isPublic !== undefined ? isPublic : true
                        });
                    }

                    case 'search_tickets': {
                        const { searchQuery } = input;
                        if (!searchQuery) {
                            throw new Error('Missing required parameter: searchQuery');
                        }
                        return await client.searchTickets(searchQuery);
                    }

                    // View actions
                    case 'get_views': {
                        return await client.getViews();
                    }

                    case 'get_view': {
                        const { viewId } = input;
                        if (!viewId) {
                            throw new Error('Missing required parameter: viewId');
                        }
                        return await client.getView(viewId);
                    }

                    case 'get_tickets_from_view': {
                        const { viewId, sortOrder, sortBy, perPage } = input;
                        if (!viewId) {
                            throw new Error('Missing required parameter: viewId');
                        }

                        const options: any = {};
                        if (sortOrder) options.sortOrder = sortOrder;
                        if (sortBy) options.sortBy = sortBy;
                        if (perPage) options.perPage = perPage;

                        return await client.getTicketsFromView(viewId, options);
                    }

                    // User actions
                    case 'get_users': {
                        return await client.getUsers();
                    }

                    case 'get_user': {
                        const { userId } = input;
                        if (!userId) {
                            throw new Error('Missing required parameter: userId');
                        }
                        return await client.getUser(userId);
                    }

                    // Group actions
                    case 'get_groups': {
                        return await client.getGroups();
                    }

                    case 'get_group': {
                        const { groupId } = input;
                        if (!groupId) {
                            throw new Error('Missing required parameter: groupId');
                        }
                        return await client.getGroup(groupId);
                    }

                    // Organization actions
                    case 'get_organizations': {
                        return await client.getOrganizations();
                    }

                    case 'get_organization': {
                        const { organizationId } = input;
                        if (!organizationId) {
                            throw new Error('Missing required parameter: organizationId');
                        }
                        return await client.getOrganization(organizationId);
                    }

                    // Webhook actions
                    case 'process_webhook': {
                        const { webhookPayload } = input;
                        if (!webhookPayload) {
                            throw new Error('Missing required parameter: webhookPayload');
                        }

                        // Process the webhook payload based on its content
                        // This is a simple implementation that just returns the payload
                        return {
                            processed: true,
                            data: webhookPayload
                        };
                    }

                    default:
                        throw new Error(`Unsupported action: ${action}`);
                }
            }
        }
    ]
};

export { ZendeskClient };
export default zendeskPlugin;
