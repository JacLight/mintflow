import { z } from 'zod';
import { MastodonClient } from '../utils/index.js';

export const customApiCall = {
  name: 'custom_api_call',
  displayName: 'Custom API Call',
  description: 'Make a custom API call to the Mastodon API',
  inputSchema: {
    type: 'object',
    properties: {
      endpoint: {
        type: 'string',
        description: 'The Mastodon API endpoint to call (e.g., "/statuses", "/accounts/verify_credentials")',
        required: true,
      },
      method: {
        type: 'string',
        description: 'The HTTP method to use',
        enum: ['GET', 'POST', 'PUT', 'DELETE'],
        default: 'GET',
        required: true,
      },
      data: {
        type: 'object',
        description: 'The request data (for POST, PUT methods)',
        required: false,
      },
    },
    required: ['endpoint', 'method'],
  },
  outputSchema: {
    type: 'object',
    properties: {
      data: {
        type: 'object',
        description: 'The response data from the API',
      },
    },
  },
  exampleInput: {
    endpoint: '/accounts/verify_credentials',
    method: 'GET',
  },
  exampleOutput: {
    data: {
      id: '123456789',
      username: 'user',
      acct: 'user',
      display_name: 'User Name',
      locked: false,
      bot: false,
      created_at: '2023-01-01T00:00:00.000Z',
      note: 'User bio',
      url: 'https://mastodon.social/@user',
      avatar: 'https://mastodon.social/avatars/original/missing.png',
      avatar_static: 'https://mastodon.social/avatars/original/missing.png',
      header: 'https://mastodon.social/headers/original/missing.png',
      header_static: 'https://mastodon.social/headers/original/missing.png',
      followers_count: 100,
      following_count: 100,
      statuses_count: 100,
      last_status_at: '2023-01-01',
      emojis: [],
      fields: []
    },
  },
  async execute(input: any, auth: any): Promise<any> {
    try {
      // Validate input
      const endpointSchema = z.string().min(1);
      const methodSchema = z.enum(['GET', 'POST', 'PUT', 'DELETE']);
      
      try {
        endpointSchema.parse(input.endpoint);
        methodSchema.parse(input.method);
      } catch (error) {
        throw new Error(`Invalid input: ${(error as Error).message}`);
      }

      // Create Mastodon client
      const client = new MastodonClient({
        baseUrl: auth.baseUrl,
        accessToken: auth.accessToken,
      });

      // Make the API request
      const response = await client.makeCustomApiCall(
        input.endpoint,
        input.method,
        input.data
      );

      return {
        data: response,
      };
    } catch (error: any) {
      throw new Error(`Failed to make custom API call: ${error.message}`);
    }
  },
};
