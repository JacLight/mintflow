import { z } from 'zod';
import { FreshdeskClient } from '../utils/index.js';

export const customApiCall = {
  name: 'custom_api_call',
  displayName: 'Custom API Call',
  description: 'Make a custom API call to the Freshdesk API',
  inputSchema: {
    type: 'object',
    properties: {
      endpoint: {
        type: 'string',
        description: 'The Freshdesk API endpoint to call (e.g., "/tickets", "/contacts")',
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
        description: 'The query parameters to include in the request',
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
    endpoint: '/tickets',
    method: 'GET',
    params: {
      per_page: 10,
      page: 1,
    },
  },
  exampleOutput: {
    data: [
      {
        id: 1,
        subject: 'Support Needed',
        description: 'I need help with your product',
        status: 2,
        priority: 1,
        created_at: '2023-01-01T12:00:00Z',
        updated_at: '2023-01-01T12:30:00Z',
      },
    ],
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

      // Create Freshdesk client
      const client = new FreshdeskClient(auth);

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
