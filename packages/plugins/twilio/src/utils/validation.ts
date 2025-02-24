import { logger } from '@mintflow/common';
import { validateRequest } from 'twilio';

export class TwilioValidation {
    static validateWebhookRequest(req: any, authToken: string): boolean {
        try {
            const twilioSignature = req.headers['x-twilio-signature'] as string;
            const url = `${req.protocol}://${req.get('host')}${req.originalUrl}`;
            const params = req.method === 'POST' ? req.body : req.query;

            return validateRequest(authToken, twilioSignature, url, params);
        } catch (error) {
            logger.error('Webhook validation failed', { error });
            return false;
        }
    }

    static validatePhoneNumber(phoneNumber: string): boolean {
        const phoneRegex = /^\+[1-9]\d{1,14}$/;
        return phoneRegex.test(phoneNumber);
    }

    static isRetryableError(error: any): boolean {
        const retryableCodes = [
            429, // Too Many Requests
            503, // Service Unavailable
            408  // Request Timeout
        ];
        return retryableCodes.includes(error.status) || error.code === 'ECONNRESET';
    }
}