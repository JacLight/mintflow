import { VoiceService } from '../services/index.js';
import { VoiceCallOptions } from '../types/index.js';

export const voiceActions = {
    makeCall: {
        name: 'makeCall',
        execute: async (input: VoiceCallOptions, config: any) => {
            const { accountSid, authToken } = config;
            const voiceService = new VoiceService(accountSid, authToken);
            return await voiceService.makeCall(input);
        }
    }
};