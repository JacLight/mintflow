import { SMSService } from '../services/index.js';
import { SMSMessage } from '../types/index.js';

export const smsActions = [
    {
        name: 'sendSms',
        execute: async (input: SMSMessage, nodeDef: any) => {
            const { accountSid, authToken } = nodeDef?.config || {};
            const smsService = new SMSService(accountSid, authToken);
            return await smsService.sendMessage(input);
        }
    }
];