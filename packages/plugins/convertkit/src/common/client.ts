import axios from 'axios';
import {
    Broadcast,
    CustomField,
    Form,
    Purchase,
    Sequence,
    Subscriber,
    Tag,
    Webhook,
} from './types.js';
import {
    BROADCASTS_API_ENDPOINT,
    CONVERTKIT_API_URL,
    CUSTOM_FIELDS_API_ENDPOINT,
    FORMS_API_ENDPOINT,
    PURCHASES_API_ENDPOINT,
    SEQUENCES_API_ENDPOINT,
    SUBSCRIBERS_API_ENDPOINT,
    TAGS_API_ENDPOINT,
    WEBHOOKS_API_ENDPOINT,
} from './constants.js';

export class ConvertKitClient {
    constructor(private apiSecret: string) { }

    async authenticate() {
        return await this.makeRequest('GET', '/users/me');
    }

    async fetchBroadcasts(page: number = 1) {
        const response = await this.makeRequest<{ broadcasts: Broadcast[] }>(
            'GET',
            BROADCASTS_API_ENDPOINT,
            { page }
        );
        return response.broadcasts;
    }

    async fetchCustomFields() {
        const response = await this.makeRequest<{ custom_fields: CustomField[] }>(
            'GET',
            CUSTOM_FIELDS_API_ENDPOINT
        );
        return response.custom_fields;
    }

    async fetchForms() {
        const response = await this.makeRequest<{ forms: Form[] }>(
            'GET',
            FORMS_API_ENDPOINT
        );
        return response.forms;
    }

    async fetchPurchases(page: number = 1) {
        const response = await this.makeRequest<{ purchases: Purchase[] }>(
            'GET',
            PURCHASES_API_ENDPOINT,
            { page }
        );
        return response.purchases;
    }

    async fetchSequences() {
        const response = await this.makeRequest<{ courses: Sequence[] }>(
            'GET',
            SEQUENCES_API_ENDPOINT
        );
        return response.courses;
    }

    async fetchSubscriberById(subscriberId: string) {
        const response = await this.makeRequest<{ subscriber: Subscriber }>(
            'GET',
            `${SUBSCRIBERS_API_ENDPOINT}/${subscriberId}`
        );
        return response.subscriber;
    }

    async fetchSubscriberByEmail(email: string) {
        const response = await this.makeRequest<{ subscribers: Subscriber[] }>(
            'GET',
            SUBSCRIBERS_API_ENDPOINT,
            { email_address: email }
        );

        if (!response.subscribers || response.subscribers.length === 0) {
            throw new Error(`No subscriber found with email: ${email}`);
        }

        return response.subscribers[0];
    }

    async fetchSubscribedTags(subscriberId: string) {
        const response = await this.makeRequest<{ tags: Tag[] }>(
            'GET',
            `${SUBSCRIBERS_API_ENDPOINT}/${subscriberId}/tags`
        );
        return response.tags;
    }

    async fetchTags() {
        const response = await this.makeRequest<{ tags: Tag[] }>(
            'GET',
            TAGS_API_ENDPOINT
        );
        return response.tags;
    }

    async createWebhook(payload: object) {
        const response = await this.makeRequest<{ rule: Webhook }>(
            'POST',
            WEBHOOKS_API_ENDPOINT,
            payload
        );
        return response.rule;
    }

    async removeWebhook(ruleId: number) {
        const response = await this.makeRequest<{ success: boolean }>(
            'DELETE',
            `${WEBHOOKS_API_ENDPOINT}/${ruleId}`
        );
        return response.success;
    }

    async updateSubscriber(subscriberId: string, data: any) {
        const response = await this.makeRequest<{ subscriber: Subscriber }>(
            'PUT',
            `${SUBSCRIBERS_API_ENDPOINT}/${subscriberId}`,
            data
        );
        return response.subscriber;
    }

    async unsubscribeSubscriber(email: string) {
        const response = await this.makeRequest<{ subscriber: Subscriber }>(
            'PUT',
            `${CONVERTKIT_API_URL}/unsubscribe`,
            { email }
        );
        return response.subscriber;
    }

    async listSubscribers(params: any = {}) {
        const response = await this.makeRequest<{ subscribers: Subscriber[] }>(
            'GET',
            SUBSCRIBERS_API_ENDPOINT,
            params
        );
        return response.subscribers;
    }

