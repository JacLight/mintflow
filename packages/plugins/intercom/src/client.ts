import axios, { AxiosInstance } from 'axios';
import { IntercomAuth, IntercomAdmin, IntercomContact, IntercomUser, IntercomLead, IntercomCompany, IntercomTag, IntercomConversation, IntercomArticle, IntercomTicket, IntercomMessage } from './models.js';

export class IntercomClient {
    private axiosInstance: AxiosInstance;
    private baseUrl: string;
    private auth: IntercomAuth;

    constructor(auth: IntercomAuth, axiosInstance?: AxiosInstance) {
        this.auth = auth;
        this.baseUrl = `https://api.${auth.region}.io`;
        this.axiosInstance = axiosInstance || axios.create({
            baseURL: this.baseUrl,
            headers: {
                'Authorization': `Bearer ${auth.accessToken}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });
    }

    /**
     * List all admins
     */
    async listAdmins(): Promise<{ admins: IntercomAdmin[] }> {
        const response = await this.sendRequest({
            method: 'get',
            url: '/admins'
        });
        return response.data;
    }

    /**
     * Get a specific admin
     */
    async getAdmin(adminId: string): Promise<IntercomAdmin> {
        const response = await this.sendRequest({
            method: 'get',
            url: `/admins/${adminId}`
        });
        return response.data;
    }

    /**
     * List all contacts (users and leads)
     */
    async listContacts(params?: { page?: number; per_page?: number; sort?: string; order?: 'asc' | 'desc' }): Promise<{ data: IntercomContact[] }> {
        const response = await this.sendRequest({
            method: 'get',
            url: '/contacts',
            params
        });
        return response.data;
    }

    /**
     * Find a contact by ID
     */
    async findContact(contactId: string): Promise<IntercomContact> {
        const response = await this.sendRequest({
            method: 'get',
            url: `/contacts/${contactId}`
        });
        return response.data;
    }

    /**
     * Search for contacts
     */
    async searchContacts(query: string): Promise<{ data: IntercomContact[] }> {
        const response = await this.sendRequest({
            method: 'post',
            url: '/contacts/search',
            data: { query }
        });
        return response.data;
    }

    /**
     * Create a new user
     */
    async createUser(user: Partial<IntercomUser>): Promise<IntercomUser> {
        const response = await this.sendRequest({
            method: 'post',
            url: '/contacts',
            data: { ...user, role: 'user' }
        });
        return response.data;
    }

    /**
     * Update a user
     */
    async updateUser(userId: string, user: Partial<IntercomUser>): Promise<IntercomUser> {
        const response = await this.sendRequest({
            method: 'put',
            url: `/contacts/${userId}`,
            data: user
        });
        return response.data;
    }

    /**
     * Create or update a user
     */
    async createOrUpdateUser(user: Partial<IntercomUser>): Promise<IntercomUser> {
        const response = await this.sendRequest({
            method: 'post',
            url: '/contacts',
            data: { ...user, role: 'user' }
        });
        return response.data;
    }

    /**
     * Create or update a lead
     */
    async createOrUpdateLead(lead: Partial<IntercomLead>): Promise<IntercomLead> {
        const response = await this.sendRequest({
            method: 'post',
            url: '/contacts',
            data: { ...lead, role: 'lead' }
        });
        return response.data;
    }

    /**
     * Add a note to a user
     */
    async addNoteToUser(userId: string, body: string): Promise<{ type: 'note'; id: string; body: string; }> {
        const response = await this.sendRequest({
            method: 'post',
            url: `/contacts/${userId}/notes`,
            data: { body }
        });
        return response.data;
    }

    /**
     * List all companies
     */
    async listCompanies(params?: { page?: number; per_page?: number; }): Promise<{ data: IntercomCompany[] }> {
        const response = await this.sendRequest({
            method: 'get',
            url: '/companies',
            params
        });
        return response.data;
    }

    /**
     * Find a company by ID
     */
    async findCompany(companyId: string): Promise<IntercomCompany> {
        const response = await this.sendRequest({
            method: 'get',
            url: `/companies/${companyId}`
        });
        return response.data;
    }

    /**
     * Search for companies
     */
    async searchCompanies(query: string): Promise<{ data: IntercomCompany[] }> {
        const response = await this.sendRequest({
            method: 'post',
            url: '/companies/search',
            data: { query }
        });
        return response.data;
    }

    /**
     * List all tags
     */
    async listTags(): Promise<{ data: IntercomTag[] }> {
        const response = await this.sendRequest({
            method: 'get',
            url: '/tags'
        });
        return response.data;
    }

    /**
     * Add a tag to a contact
     */
    async addTagToContact(contactId: string, tagId: string): Promise<IntercomContact> {
        const response = await this.sendRequest({
            method: 'post',
            url: `/contacts/${contactId}/tags`,
            data: { id: tagId }
        });
        return response.data;
    }

    /**
     * Remove a tag from a contact
     */
    async removeTagFromContact(contactId: string, tagId: string): Promise<IntercomContact> {
        const response = await this.sendRequest({
            method: 'delete',
            url: `/contacts/${contactId}/tags/${tagId}`
        });
        return response.data;
    }

    /**
     * Add a tag to a company
     */
    async addTagToCompany(companyId: string, tagId: string): Promise<IntercomCompany> {
        const response = await this.sendRequest({
            method: 'post',
            url: `/companies/${companyId}/tags`,
            data: { id: tagId }
        });
        return response.data;
    }

    /**
     * Remove a tag from a company
     */
    async removeTagFromCompany(companyId: string, tagId: string): Promise<IntercomCompany> {
        const response = await this.sendRequest({
            method: 'delete',
            url: `/companies/${companyId}/tags/${tagId}`
        });
        return response.data;
    }

    /**
     * List all conversations
     */
    async listConversations(params?: { page?: number; per_page?: number; }): Promise<{ conversations: IntercomConversation[] }> {
        const response = await this.sendRequest({
            method: 'get',
            url: '/conversations',
            params
        });
        return response.data;
    }

    /**
     * Get a specific conversation
     */
    async getConversation(conversationId: string): Promise<IntercomConversation> {
        const response = await this.sendRequest({
            method: 'get',
            url: `/conversations/${conversationId}`
        });
        return response.data;
    }

    /**
     * Search for conversations
     */
    async searchConversations(query: string): Promise<{ conversations: IntercomConversation[] }> {
        const response = await this.sendRequest({
            method: 'post',
            url: '/conversations/search',
            data: { query }
        });
        return response.data;
    }

    /**
     * Create a new conversation
     */
    async createConversation(conversation: {
        from: { type: string; id: string; };
        to: { type: string; id: string; };
        body: string;
    }): Promise<IntercomConversation> {
        const response = await this.sendRequest({
            method: 'post',
            url: '/conversations',
            data: conversation
        });
        return response.data;
    }

    /**
     * Reply to a conversation
     */
    async replyToConversation(conversationId: string, reply: {
        type: 'admin' | 'user';
        message_type?: 'comment' | 'note';
        body: string;
        attachment_urls?: string[];
    }): Promise<IntercomConversation> {
        const response = await this.sendRequest({
            method: 'post',
            url: `/conversations/${conversationId}/reply`,
            data: reply
        });
        return response.data;
    }

    /**
     * Add a note to a conversation
     */
    async addNoteToConversation(conversationId: string, body: string): Promise<IntercomConversation> {
        return this.replyToConversation(conversationId, {
            type: 'admin',
            message_type: 'note',
            body
        });
    }

    /**
     * Add a tag to a conversation
     */
    async addTagToConversation(conversationId: string, tagId: string): Promise<IntercomConversation> {
        const response = await this.sendRequest({
            method: 'post',
            url: `/conversations/${conversationId}/tags`,
            data: { id: tagId }
        });
        return response.data;
    }

    /**
     * Remove a tag from a conversation
     */
    async removeTagFromConversation(conversationId: string, tagId: string): Promise<IntercomConversation> {
        const response = await this.sendRequest({
            method: 'delete',
            url: `/conversations/${conversationId}/tags/${tagId}`
        });
        return response.data;
    }

    /**
     * Create an article
     */
    async createArticle(article: {
        title: string;
        description?: string;
        body: string;
        author_id: string;
        state?: 'published' | 'draft';
        parent_id?: string;
        parent_type?: string;
        translated_content?: Record<string, {
            title: string;
            description?: string;
            body: string;
        }>;
    }): Promise<IntercomArticle> {
        const response = await this.sendRequest({
            method: 'post',
            url: '/articles',
            data: article
        });
        return response.data;
    }

    /**
     * Create a ticket
     */
    async createTicket(ticket: {
        title: string;
        admin_assignee_id?: string;
        team_assignee_id?: string;
        contact_id: string;
        state?: 'in_progress' | 'waiting_on_customer' | 'waiting_on_us' | 'resolved';
        priority?: 'urgent' | 'high' | 'normal' | 'low';
        custom_attributes?: Record<string, any>;
    }): Promise<IntercomTicket> {
        const response = await this.sendRequest({
            method: 'post',
            url: '/tickets',
            data: ticket
        });
        return response.data;
    }

    /**
     * Update a ticket
     */
    async updateTicket(ticketId: string, ticket: {
        title?: string;
        admin_assignee_id?: string;
        team_assignee_id?: string;
        state?: 'in_progress' | 'waiting_on_customer' | 'waiting_on_us' | 'resolved';
        priority?: 'urgent' | 'high' | 'normal' | 'low';
        custom_attributes?: Record<string, any>;
    }): Promise<IntercomTicket> {
        const response = await this.sendRequest({
            method: 'put',
            url: `/tickets/${ticketId}`,
            data: ticket
        });
        return response.data;
    }

    /**
     * Send a message
     */
    async sendMessage(message: IntercomMessage): Promise<any> {
        const response = await this.sendRequest({
            method: 'post',
            url: '/messages',
            data: message
        });
        return response.data;
    }

    /**
     * Send a request to the Intercom API
     */
    private async sendRequest(config: any): Promise<any> {
        try {
            return await this.axiosInstance(config);
        } catch (error: any) {
            if (error.response) {
                throw new Error(`Intercom API error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
            }
            throw error;
        }
    }
}
