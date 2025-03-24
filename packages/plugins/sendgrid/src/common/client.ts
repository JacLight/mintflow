import axios from 'axios';
import { SENDGRID_API_URL } from './constants.js';
import { SendgridApiResponse, SendgridMailData } from './types.js';
import sgMail from '@sendgrid/mail';

export class SendgridClient {
    constructor(private apiKey: string) {
        sgMail.setApiKey(this.apiKey);
    }

    /**
     * Send an email using SendGrid
     * @param mailData The email data to send
     * @returns A promise that resolves to the SendGrid API response
     */
    async sendMail(mailData: SendgridMailData): Promise<SendgridApiResponse> {
        try {
            await sgMail.send(mailData as any);
            return { success: true };
        } catch (error: any) {
            return {
                success: false,
                message: error.message,
                errors: error.response?.body?.errors || [],
            };
        }
    }

    /**
     * Make a direct API request to SendGrid
     * @param method The HTTP method to use
     * @param endpoint The API endpoint to call
     * @param data The data to send with the request
     * @returns A promise that resolves to the API response
     */
    async makeRequest<T = any>(
        method: string,
        endpoint: string,
        data?: any
    ): Promise<T> {
        try {
            const response = await axios({
                method,
                url: `${SENDGRID_API_URL}${endpoint}`,
                data,
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Type': 'application/json',
                },
            });
            return response.data;
        } catch (error: any) {
            if (axios.isAxiosError(error)) {
                throw new Error(`SendGrid API Error: ${error.response?.data?.message || error.message}`);
            }
            throw error;
        }
    }
}
