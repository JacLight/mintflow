import axios from 'axios';
import { KLAVIYO_API_URL, KLAVIYO_API_VERSION } from './constants.js';
import { KlaviyoApiResponse, KlaviyoEvent, KlaviyoProfile } from './types.js';

export class KlaviyoClient {
    constructor(private apiKey: string) {}

    /**
     * Track an event in Klaviyo
     * @param event The event data to track
     * @returns A promise that resolves to the Klaviyo API response
     */
    async trackEvent(event: KlaviyoEvent): Promise<KlaviyoApiResponse> {
        try {
            const response = await this.makeRequest(
                'POST',
                '/track',
                {
                    token: this.apiKey,
                    event: event.event,
                    customer_properties: event.customer_properties,
                    properties: event.properties || {},
                    time: event.time || Math.floor(Date.now() / 1000),
                }
            );
            return { success: true, data: response };
        } catch (error: any) {
            return {
                success: false,
                message: error.message,
                errors: error.response?.data?.errors || [],
            };
        }
    }

    /**
     * Identify a profile in Klaviyo
     * @param profile The profile data to identify
     * @returns A promise that resolves to the Klaviyo API response
     */
    async identifyProfile(profile: KlaviyoProfile): Promise<KlaviyoApiResponse> {
        try {
            const response = await this.makeRequest(
                'POST',
                '/identify',
                {
                    token: this.apiKey,
                    properties: profile,
                }
            );
            return { success: true, data: response };
        } catch (error: any) {
            return {
                success: false,
                message: error.message,
                errors: error.response?.data?.errors || [],
            };
        }
    }

    /**
     * Get all lists from Klaviyo
     * @returns A promise that resolves to the Klaviyo API response
     */
    async getLists(): Promise<KlaviyoApiResponse> {
        try {
            const response = await this.makeRequest(
                'GET',
                '/v2/lists',
                null,
                { api_key: this.apiKey }
            );
            return { success: true, data: response };
        } catch (error: any) {
            return {
                success: false,
                message: error.message,
                errors: error.response?.data?.errors || [],
            };
        }
    }

    /**
     * Add a profile to a list in Klaviyo
     * @param listId The ID of the list to add the profile to
     * @param profiles The profiles to add to the list
     * @returns A promise that resolves to the Klaviyo API response
     */
    async addProfilesToList(listId: string, profiles: KlaviyoProfile[]): Promise<KlaviyoApiResponse> {
        try {
            const response = await this.makeRequest(
                'POST',
                `/v2/list/${listId}/members`,
                {
                    api_key: this.apiKey,
                    profiles: profiles,
                }
            );
            return { success: true, data: response };
        } catch (error: any) {
            return {
                success: false,
                message: error.message,
                errors: error.response?.data?.errors || [],
            };
        }
    }

    /**
     * Remove a profile from a list in Klaviyo
     * @param listId The ID of the list to remove the profile from
     * @param email The email of the profile to remove
     * @returns A promise that resolves to the Klaviyo API response
     */
    async removeProfileFromList(listId: string, email: string): Promise<KlaviyoApiResponse> {
        try {
            const response = await this.makeRequest(
                'DELETE',
                `/v2/list/${listId}/members`,
                {
                    api_key: this.apiKey,
                    emails: [email],
                }
            );
            return { success: true, data: response };
        } catch (error: any) {
            return {
                success: false,
                message: error.message,
                errors: error.response?.data?.errors || [],
            };
        }
    }

    /**
     * Get all campaigns from Klaviyo
     * @returns A promise that resolves to the Klaviyo API response
     */
    async getCampaigns(): Promise<KlaviyoApiResponse> {
        try {
            const response = await this.makeRequest(
                'GET',
                '/v1/campaigns',
                null,
                { api_key: this.apiKey }
            );
            return { success: true, data: response };
        } catch (error: any) {
            return {
                success: false,
                message: error.message,
                errors: error.response?.data?.errors || [],
            };
        }
    }

    /**
     * Make a direct API request to Klaviyo
     * @param method The HTTP method to use
     * @param endpoint The API endpoint to call
     * @param data The data to send with the request
     * @param params The query parameters to send with the request
     * @returns A promise that resolves to the API response
     */
    async makeRequest<T = any>(
        method: string,
        endpoint: string,
        data?: any,
        params?: any
    ): Promise<T> {
        try {
            const response = await axios({
                method,
                url: `${KLAVIYO_API_URL}${endpoint}`,
                data,
                params,
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Revision': KLAVIYO_API_VERSION,
                },
            });
            return response.data;
        } catch (error: any) {
            if (axios.isAxiosError(error)) {
                throw new Error(`Klaviyo API Error: ${error.response?.data?.message || error.message}`);
            }
            throw error;
        }
    }
}
