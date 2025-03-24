export * from './client.js';
export * from './constants.js';
export * from './types.js';

// Helper function to create a ConvertKit client
import { ConvertKitClient } from './client.js';

export function createClient(apiSecret: string): ConvertKitClient {
    return new ConvertKitClient(apiSecret);
}
