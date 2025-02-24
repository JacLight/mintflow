import { Twilio } from 'twilio';
import { logger } from '@mintflow/common';
import { TwilioValidation } from '../utils/index.js';

export abstract class BaseTwilioService {
    protected client: Twilio;
    protected accountSid: string;
    protected authToken: string;

    constructor(accountSid: string, authToken: string) {
        this.accountSid = accountSid;
        this.authToken = authToken;
        this.client = new Twilio(accountSid, authToken);
    }

    protected async executeWithRetry<T>(
        operation: () => Promise<T>,
        retries = 3,
        delay = 1000
    ): Promise<T> {
        try {
            return await operation();
        } catch (error: any) {
            if (retries > 0 && TwilioValidation.isRetryableError(error)) {
                await new Promise(resolve => setTimeout(resolve, delay));
                return this.executeWithRetry(operation, retries - 1, delay * 2);
            }
            throw error;
        }
    }

    protected logError(error: any, context: Record<string, any> = {}) {
        logger.error('Twilio operation failed', {
            error: error.message,
            code: error.code,
            status: error.status,
            ...context
        });
    }
}