    async addSubscriberToForm(formId: string, data: any) {
        const response = await this.makeRequest<{ subscription: any }>(
            'POST',
            `${FORMS_API_ENDPOINT}/${formId}/subscribe`,
            data
        );
        return response.subscription;
    }

    async addSubscriberToSequence(sequenceId: string, data: any) {
        const response = await this.makeRequest<{ subscription: any }>(
            'POST',
            `${SEQUENCES_API_ENDPOINT}/${sequenceId}/subscribe`,
            data
        );
        return response.subscription;
    }

    async createTag(name: string) {
        const response = await this.makeRequest<{ tag: Tag }>(
            'POST',
            TAGS_API_ENDPOINT,
            { tag: { name } }
        );
        return response.tag;
    }

    async tagSubscriber(tagId: string, email: string) {
        const response = await this.makeRequest<{ subscription: any }>(
            'POST',
            `${TAGS_API_ENDPOINT}/${tagId}/subscribe`,
            { email }
        );
        return response.subscription;
    }

    async removeTagFromSubscriber(tagId: string, subscriberId: string) {
        const response = await this.makeRequest<{ subscription: any }>(
            'DELETE',
            `${SUBSCRIBERS_API_ENDPOINT}/${subscriberId}/tags/${tagId}`
        );
        return response;
    }

    async createBroadcast(data: any) {
        const response = await this.makeRequest<{ broadcast: Broadcast }>(
            'POST',
            BROADCASTS_API_ENDPOINT,
            { broadcast: data }
        );
        return response.broadcast;
    }

    async updateBroadcast(broadcastId: string, data: any) {
        const response = await this.makeRequest<{ broadcast: Broadcast }>(
            'PUT',
            `${BROADCASTS_API_ENDPOINT}/${broadcastId}`,
            { broadcast: data }
        );
        return response.broadcast;
    }

    async deleteBroadcast(broadcastId: string) {
        const response = await this.makeRequest<{ broadcast: Broadcast }>(
            'DELETE',
            `${BROADCASTS_API_ENDPOINT}/${broadcastId}`
        );
        return response.broadcast;
    }

    async getBroadcastById(broadcastId: string) {
        const response = await this.makeRequest<{ broadcast: Broadcast }>(
            'GET',
            `${BROADCASTS_API_ENDPOINT}/${broadcastId}`
        );
        return response.broadcast;
    }

    async createField(data: any) {
        const response = await this.makeRequest<{ custom_field: CustomField }>(
            'POST',
            CUSTOM_FIELDS_API_ENDPOINT,
            { custom_field: data }
        );
        return response.custom_field;
    }

    async updateField(fieldId: string, data: any) {
        const response = await this.makeRequest<{ custom_field: CustomField }>(
            'PUT',
            `${CUSTOM_FIELDS_API_ENDPOINT}/${fieldId}`,
            { custom_field: data }
        );
        return response.custom_field;
    }

    async deleteField(fieldId: string) {
        const response = await this.makeRequest<{ custom_field: CustomField }>(
            'DELETE',
            `${CUSTOM_FIELDS_API_ENDPOINT}/${fieldId}`
        );
        return response.custom_field;
    }

    async createPurchase(data: any) {
        const response = await this.makeRequest<{ purchase: Purchase }>(
            'POST',
            PURCHASES_API_ENDPOINT,
            { purchase: data }
        );
        return response.purchase;
    }

    async getPurchaseById(purchaseId: string) {
        const response = await this.makeRequest<{ purchase: Purchase }>(
            'GET',
            `${PURCHASES_API_ENDPOINT}/${purchaseId}`
        );
        return response.purchase;
    }

    private async makeRequest<T = any>(
        method: string,
        url: string,
        params: any = {}
    ): Promise<T> {
        try {
            // Add API secret to all requests
            const requestParams = {
                ...params,
                api_secret: this.apiSecret,
            };

            // For GET requests, use query parameters
            const config: any = {
                method,
                url: url.startsWith('http') ? url : url,
            };

            if (method.toUpperCase() === 'GET') {
                config.params = requestParams;
            } else {
                config.data = requestParams;
            }

            const response = await axios(config);
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(`ConvertKit API Error: ${error.response?.data?.message || error.message}`);
            }
            throw error;
        }
    }
}
