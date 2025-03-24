import { z } from 'zod';
import { MediumClient } from '../utils/index.js';

export const customApiCall = {
  name: 'custom_api_call',
  displayName: 'Custom API Call',
  description: 'Make a custom API call to the Medium API',
  inputSchema: {
    type: 'object',
    properties: {
      endpoint: {
        type: 'string',
        description: 'The Medium API endpoint to call (e.g., "/me", "/users/{userId}/publications")',
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
    endpoint: '/me',
    method: 'GET',
  },
  exampleOutput: {
    data: {
      data: {
        id: '1234567890abcdef',
        username: 'username',
        name: 'User Name',
        url: 'https://medium.com/@username',
        imageUrl: 'https://cdn-images-1.medium.com/fit/c/200/200/1*abcdefg.jpeg',
      }
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

      // Create Medium client
      const client = new MediumClient({
        integrationToken: auth.integrationToken,
      });

      // Make the API request
      const response = await client.makeCustomApiCall(
        input.method,
        input.endpoint,
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
