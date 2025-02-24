import { BaseTwilioService } from './base.js';
import { SMSMessage } from '../types/index.js';
import { smsSchema } from '../schemas/sms.js';
import { logger } from '@mintflow/common';
import { MessageInstance } from 'twilio/lib/rest/api/v2010/account/message.js';

export class SMSService extends BaseTwilioService {
    async sendMessage(message: SMSMessage): Promise<MessageInstance> {
        try {
            // Validate message
            await smsSchema.message.parseAsync(message);

            // Send with retry logic
            return await this.executeWithRetry(async () => {
                const response = await this.client.messages.create({
                    to: message.to,
                    from: message.from,
                    body: message.body,
                    mediaUrl: message.mediaUrl
                });

                logger.info('SMS sent successfully', {
                    to: message.to,
                    sid: response.sid,
                    status: response.status
                });

                return response;
            });

        } catch (error: any) {
            this.logError(error, { message });
            throw error;
        }
    }

    async handleIncomingSMS(payload: any): Promise<void> {
        try {
            const { Body, From, MessageSid } = payload;

            logger.info('Incoming SMS received', {
                from: From,
                messageId: MessageSid
            });

            // Process message (implement your logic here)
            // Example: Emit event for flow processing
            // this.emitEvent('incomingSMS', { body: Body, from: From });

        } catch (error: any) {
            this.logError(error, { payload });
            throw error;
        }
    }
}