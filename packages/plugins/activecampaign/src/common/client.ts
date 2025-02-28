import axios, { AxiosInstance } from 'axios';
import {
    AccountCustomFieldsResponse,
    ContactCustomFieldsResponse,
    CreateAccountRequest,
    CreateContactRequest,
    CreateWebhookRequest,
    CreateWebhookResponse,
    ListAccountsResponse,
    ListContactsResponse,
    ListTagsResponse,
} from './types.js';

export function prepareQuery(request?: Record<string, any>): Record<string, string> {
    const params: Record<string, string> = {};
    if (!request) return params;

    Object.keys(request)
        .filter(key => {
            const val = request[key];
            return val !== null && val !== undefined && (typeof val !== 'string' || val.length > 0);
        })
        .forEach((key: string) => {
            params[key] = request[key].toString();
        });

    return params;
}

export class ActiveCampaignClient {
    private client: AxiosInstance;

    constructor(private apiUrl: string, private apiKey: string) {
        this.client = axios.create({
            baseURL: this.apiUrl.replace(/\/$/, '') + '/api/3',
            headers: {
                'Api-Token': this.apiKey,
                'Content-Type': 'application/json',
            },
        });
    }

    async authenticate() {
        return await this.makeRequest('GET', '/users/me');
    }

    async subscribeWebhook(request: CreateWebhookRequest): Promise<CreateWebhookResponse> {
        return await this.makeRequest('POST', '/webhooks', undefined, {
            webhook: request,
        });
    }

    async unsubscribeWebhook(webhookId: string) {
        return await this.makeRequest('DELETE', `/webhooks/${webhookId}`);
    }

    async listContactLists() {
        return await this.makeRequest<{ lists: { id: string; name: string }[] }>(
            'GET',
            '/lists',
            prepareQuery({ limit: 20 }),
        );
    }

    async createAccount(request: CreateAccountRequest) {
        return await this.makeRequest('POST', '/accounts', undefined, { account: request });
    }

    async updateAccount(accountId: number, request: Partial<CreateAccountRequest>) {
        return await this.makeRequest('PUT', `/accounts/${accountId}`, undefined, {
            account: request,
        });
    }

    async listAccounts(search?: string): Promise<ListAccountsResponse> {
        return await this.makeRequest<ListAccountsResponse>(
            'GET',
            '/accounts',
            prepareQuery({ search: search }),
        );
    }

    async listAccountCustomFields() {
        return await this.makeRequest<{ accountCustomFieldMeta: AccountCustomFieldsResponse[] }>(
            'GET',
            '/accountCustomFieldMeta',
        );
    }

    async createContact(request: CreateContactRequest) {
        return await this.makeRequest('POST', '/contacts', undefined, { contact: request });
    }

    async updateContact(contactId: number, request: Partial<CreateContactRequest>) {
        return await this.makeRequest('PUT', `/contacts/${contactId}`, undefined, {
            contact: request,
        });
    }

    async listContacts(): Promise<ListContactsResponse> {
        return await this.makeRequest<ListContactsResponse>('GET', '/contacts');
    }

    async listContactCustomFields(): Promise<ContactCustomFieldsResponse> {
        return await this.makeRequest<ContactCustomFieldsResponse>('GET', '/fields');
    }

    async addContactToList(listId: string, contactId: string, status: string) {
        return await this.makeRequest('POST', '/contactLists', undefined, {
            contactList: { list: listId, contact: contactId, status: status },
        });
    }

    async createAccountContactAssociation(contactId: number, accountId: number, jobTitle?: string) {
        return await this.makeRequest('POST', '/accountContacts', undefined, {
            accountContact: { contact: contactId, account: accountId, jobTitle: jobTitle },
        });
    }

    async addTagToContact(contactId: string, tagId: string) {
        return await this.makeRequest('POST', '/contactTags', undefined, {
            contactTag: { contact: contactId, tag: tagId },
        });
    }

    async listTags(): Promise<ListTagsResponse> {
        return await this.makeRequest<ListTagsResponse>('GET', '/tags');
    }

    private async makeRequest<T = any>(
        method: string,
        endpoint: string,
        params?: Record<string, string>,
        data?: any,
    ): Promise<T> {
        try {
            const response = await this.client.request<T>({
                method,
                url: endpoint,
                params,
                data,
            });
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(`ActiveCampaign API Error: ${error.response?.data?.message || error.message}`);
            }
            throw error;
        }
    }
}
