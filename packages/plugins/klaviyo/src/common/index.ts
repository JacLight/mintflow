export * from './constants.js';
export * from './types.js';
export * from './client.js';

// Helper function to create a Klaviyo client
import { KlaviyoClient } from './client.js';

export function createClient(apiKey: string): KlaviyoClient {
  return new KlaviyoClient(apiKey);
}
