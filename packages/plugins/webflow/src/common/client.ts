import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { WEBFLOW_API_URL } from './constants.js';
import {
    WebflowApiResponse,
    WebflowCollection,
    WebflowCollectionItem,
    WebflowOrder,
    WebflowSite,
    WebflowWebhook
} from './types.js';

export class WebflowClient {
    private axiosInstance: AxiosInstance;

    constructor(private accessToken: string) {
        this.axiosInstance = axios.create({
            baseURL: WEBFLOW_API_URL,
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'Accept-Version': '1.0.0'
            }
        });
    }

    /**
     * Make a request to the Webflow API
     * @param method HTTP method
     * @param endpoint API endpoint
     * @param data Request data
     * @param params Query parameters
     * @returns Promise with the API response
     */
    private async makeRequest<T>(
        method: string,
        endpoint: string,
        data?: any,
        params?: Record<string, any>
    ): Promise<WebflowApiResponse<T>> {
        try {
            const config: AxiosRequestConfig = {
                method,
                url: endpoint,
                params
            };

            if (data) {
                config.data = data;
            }

            const response = await this.axiosInstance(config);
            return { data: response.data };
        } catch (error: any) {
            if (axios.isAxiosError(error)) {
                return {
                    error: error.response?.data?.err || error.message
                };
            }
            return { error: 'Unknown error occurred' };
        }
    }

    // Site endpoints
    async listSites(): Promise<WebflowApiResponse<WebflowSite[]>> {
        return this.makeRequest<WebflowSite[]>('GET', '/sites');
    }

    async getSite(siteId: string): Promise<WebflowApiResponse<WebflowSite>> {
        return this.makeRequest<WebflowSite>('GET', `/sites/${siteId}`);
    }

    // Collection endpoints
    async listCollections(siteId: string): Promise<WebflowApiResponse<WebflowCollection[]>> {
        return this.makeRequest<WebflowCollection[]>('GET', `/sites/${siteId}/collections`);
    }

    async getCollection(collectionId: string): Promise<WebflowApiResponse<WebflowCollection>> {
        return this.makeRequest<WebflowCollection>('GET', `/collections/${collectionId}`);
    }

    // Collection item endpoints
    async listCollectionItems(collectionId: string, offset: number = 0, limit: number = 100): Promise<WebflowApiResponse<{ items: WebflowCollectionItem[] }>> {
        return this.makeRequest<{ items: WebflowCollectionItem[] }>('GET', `/collections/${collectionId}/items`, undefined, {
            offset,
            limit
        });
    }

    async getCollectionItem(collectionId: string, itemId: string): Promise<WebflowApiResponse<WebflowCollectionItem>> {
        return this.makeRequest<WebflowCollectionItem>('GET', `/collections/${collectionId}/items/${itemId}`);
    }

    async createCollectionItem(collectionId: string, data: { fields: Record<string, any> }): Promise<WebflowApiResponse<WebflowCollectionItem>> {
        return this.makeRequest<WebflowCollectionItem>('POST', `/collections/${collectionId}/items`, data);
    }

    async updateCollectionItem(collectionId: string, itemId: string, data: { fields: Record<string, any> }): Promise<WebflowApiResponse<WebflowCollectionItem>> {
        return this.makeRequest<WebflowCollectionItem>('PUT', `/collections/${collectionId}/items/${itemId}`, data);
    }

    async deleteCollectionItem(collectionId: string, itemId: string): Promise<WebflowApiResponse<{ deleted: boolean }>> {
        return this.makeRequest<{ deleted: boolean }>('DELETE', `/collections/${collectionId}/items/${itemId}`);
    }

    async publishCollectionItem(collectionId: string, itemId: string): Promise<WebflowApiResponse<{ publishedItemId: string }>> {
        return this.makeRequest<{ publishedItemId: string }>('POST', `/collections/${collectionId}/items/publish`, {
            itemIds: [itemId]
        });
    }

    // Order endpoints
    async listOrders(siteId: string, offset: number = 0, limit: number = 100): Promise<WebflowApiResponse<WebflowOrder[]>> {
        return this.makeRequest<WebflowOrder[]>('GET', `/sites/${siteId}/orders`, undefined, {
            offset,
            limit
        });
    }

    async getOrder(siteId: string, orderId: string): Promise<WebflowApiResponse<WebflowOrder>> {
        return this.makeRequest<WebflowOrder>('GET', `/sites/${siteId}/orders/${orderId}`);
    }

    async fulfillOrder(siteId: string, orderId: string, data: Record<string, any>): Promise<WebflowApiResponse<WebflowOrder>> {
        return this.makeRequest<WebflowOrder>('POST', `/sites/${siteId}/orders/${orderId}/fulfill`, data);
    }

    async unfulfillOrder(siteId: string, orderId: string): Promise<WebflowApiResponse<WebflowOrder>> {
        return this.makeRequest<WebflowOrder>('POST', `/sites/${siteId}/orders/${orderId}/unfulfill`);
    }

    async refundOrder(siteId: string, orderId: string): Promise<WebflowApiResponse<WebflowOrder>> {
        return this.makeRequest<WebflowOrder>('POST', `/sites/${siteId}/orders/${orderId}/refund`);
    }

    // Webhook endpoints
    async createWebhook(siteId: string, triggerType: string, url: string): Promise<WebflowApiResponse<WebflowWebhook>> {
        return this.makeRequest<WebflowWebhook>('POST', `/sites/${siteId}/webhooks`, {
            triggerType,
            url
        });
    }

    async deleteWebhook(webhookId: string): Promise<WebflowApiResponse<{ deleted: boolean }>> {
        return this.makeRequest<{ deleted: boolean }>('DELETE', `/webhooks/${webhookId}`);
    }
}

export function createClient(accessToken: string): WebflowClient {
    return new WebflowClient(accessToken);
}
