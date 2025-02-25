import { exec } from 'child_process';
import { ConfigurationService } from '../services/index.js';
import { TwilioSetupConfig } from '../types/index.js';

export const configActions = [
    {
        name: 'setup',
        execute: async (input: TwilioSetupConfig, config: any) => {
            const { accountSid, authToken } = config;
            const configService = new ConfigurationService(accountSid, authToken);
            return await configService.configureService(input);
        }
    },
    {
        name: 'list-numbers',
        execute: async (input: any, config: any) => {
            const { accountSid, authToken } = config;
            const configService = new ConfigurationService(accountSid, authToken);
            return await configService.listNumbers();
        }
    }
];
