import axios, { AxiosInstance } from 'axios';
import { MailchimpAuth, MailchimpList, MailchimpMember, MailchimpTag, MailchimpWebhookEvent } from './models.js';
import crypto from 'crypto';

export class MailchimpClient {
    private axiosInstance: AxiosInstance;
    private baseUrl: string = '';
    private server: string;

    constructor(private auth: MailchimpAuth, axiosInstance?: AxiosInstance) {
        this.axiosInstance = axiosInstance || axios;
        this.server = '';
    }

    /**
     * Initialize the client by getting the server prefix
     */
    async initialize(): Promise<void> {
        this.server = await this.getServerPrefix();
        this.baseUrl = `https://${this.server}.api.mailchimp.com/3.0`;
    }

    /**
     * Get the Mailchimp server prefix from the metadata endpoint
     */
    private async getServerPrefix(): Promise<string> {
        const response = await this.axiosInstance({
            method: 'get',
            url: 'https://login.mailchimp.com/oauth2/metadata',
            headers: {
                'Authorization': `OAuth ${this.auth.access_token}`
            }
        });
        return response.data.dc;
    }

    /**
     * Get all lists (audiences) for the authenticated user
     */
    async getLists(): Promise<MailchimpList[]> {
        const response = await this.sendRequest({
            method: 'get',
            url: '/lists',
            params: {
                fields: 'lists.id,lists.name,lists.stats,total_items',
                count: 1000
            }
        });
        return response.data.lists;
    }

    /**
     * Get a specific list by ID
     */
    async getList(listId: string): Promise<MailchimpList> {
        const response = await this.sendRequest({
            method: 'get',
            url: `/lists/${listId}`
        });
        return response.data;
    }

    /**
     * Add a member to a list
     */
    async addMemberToList(listId: string, data: {
        email_address: string;
        status: string;
        merge_fields?: Record<string, any>;
        tags?: string[];
    }): Promise<MailchimpMember> {
        const response = await this.sendRequest({
            method: 'post',
            url: `/lists/${listId}/members`,
            data
        });
        return response.data;
    }

    /**
     * Update a member in a list
     */
    async updateMember(listId: string, subscriberHash: string, data: {
        email_address?: string;
        status?: string;
        merge_fields?: Record<string, any>;
    }): Promise<MailchimpMember> {
        const response = await this.sendRequest({
            method: 'patch',
            url: `/lists/${listId}/members/${subscriberHash}`,
            data
        });
        return response.data;
    }

    /**
     * Add a note to a subscriber
     */
    async addNoteToSubscriber(listId: string, subscriberHash: string, note: string): Promise<any> {
        const response = await this.sendRequest({
            method: 'post',
            url: `/lists/${listId}/members/${subscriberHash}/notes`,
            data: {
                note
            }
        });
        return response.data;
    }

    /**
     * Get all tags for a list
     */
    async getListTags(listId: string): Promise<MailchimpTag[]> {
        const response = await this.sendRequest({
            method: 'get',
            url: `/lists/${listId}/tag-search`,
            params: {
                count: 1000
            }
        });
        return response.data.tags;
    }

    /**
     * Add a tag to a subscriber
     */
    async addTagToSubscriber(listId: string, subscriberHash: string, tagName: string): Promise<void> {
        await this.sendRequest({
            method: 'post',
            url: `/lists/${listId}/members/${subscriberHash}/tags`,
            data: {
                tags: [
                    {
                        name: tagName,
                        status: 'active'
                    }
                ]
            }
        });
    }

    /**
     * Remove a tag from a subscriber
     */
    async removeTagFromSubscriber(listId: string, subscriberHash: string, tagName: string): Promise<void> {
        await this.sendRequest({
            method: 'post',
            url: `/lists/${listId}/members/${subscriberHash}/tags`,
            data: {
                tags: [
                    {
                        name: tagName,
                        status: 'inactive'
                    }
                ]
            }
        });
    }

    /**
     * Create a webhook for a list
     */
    async createWebhook(listId: string, webhookUrl: string, events: MailchimpWebhookEvent): Promise<{ id: string }> {
        const response = await this.sendRequest({
            method: 'post',
            url: `/lists/${listId}/webhooks`,
            data: {
                url: webhookUrl,
                events,
                sources: {
                    user: true,
                    admin: true,
                    api: true
                }
            }
        });
        return { id: response.data.id };
    }

    /**
     * Delete a webhook
     */
    async deleteWebhook(listId: string, webhookId: string): Promise<void> {
        await this.sendRequest({
            method: 'delete',
            url: `/lists/${listId}/webhooks/${webhookId}`
        });
    }

    /**
     * Get MD5 hash of an email address (used for subscriber lookup)
     */
    getMD5Hash(email: string): string {
        return crypto.createHash('md5').update(email.toLowerCase()).digest('hex');
    }

    /**
     * Send a request to the Mailchimp API
     */
    private async sendRequest(config: any): Promise<any> {
        return this.axiosInstance({
            ...config,
            url: `${this.baseUrl}${config.url}`,
            headers: {
                'Authorization': `Bearer ${this.auth.access_token}`,
                'Content-Type': 'application/json',
                ...config.headers
            }
        });
    }
}
