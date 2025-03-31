export * from './constants.js';
export * from './types.js';
export * from './client.js';

// Helper function to create a Webflow client
import { WebflowClient } from './client.js';

export function createClient(accessToken: string): WebflowClient {
    return new WebflowClient(accessToken);
}
