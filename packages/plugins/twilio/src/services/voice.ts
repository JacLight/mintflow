


import { BaseTwilioService } from './base.js';
import { VoiceCallOptions } from '../types/voice.js';
import { voiceSchema } from '../schemas/voice.js';
import { TwiMLTemplates } from '../utils/index.js';
import { CallInstance } from 'twilio/lib/rest/insights/v1/call.js';
import { logger } from '@mintflow/common';

export class VoiceService extends BaseTwilioService {
    async makeCall(options: VoiceCallOptions): Promise<any> {
        try {
            // Validate options
            await voiceSchema.call.parseAsync(options);

            // Make call with retry logic
            return await this.executeWithRetry(async () => {
                const response = await this.client.calls.create({
                    to: options.to,
                    from: options.from as string,
                    twiml: options.twiml || TwiMLTemplates.getBasicVoiceResponse('Hello'),
                    record: options.record,
                    timeout: options.timeout,
                    machineDetection: options.machineDetection

                });

                logger.info('Call initiated successfully', {
                    to: options.to,
                    sid: response.sid,
                    status: response.status
                });

                return response;
            });

        } catch (error: any) {
            this.logError(error, { options });
            throw error;
        }
    }

    async handleIncomingCall(payload: any): Promise<string> {
        try {
            const { CallSid, From } = payload;

            logger.info('Incoming call received', {
                from: From,
                callId: CallSid
            });

            // Generate TwiML response
            return TwiMLTemplates.getMenuResponse({
                greeting: 'Welcome to our service.',
                menuOptions: [
                    { digit: '1', description: 'Sales' },
                    { digit: '2', description: 'Support' }
                ],
                action: '/voice/menu'
            });

        } catch (error: any) {
            this.logError(error, { payload });
            throw new Error('Failed to handle incoming call');
        }
    }
}

