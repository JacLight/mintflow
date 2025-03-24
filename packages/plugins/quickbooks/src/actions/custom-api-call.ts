import { z } from 'zod';
import { QuickBooksClient } from '../utils/index.js';

export const customApiCall = {
  name: 'custom_api_call',
  displayName: 'Custom API Call',
  description: 'Make a custom API call to the QuickBooks API',
  inputSchema: {
    type: 'object',
    properties: {
      endpoint: {
        type: 'string',
        description: 'The QuickBooks API endpoint to call (e.g., "customer", "invoice")',
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
        description: 'The request body (for POST, PUT methods)',
        required: false,
      },
      params: {
        type: 'object',
        description: 'Query parameters to include in the request',
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
    endpoint: 'customer',
    method: 'GET',
    params: {
      limit: 10,
    },
  },
  exampleOutput: {
    data: {
      Customer: [
        {
          Id: '1',
          DisplayName: 'John Doe',
          PrimaryEmailAddr: {
            Address: 'john.doe@example.com',
          },
        },
      ],
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

      // Create QuickBooks client
      const client = new QuickBooksClient(auth);

      // Make the API request
      const response = await client.makeRequest(
        auth,
        input.method as 'GET' | 'POST' | 'PUT' | 'DELETE',
        input.endpoint,
        input.data,
        input.params
      );

      return response;
    } catch (error: any) {
      throw new Error(`Failed to make custom API call: ${error.message}`);
    }
  },
};
