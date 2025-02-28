import { ActiveCampaignClient } from './client.js';

export interface ActiveCampaignAuth {
    apiUrl: string;
    apiKey: string;
}

export function makeClient(auth: ActiveCampaignAuth) {
    const client = new ActiveCampaignClient(auth.apiUrl, auth.apiKey);
    return client;
}

export * from './constants.js';
export * from './types.js';
export * from './client.js';
