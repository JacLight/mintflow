import axios, { AxiosInstance } from 'axios';
import { ZendeskAuth, ZendeskTicket, ZendeskView } from './models.js';

export class ZendeskClient {
    private axiosInstance: AxiosInstance;
    private baseUrl: string;
    private auth: ZendeskAuth;

    constructor(auth: ZendeskAuth, axiosInstance?: AxiosInstance) {
        this.auth = auth;
        this.axiosInstance = axiosInstance || axios;
        this.baseUrl = `https://${auth.subdomain}.zendesk.com/api/v2`;
    }

    /**
     * Get all views
     */
    async getViews(): Promise<ZendeskView[]> {
        const response = await this.sendRequest({
            method: 'get',
            url: '/views.json'
        });
        return response.data.views;
    }

    /**
     * Get a specific view by ID
     */
    async getView(viewId: string): Promise<ZendeskView> {
        const response = await this.sendRequest({
            method: 'get',
            url: `/views/${viewId}.json`
        });
        return response.data.view;
    }

    /**
     * Get tickets from a specific view
     */
    async getTicketsFromView(viewId: string, options?: {
        sortOrder?: 'asc' | 'desc',
        sortBy?: string,
        perPage?: number
    }): Promise<ZendeskTicket[]> {
        const sortOrder = options?.sortOrder || 'desc';
        const sortBy = options?.sortBy || 'created_at';
        const perPage = options?.perPage || 100;

        const response = await this.sendRequest({
            method: 'get',
            url: `/views/${viewId}/tickets.json`,
            params: {
                sort_order: sortOrder,
                sort_by: sortBy,
                per_page: perPage
            }
        });
        return response.data.tickets;
    }

    /**
     * Get a specific ticket by ID
     */
    async getTicket(ticketId: string): Promise<ZendeskTicket> {
        const response = await this.sendRequest({
            method: 'get',
            url: `/tickets/${ticketId}.json`
        });
        return response.data.ticket;
    }

    /**
     * Create a new ticket
     */
    async createTicket(ticket: Partial<ZendeskTicket>): Promise<ZendeskTicket> {
        const response = await this.sendRequest({
            method: 'post',
            url: '/tickets.json',
            data: { ticket }
        });
        return response.data.ticket;
    }

    /**
     * Update an existing ticket
     */
    async updateTicket(ticketId: string, ticket: Partial<ZendeskTicket>): Promise<ZendeskTicket> {
        const response = await this.sendRequest({
            method: 'put',
            url: `/tickets/${ticketId}.json`,
            data: { ticket }
        });
        return response.data.ticket;
    }

    /**
     * Delete a ticket
     */
    async deleteTicket(ticketId: string): Promise<void> {
        await this.sendRequest({
            method: 'delete',
            url: `/tickets/${ticketId}.json`
        });
    }

    /**
     * Get all users
     */
    async getUsers(): Promise<any[]> {
        const response = await this.sendRequest({
            method: 'get',
            url: '/users.json'
        });
        return response.data.users;
    }

    /**
     * Get a specific user by ID
     */
    async getUser(userId: string): Promise<any> {
        const response = await this.sendRequest({
            method: 'get',
            url: `/users/${userId}.json`
        });
        return response.data.user;
    }

    /**
     * Get all groups
     */
    async getGroups(): Promise<any[]> {
        const response = await this.sendRequest({
            method: 'get',
            url: '/groups.json'
        });
        return response.data.groups;
    }

    /**
     * Get a specific group by ID
     */
    async getGroup(groupId: string): Promise<any> {
        const response = await this.sendRequest({
            method: 'get',
            url: `/groups/${groupId}.json`
        });
        return response.data.group;
    }

    /**
     * Add a comment to a ticket
     */
    async addTicketComment(ticketId: string, comment: { body: string, public?: boolean }): Promise<ZendeskTicket> {
        const response = await this.sendRequest({
            method: 'put',
            url: `/tickets/${ticketId}.json`,
            data: {
                ticket: {
                    comment: {
                        body: comment.body,
                        public: comment.public !== undefined ? comment.public : true
                    }
                }
            }
        });
        return response.data.ticket;
    }

    /**
     * Get all organizations
     */
    async getOrganizations(): Promise<any[]> {
        const response = await this.sendRequest({
            method: 'get',
            url: '/organizations.json'
        });
        return response.data.organizations;
    }

    /**
     * Get a specific organization by ID
     */
    async getOrganization(organizationId: string): Promise<any> {
        const response = await this.sendRequest({
            method: 'get',
            url: `/organizations/${organizationId}.json`
        });
        return response.data.organization;
    }

    /**
     * Search tickets
     */
    async searchTickets(query: string): Promise<ZendeskTicket[]> {
        const response = await this.sendRequest({
            method: 'get',
            url: '/search.json',
            params: {
                query: `type:ticket ${query}`
            }
        });
        return response.data.results;
    }

    /**
     * Send a request to the Zendesk API
     */
    private async sendRequest(config: any): Promise<any> {
        const authString = Buffer.from(`${this.auth.email}/token:${this.auth.token}`).toString('base64');

        return this.axiosInstance({
            ...config,
            url: `${this.baseUrl}${config.url}`,
            headers: {
                'Authorization': `Basic ${authString}`,
                'Content-Type': 'application/json',
                ...config.headers
            }
        });
    }
}
