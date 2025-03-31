import zendeskPlugin, { ZendeskClient } from '../src/index.js';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import { ZendeskTicketStatus } from '../src/models.js';

describe('zendeskPlugin', () => {
    let mock: MockAdapter;
    let axiosInstance: any;
    let executeZendesk: any;

    beforeEach(() => {
        // Create a new axios instance for testing
        axiosInstance = axios.create();

        // Create a mock adapter for the axios instance
        mock = new MockAdapter(axiosInstance);

        // Get the execute function from the plugin
        executeZendesk = zendeskPlugin.actions[0].execute;
    });

    afterEach(() => {
        // Reset and restore the mock
        mock.reset();
        mock.restore();
    });

    it('should get tickets from a view successfully', async () => {
        // Mock the tickets endpoint
        mock.onGet('https://example.zendesk.com/api/v2/views/12345/tickets.json').reply(200, {
            tickets: [
                {
                    id: 1,
                    url: 'https://example.zendesk.com/api/v2/tickets/1.json',
                    subject: 'Help with product',
                    description: 'I need help with your product',
                    status: ZendeskTicketStatus.OPEN,
                    priority: 'normal',
                    created_at: '2023-01-01T00:00:00Z',
                    updated_at: '2023-01-02T00:00:00Z'
                }
            ]
        });

        const input = {
            action: 'get_tickets_from_view',
            email: 'agent@example.com',
            token: 'test-token',
            subdomain: 'example',
            viewId: '12345'
        };

        // Pass the axiosInstance in the context
        const result = await executeZendesk(input, { axiosInstance });

        expect(result).toEqual([
            {
                id: 1,
                url: 'https://example.zendesk.com/api/v2/tickets/1.json',
                subject: 'Help with product',
                description: 'I need help with your product',
                status: ZendeskTicketStatus.OPEN,
                priority: 'normal',
                created_at: '2023-01-01T00:00:00Z',
                updated_at: '2023-01-02T00:00:00Z'
            }
        ]);
    });

    it('should get a specific ticket successfully', async () => {
        // Mock the ticket endpoint
        mock.onGet('https://example.zendesk.com/api/v2/tickets/1.json').reply(200, {
            ticket: {
                id: 1,
                url: 'https://example.zendesk.com/api/v2/tickets/1.json',
                subject: 'Help with product',
                description: 'I need help with your product',
                status: ZendeskTicketStatus.OPEN,
                priority: 'normal',
                created_at: '2023-01-01T00:00:00Z',
                updated_at: '2023-01-02T00:00:00Z'
            }
        });

        const input = {
            action: 'get_ticket',
            email: 'agent@example.com',
            token: 'test-token',
            subdomain: 'example',
            ticketId: '1'
        };

        // Pass the axiosInstance in the context
        const result = await executeZendesk(input, { axiosInstance });

        expect(result).toEqual({
            id: 1,
            url: 'https://example.zendesk.com/api/v2/tickets/1.json',
            subject: 'Help with product',
            description: 'I need help with your product',
            status: ZendeskTicketStatus.OPEN,
            priority: 'normal',
            created_at: '2023-01-01T00:00:00Z',
            updated_at: '2023-01-02T00:00:00Z'
        });
    });

    it('should create a ticket successfully', async () => {
        // Mock the create ticket endpoint
        mock.onPost('https://example.zendesk.com/api/v2/tickets.json').reply(200, {
            ticket: {
                id: 1,
                url: 'https://example.zendesk.com/api/v2/tickets/1.json',
                subject: 'New ticket',
                description: 'This is a new ticket',
                status: ZendeskTicketStatus.NEW,
                priority: 'normal',
                created_at: '2023-01-01T00:00:00Z',
                updated_at: '2023-01-01T00:00:00Z'
            }
        });

        const ticketData = {
            subject: 'New ticket',
            description: 'This is a new ticket',
            priority: 'normal'
        };

        const input = {
            action: 'create_ticket',
            email: 'agent@example.com',
            token: 'test-token',
            subdomain: 'example',
            ticketData
        };

        // Pass the axiosInstance in the context
        const result = await executeZendesk(input, { axiosInstance });

        expect(result).toEqual({
            id: 1,
            url: 'https://example.zendesk.com/api/v2/tickets/1.json',
            subject: 'New ticket',
            description: 'This is a new ticket',
            status: ZendeskTicketStatus.NEW,
            priority: 'normal',
            created_at: '2023-01-01T00:00:00Z',
            updated_at: '2023-01-01T00:00:00Z'
        });
    });

    it('should add a comment to a ticket successfully', async () => {
        // Mock the update ticket endpoint (used for adding comments)
        mock.onPut('https://example.zendesk.com/api/v2/tickets/1.json').reply(200, {
            ticket: {
                id: 1,
                url: 'https://example.zendesk.com/api/v2/tickets/1.json',
                subject: 'Help with product',
                description: 'I need help with your product',
                status: ZendeskTicketStatus.OPEN,
                priority: 'normal',
                created_at: '2023-01-01T00:00:00Z',
                updated_at: '2023-01-02T00:00:00Z'
            }
        });

        const input = {
            action: 'add_ticket_comment',
            email: 'agent@example.com',
            token: 'test-token',
            subdomain: 'example',
            ticketId: '1',
            comment: 'This is a comment',
            isPublic: true
        };

        // Pass the axiosInstance in the context
        const result = await executeZendesk(input, { axiosInstance });

        expect(result).toEqual({
            id: 1,
            url: 'https://example.zendesk.com/api/v2/tickets/1.json',
            subject: 'Help with product',
            description: 'I need help with your product',
            status: ZendeskTicketStatus.OPEN,
            priority: 'normal',
            created_at: '2023-01-01T00:00:00Z',
            updated_at: '2023-01-02T00:00:00Z'
        });
    });

    it('should search tickets successfully', async () => {
        // Mock the search endpoint
        mock.onGet('https://example.zendesk.com/api/v2/search.json').reply(200, {
            results: [
                {
                    id: 1,
                    url: 'https://example.zendesk.com/api/v2/tickets/1.json',
                    subject: 'Help with product',
                    description: 'I need help with your product',
                    status: ZendeskTicketStatus.OPEN,
                    priority: 'normal',
                    created_at: '2023-01-01T00:00:00Z',
                    updated_at: '2023-01-02T00:00:00Z'
                }
            ]
        });

        const input = {
            action: 'search_tickets',
            email: 'agent@example.com',
            token: 'test-token',
            subdomain: 'example',
            searchQuery: 'status:open'
        };

        // Pass the axiosInstance in the context
        const result = await executeZendesk(input, { axiosInstance });

        expect(result).toEqual([
            {
                id: 1,
                url: 'https://example.zendesk.com/api/v2/tickets/1.json',
                subject: 'Help with product',
                description: 'I need help with your product',
                status: ZendeskTicketStatus.OPEN,
                priority: 'normal',
                created_at: '2023-01-01T00:00:00Z',
                updated_at: '2023-01-02T00:00:00Z'
            }
        ]);
    });

    it('should get views successfully', async () => {
        // Mock the views endpoint
        mock.onGet('https://example.zendesk.com/api/v2/views.json').reply(200, {
            views: [
                {
                    id: 12345,
                    title: 'Open Tickets',
                    description: 'All open tickets',
                    active: true,
                    updated_at: '2023-01-01T00:00:00Z',
                    created_at: '2023-01-01T00:00:00Z',
                    position: 1
                }
            ]
        });

        const input = {
            action: 'get_views',
            email: 'agent@example.com',
            token: 'test-token',
            subdomain: 'example'
        };

        // Pass the axiosInstance in the context
        const result = await executeZendesk(input, { axiosInstance });

        expect(result).toEqual([
            {
                id: 12345,
                title: 'Open Tickets',
                description: 'All open tickets',
                active: true,
                updated_at: '2023-01-01T00:00:00Z',
                created_at: '2023-01-01T00:00:00Z',
                position: 1
            }
        ]);
    });

    it('should process a webhook payload successfully', async () => {
        const webhookPayload = {
            id: 1,
            title: 'Ticket Created',
            url: 'https://example.zendesk.com/api/v2/tickets/1.json',
            created_at: '2023-01-01T00:00:00Z',
            updated_at: '2023-01-01T00:00:00Z',
            ticket: {
                id: 1,
                subject: 'Help with product',
                description: 'I need help with your product'
            }
        };

        const input = {
            action: 'process_webhook',
            email: 'agent@example.com',
            token: 'test-token',
            subdomain: 'example',
            webhookPayload
        };

        // Pass the axiosInstance in the context
        const result = await executeZendesk(input, { axiosInstance });

        expect(result).toEqual({
            processed: true,
            data: webhookPayload
        });
    });

    it('should throw an error for invalid action', async () => {
        const input = {
            action: 'invalid_action',
            email: 'agent@example.com',
            token: 'test-token',
            subdomain: 'example'
        };

        // Pass the axiosInstance in the context
        await expect(executeZendesk(input, { axiosInstance })).rejects.toThrow('Unsupported action: invalid_action');
    });

    it('should throw an error for missing required parameters', async () => {
        const input = {
            action: 'get_ticket',
            email: 'agent@example.com',
            token: 'test-token',
            subdomain: 'example'
            // Missing ticketId
        };

        // Pass the axiosInstance in the context
        await expect(executeZendesk(input, { axiosInstance })).rejects.toThrow('Missing required parameter: ticketId');
    });
});
