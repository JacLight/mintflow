import { z } from 'zod';
import { InvoiceNinjaClient } from '../utils/index.js';

export const customApiCall = {
  name: 'custom_api_call',
  displayName: 'Custom API Call',
  description: 'Make a custom API call to the InvoiceNinja API',
  inputSchema: {
    type: 'object',
    properties: {
      endpoint: {
        type: 'string',
        description: 'The InvoiceNinja API endpoint to call (e.g., "api/v1/clients", "api/v1/invoices")',
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
    endpoint: 'api/v1/clients',
    method: 'GET',
    params: {
      per_page: 10,
      page: 1,
    },
  },
  exampleOutput: {
    data: {
      data: [
        {
          id: '1',
          name: 'John Doe',
          email: 'john.doe@example.com',
        },
      ],
      meta: {
        pagination: {
          total: 1,
          count: 1,
          per_page: 10,
          current_page: 1,
          total_pages: 1,
        },
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

      // Create InvoiceNinja client
      const client = new InvoiceNinjaClient(auth);

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
