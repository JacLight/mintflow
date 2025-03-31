import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import FormData from 'form-data';
import {
    Activity,
    Deal,
    Field,
    Lead,
    Note,
    Organization,
    PaginatedResponse,
    PipedriveAuth,
    PipedriveResponse,
    Product,
    RequestParams,
    StageWithPipelineInfo,
    User,
    WebhookCreateResponse
} from './models.js';

export class PipedriveClient {
    private client: AxiosInstance;
    private baseUrl: string;
    private accessToken: string;

    constructor(auth: PipedriveAuth) {
        this.accessToken = auth.access_token;
        this.baseUrl = `${auth.data.api_domain}/api/v1`;

        this.client = axios.create({
            baseURL: this.baseUrl,
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json'
            }
        });
    }

    /**
     * Make a request to the Pipedrive API
     */
    private async request<T>(
        method: string,
        endpoint: string,
        params?: RequestParams,
        data?: any
    ): Promise<T> {
        const config: AxiosRequestConfig = {
            method,
            url: endpoint,
            params: params ? this.cleanParams(params) : undefined,
            data: data ? this.cleanData(data) : undefined
        };

        try {
            const response: AxiosResponse<T> = await this.client(config);
            return response.data;
        } catch (error: any) {
            if (error.response && error.response.status === 403) {
                throw new Error('Please reconnect your Pipedrive account.');
            }
            throw error;
        }
    }

    /**
     * Make a paginated request to the Pipedrive API
     */
    private async paginatedRequest<T>(
        method: string,
        endpoint: string,
        params?: RequestParams,
        data?: any
    ): Promise<T[]> {
        const qs = params ? { ...params } : {};
        qs.start = 0;
        qs.limit = 100;

        const resultData: T[] = [];
        let hasMoreItems = true;

        do {
            const response = await this.request<PaginatedResponse<T>>(
                method,
                endpoint,
                qs,
                data
            );

            if (!response.data || response.data.length === 0) {
                break;
            }

            resultData.push(...response.data);

            if (response.additional_data && response.additional_data.pagination) {
                qs.start = response.additional_data.pagination.next_start;
                hasMoreItems = response.additional_data.pagination.more_items_in_collection;
            } else {
                hasMoreItems = false;
            }
        } while (hasMoreItems);

        return resultData;
    }

    /**
     * Clean parameters by removing undefined and null values
     */
    private cleanParams(params: RequestParams): RequestParams {
        const cleanedParams: RequestParams = {};

        for (const [key, value] of Object.entries(params)) {
            if (value !== null && value !== undefined) {
                cleanedParams[key] = value;
            }
        }

        return cleanedParams;
    }

    /**
     * Clean data by removing undefined and null values
     */
    private cleanData(data: any): any {
        if (!data) return undefined;

        return Object.entries(data).reduce((acc, [key, value]) => {
            if (value !== null && value !== undefined) {
                acc[key] = value;
            }
            return acc;
        }, {} as Record<string, any>);
    }

    /**
     * Transform custom fields in response data
     */
    public transformCustomFields(customFields: Field[], responseData: Record<string, any>): Record<string, any> {
        const updatedResponseData = { ...responseData };

        for (const field of customFields) {
            if (!field.edit_flag) {
                continue;
            }

            const oldKey = field.key;
            const newKey = field.name;
            const fieldType = field.field_type;

            if (oldKey in responseData) {
                if (responseData[oldKey] === null || responseData[oldKey] === undefined) {
                    updatedResponseData[newKey] = null;
                } else if (fieldType === 'enum') {
                    updatedResponseData[newKey] =
                        field.options?.find((option) => option.id.toString() === responseData[oldKey])?.label ||
                        null;
                } else if (fieldType === 'set') {
                    const values: string[] = responseData[oldKey].split(',');
                    updatedResponseData[newKey] = values.map(
                        (item) => field.options?.find((option) => option.id.toString() === item)?.label || null,
                    );
                } else {
                    updatedResponseData[newKey] = responseData[oldKey];
                }
                delete updatedResponseData[oldKey];
            }
        }

        return updatedResponseData;
    }

    // Person endpoints
    async listPersons(params?: RequestParams): Promise<PaginatedResponse<Record<string, any>>> {
        return this.request<PaginatedResponse<Record<string, any>>>(
            'GET',
            '/persons',
            params
        );
    }

    async getPerson(id: number): Promise<PipedriveResponse<Record<string, any>>> {
        return this.request<PipedriveResponse<Record<string, any>>>(
            'GET',
            `/persons/${id}`
        );
    }

    async createPerson(data: any): Promise<PipedriveResponse<Record<string, any>>> {
        return this.request<PipedriveResponse<Record<string, any>>>(
            'POST',
            '/persons',
            undefined,
            data
        );
    }

    async updatePerson(id: number, data: any): Promise<PipedriveResponse<Record<string, any>>> {
        return this.request<PipedriveResponse<Record<string, any>>>(
            'PUT',
            `/persons/${id}`,
            undefined,
            data
        );
    }

    async findPersons(params: RequestParams): Promise<PaginatedResponse<Record<string, any>>> {
        return this.request<PaginatedResponse<Record<string, any>>>(
            'GET',
            '/persons/find',
            params
        );
    }

    // Organization endpoints
    async listOrganizations(params?: RequestParams): Promise<PaginatedResponse<Record<string, any>>> {
        return this.request<PaginatedResponse<Record<string, any>>>(
            'GET',
            '/organizations',
            params
        );
    }

    async getOrganization(id: number): Promise<PipedriveResponse<Record<string, any>>> {
        return this.request<PipedriveResponse<Record<string, any>>>(
            'GET',
            `/organizations/${id}`
        );
    }

    async createOrganization(data: any): Promise<PipedriveResponse<Record<string, any>>> {
        return this.request<PipedriveResponse<Record<string, any>>>(
            'POST',
            '/organizations',
            undefined,
            data
        );
    }

    async updateOrganization(id: number, data: any): Promise<PipedriveResponse<Record<string, any>>> {
        return this.request<PipedriveResponse<Record<string, any>>>(
            'PUT',
            `/organizations/${id}`,
            undefined,
            data
        );
    }

    async findOrganizations(params: RequestParams): Promise<PaginatedResponse<Record<string, any>>> {
        return this.request<PaginatedResponse<Record<string, any>>>(
            'GET',
            '/organizations/find',
            params
        );
    }

    // Deal endpoints
    async listDeals(params?: RequestParams): Promise<PaginatedResponse<Record<string, any>>> {
        return this.request<PaginatedResponse<Record<string, any>>>(
            'GET',
            '/deals',
            params
        );
    }

    async getDeal(id: number): Promise<PipedriveResponse<Record<string, any>>> {
        return this.request<PipedriveResponse<Record<string, any>>>(
            'GET',
            `/deals/${id}`
        );
    }

    async createDeal(data: any): Promise<PipedriveResponse<Record<string, any>>> {
        return this.request<PipedriveResponse<Record<string, any>>>(
            'POST',
            '/deals',
            undefined,
            data
        );
    }

    async updateDeal(id: number, data: any): Promise<PipedriveResponse<Record<string, any>>> {
        return this.request<PipedriveResponse<Record<string, any>>>(
            'PUT',
            `/deals/${id}`,
            undefined,
            data
        );
    }

    async findDeals(params: RequestParams): Promise<PaginatedResponse<Record<string, any>>> {
        return this.request<PaginatedResponse<Record<string, any>>>(
            'GET',
            '/deals/find',
            params
        );
    }

    async getDealsForPerson(personId: number): Promise<PaginatedResponse<Record<string, any>>> {
        return this.request<PaginatedResponse<Record<string, any>>>(
            'GET',
            `/persons/${personId}/deals`
        );
    }

    // Lead endpoints
    async listLeads(params?: RequestParams): Promise<PaginatedResponse<Record<string, any>>> {
        return this.request<PaginatedResponse<Record<string, any>>>(
            'GET',
            '/leads',
            params
        );
    }

    async getLead(id: number): Promise<PipedriveResponse<Record<string, any>>> {
        return this.request<PipedriveResponse<Record<string, any>>>(
            'GET',
            `/leads/${id}`
        );
    }

    async createLead(data: any): Promise<PipedriveResponse<Record<string, any>>> {
        return this.request<PipedriveResponse<Record<string, any>>>(
            'POST',
            '/leads',
            undefined,
            data
        );
    }

    async updateLead(id: number, data: any): Promise<PipedriveResponse<Record<string, any>>> {
        return this.request<PipedriveResponse<Record<string, any>>>(
            'PUT',
            `/leads/${id}`,
            undefined,
            data
        );
    }

    // Activity endpoints
    async listActivities(params?: RequestParams): Promise<PaginatedResponse<Record<string, any>>> {
        return this.request<PaginatedResponse<Record<string, any>>>(
            'GET',
            '/activities',
            params
        );
    }

    async getActivity(id: number): Promise<PipedriveResponse<Record<string, any>>> {
        return this.request<PipedriveResponse<Record<string, any>>>(
            'GET',
            `/activities/${id}`
        );
    }

    async createActivity(data: any): Promise<PipedriveResponse<Record<string, any>>> {
        return this.request<PipedriveResponse<Record<string, any>>>(
            'POST',
            '/activities',
            undefined,
            data
        );
    }

    async updateActivity(id: number, data: any): Promise<PipedriveResponse<Record<string, any>>> {
        return this.request<PipedriveResponse<Record<string, any>>>(
            'PUT',
            `/activities/${id}`,
            undefined,
            data
        );
    }

    async findActivities(params: RequestParams): Promise<PaginatedResponse<Record<string, any>>> {
        return this.request<PaginatedResponse<Record<string, any>>>(
            'GET',
            '/activities/find',
            params
        );
    }

    // Product endpoints
    async listProducts(params?: RequestParams): Promise<PaginatedResponse<Record<string, any>>> {
        return this.request<PaginatedResponse<Record<string, any>>>(
            'GET',
            '/products',
            params
        );
    }

    async getProduct(id: number): Promise<PipedriveResponse<Record<string, any>>> {
        return this.request<PipedriveResponse<Record<string, any>>>(
            'GET',
            `/products/${id}`
        );
    }

    async createProduct(data: any): Promise<PipedriveResponse<Record<string, any>>> {
        return this.request<PipedriveResponse<Record<string, any>>>(
            'POST',
            '/products',
            undefined,
            data
        );
    }

    async findProducts(params: RequestParams): Promise<PaginatedResponse<Record<string, any>>> {
        return this.request<PaginatedResponse<Record<string, any>>>(
            'GET',
            '/products/find',
            params
        );
    }

    async addProductToDeal(dealId: number, productId: number, data: any): Promise<PipedriveResponse<Record<string, any>>> {
        return this.request<PipedriveResponse<Record<string, any>>>(
            'POST',
            `/deals/${dealId}/products`,
            undefined,
            { ...data, product_id: productId }
        );
    }

    // Note endpoints
    async listNotes(params?: RequestParams): Promise<PaginatedResponse<Record<string, any>>> {
        return this.request<PaginatedResponse<Record<string, any>>>(
            'GET',
            '/notes',
            params
        );
    }

    async getNote(id: number): Promise<PipedriveResponse<Record<string, any>>> {
        return this.request<PipedriveResponse<Record<string, any>>>(
            'GET',
            `/notes/${id}`
        );
    }

    async createNote(data: any): Promise<PipedriveResponse<Record<string, any>>> {
        return this.request<PipedriveResponse<Record<string, any>>>(
            'POST',
            '/notes',
            undefined,
            data
        );
    }

    async findNotes(params: RequestParams): Promise<PaginatedResponse<Record<string, any>>> {
        return this.request<PaginatedResponse<Record<string, any>>>(
            'GET',
            '/notes/find',
            params
        );
    }

    // User endpoints
    async listUsers(): Promise<PipedriveResponse<User[]>> {
        return this.request<PipedriveResponse<User[]>>(
            'GET',
            '/users'
        );
    }

    async getUser(id: number): Promise<PipedriveResponse<User>> {
        return this.request<PipedriveResponse<User>>(
            'GET',
            `/users/${id}`
        );
    }

    async findUser(params: RequestParams): Promise<PipedriveResponse<User[]>> {
        return this.request<PipedriveResponse<User[]>>(
            'GET',
            '/users/find',
            params
        );
    }

    // Field endpoints
    async getPersonFields(): Promise<Field[]> {
        return this.paginatedRequest<Field>(
            'GET',
            '/personFields'
        );
    }

    async getDealFields(): Promise<Field[]> {
        return this.paginatedRequest<Field>(
            'GET',
            '/dealFields'
        );
    }

    async getOrganizationFields(): Promise<Field[]> {
        return this.paginatedRequest<Field>(
            'GET',
            '/organizationFields'
        );
    }

    async getProductFields(): Promise<Field[]> {
        return this.paginatedRequest<Field>(
            'GET',
            '/productFields'
        );
    }

    // Pipeline and Stage endpoints
    async listPipelines(): Promise<PipedriveResponse<Record<string, any>[]>> {
        return this.request<PipedriveResponse<Record<string, any>[]>>(
            'GET',
            '/pipelines'
        );
    }

    async listStages(): Promise<StageWithPipelineInfo[]> {
        return this.paginatedRequest<StageWithPipelineInfo>(
            'GET',
            '/stages'
        );
    }

    // Filter endpoints
    async listFilters(type: string): Promise<PipedriveResponse<Record<string, any>[]>> {
        return this.request<PipedriveResponse<Record<string, any>[]>>(
            'GET',
            '/filters',
            { type }
        );
    }

    // Activity Type endpoints
    async listActivityTypes(): Promise<PipedriveResponse<Record<string, any>[]>> {
        return this.request<PipedriveResponse<Record<string, any>[]>>(
            'GET',
            '/activityTypes'
        );
    }

    // Label endpoints
    async listLeadLabels(): Promise<PipedriveResponse<Record<string, any>[]>> {
        return this.request<PipedriveResponse<Record<string, any>[]>>(
            'GET',
            '/leadLabels'
        );
    }

    // File endpoints
    async attachFile(data: FormData): Promise<PipedriveResponse<Record<string, any>>> {
        const headers = {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${this.accessToken}`
        };

        try {
            const response = await axios.post(
                `${this.baseUrl}/files`,
                data,
                { headers }
            );
            return response.data;
        } catch (error: any) {
            if (error.response && error.response.status === 403) {
                throw new Error('Please reconnect your Pipedrive account.');
            }
            throw error;
        }
    }

    // Follower endpoints
    async addFollower(data: any): Promise<PipedriveResponse<Record<string, any>>> {
        return this.request<PipedriveResponse<Record<string, any>>>(
            'POST',
            '/followers',
            undefined,
            data
        );
    }

    // Webhook endpoints
    async createWebhook(
        object: string,
        action: string,
        webhookUrl: string
    ): Promise<WebhookCreateResponse> {
        return this.request<WebhookCreateResponse>(
            'POST',
            '/webhooks',
            undefined,
            {
                event_object: object,
                event_action: action,
                subscription_url: webhookUrl
            }
        );
    }

    async deleteWebhook(webhookId: string): Promise<PipedriveResponse<Record<string, any>>> {
        return this.request<PipedriveResponse<Record<string, any>>>(
            'DELETE',
            `/webhooks/${webhookId}`
        );
    }
}

export function createPipedriveClient(auth: PipedriveAuth): PipedriveClient {
    return new PipedriveClient(auth);
}
