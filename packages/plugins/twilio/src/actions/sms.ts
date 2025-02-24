import { SMSService } from '../services/index.js';
import { SMSMessage } from '../types/index.js';

export const smsActions = {
    sendSms: {
        name: 'sendSms',
        execute: async (input: SMSMessage, config: any) => {
            const { accountSid, authToken } = config;
            const smsService = new SMSService(accountSid, authToken);
            return await smsService.sendMessage(input);
        }
    }
};