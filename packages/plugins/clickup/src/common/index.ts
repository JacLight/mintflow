export * from './constants.js';
export * from './types.js';
export * from './client.js';

// Helper function to create a ClickUp client
import { ClickupClient } from './client.js';

export function createClient(apiKey: string): ClickupClient {
    return new ClickupClient(apiKey);
}
