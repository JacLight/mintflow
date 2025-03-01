import { z } from 'zod';
import { RedditClient } from '../utils/index.js';

export const customApiCall = {
  name: 'custom_api_call',
  displayName: 'Custom API Call',
  description: 'Make a custom API call to the Reddit API',
  inputSchema: {
    type: 'object',
    properties: {
      endpoint: {
        type: 'string',
        description: 'The Reddit API endpoint to call (e.g., "/r/subreddit/about", "/api/v1/me")',
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
      params: {
        type: 'object',
        description: 'The query parameters',
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
    endpoint: '/r/programming/about',
    method: 'GET',
  },
  exampleOutput: {
    data: {
      kind: 't5',
      data: {
        display_name: 'programming',
        title: 'Programming',
        subscribers: 5000000,
        description: 'Computer Programming',
        created_utc: 1201233135.0,
      },
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

      // Create Reddit client
      const client = new RedditClient({
        clientId: auth.clientId,
        clientSecret: auth.clientSecret,
        username: auth.username,
        password: auth.password,
        userAgent: auth.userAgent,
      });

      // Make the API request
      const response = await client.makeCustomApiCall(
        input.endpoint,
        input.method,
        input.data,
        input.params
      );

      return {
        data: response,
      };
    } catch (error: any) {
      throw new Error(`Failed to make custom API call: ${error.message}`);
    }
  },
};
