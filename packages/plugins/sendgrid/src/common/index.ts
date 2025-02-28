export * from './constants.js';
export * from './types.js';
export * from './client.js';

// Helper function to create a SendGrid client
import { SendgridClient } from './client.js';

export function createClient(apiKey: string): SendgridClient {
  return new SendgridClient(apiKey);
}
