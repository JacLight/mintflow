import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

export class ApolloClient {
    private client: AxiosInstance;
    private baseUrl = 'https://api.apollo.io/v1';

    constructor(private apiKey: string) {
        this.client = axios.create({
            baseURL: this.baseUrl,
            headers: {
                'Content-Type': 'application/json',
            }
        });
    }

    async makeRequest<T>(
        method: string,
        endpoint: string,
        data?: any,
        params?: Record<string, string>
    ): Promise<T> {
        const config: AxiosRequestConfig = {
            method,
            url: endpoint,
            params: {
                ...params,
                api_key: this.apiKey
            },
            data: method !== 'GET' ? data : undefined
        };

        try {
            const response = await this.client.request<T>(config);
            return response.data;
        } catch (error: any) {
            if (error.response) {
                throw new Error(`Apollo API error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
            } else if (error.request) {
                throw new Error(`Apollo API request error: ${error.message}`);
            } else {
                throw new Error(`Apollo API error: ${error.message}`);
            }
        }
    }

    async matchPerson(email: string): Promise<Record<string, any>> {
        const response = await this.makeRequest<{ person: Record<string, any> }>(
            'POST',
            '/people/match',
            { email, api_key: this.apiKey }
        );
        return response.person || {};
    }

    async enrichCompany(domain: string): Promise<Record<string, any>> {
        const response = await this.makeRequest<{ organization: Record<string, any> }>(
            'GET',
            '/organizations/enrich',
            undefined,
            { domain }
        );
        return response.organization || {};
    }
}
