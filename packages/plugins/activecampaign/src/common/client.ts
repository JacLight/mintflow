import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import {
    AccountCustomFieldsResponse,
    ContactCustomFieldsResponse,
    ContactList,
    CreateAccountRequest,
    CreateContactRequest,
    CreateWebhookRequest,
    CreateWebhookResponse,
    ListAccountsResponse,
    ListContactsResponse,
    ListTagsResponse,
} from './types.js';

function emptyValueFilter(accessor: (key: string) => any): (key: string) => boolean {
    return (key: string) => {
        const val = accessor(key);
        return val !== null && val !== undefined && (typeof val != 'string' || val.length > 0);
    };
}

export function prepareQuery(request?: Record<string, any>): Record<string, string> {
    const params: Record<string, string> = {};
    if (!request) return params;
    Object.keys(request)
        .filter(emptyValueFilter((k) => request[k]))
        .forEach((k: string) => {
            params[k] = (request as Record<string, any>)[k].toString();
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

    async makeRequest<T>(
        method: string,
        resourceUri: string,
        query?: Record<string, string>,
        body: any | undefined = undefined,
    ): Promise<T> {
        const config: AxiosRequestConfig = {
            method,
            url: resourceUri,
            params: query,
            data: body,
        };

        const res = await this.client.request<T>(config);
        return res.data;
    }

    async authenticate() {
        return await this.makeRequest('GET', '/users/me');
    }

    async subscribeWebhook(request: CreateWebhookRequest): Promise<CreateWebhookResponse> {
        return await this.makeRequest<CreateWebhookResponse>('POST', '/webhooks', undefined, {
            webhook: request,
        });
    }

    async unsubscribeWebhook(webhookId: string) {
        return await this.makeRequest('DELETE', `/webhooks/${webhookId}`);
    }

    async listContactLists() {
        return await this.makeRequest<{ lists: ContactList[] }>(
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
}
