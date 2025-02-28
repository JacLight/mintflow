import { logger } from '@mintflow/common';
import { BaseTwilioService } from './base.js';

export * from './base.js';
export * from './sms.js';
export * from './voice.js';
export * from './config.js';

// Add webhook handler service
export class WebhookHandlerService extends BaseTwilioService {
    constructor(accountSid: string, authToken: string) {
        super(accountSid, authToken);
    }

    async handleStatusCallback(payload: any): Promise<void> {
        const { CallSid, CallStatus, ErrorCode } = payload;

        logger.info('Call status update received', {
            callSid: CallSid,
            status: CallStatus,
            errorCode: ErrorCode
        });

        // Implement your status handling logic here
        switch (CallStatus) {
            case 'completed':
                // Handle successful call completion
                break;
            case 'failed':
                // Handle call failure
                this.logError(new Error(`Call failed with error code: ${ErrorCode}`), payload);
                break;
            case 'busy':
            case 'no-answer':
                // Handle unsuccessful call attempts
                break;
            default:
                // Handle other statuses
                break;
        }
    }

    async handleRecordingCallback(payload: any): Promise<void> {
        const { RecordingSid, RecordingUrl, RecordingStatus } = payload;

        logger.info('Recording status update received', {
            recordingSid: RecordingSid,
            status: RecordingStatus
        });

        if (RecordingStatus === 'completed' && RecordingUrl) {
            // Implement your recording handling logic here
            // Example: Download and store the recording
            try {
                const recording = await this.client.recordings(RecordingSid).fetch();
                // Process recording...
            } catch (error) {
                this.logError(error, { recordingSid: RecordingSid });
            }
        }
    }
}