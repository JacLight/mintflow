import { z } from 'zod';
import { XeroApiClient } from '../utils/index.js';

export const customApiCall = {
  name: 'custom_api_call',
  displayName: 'Custom API Call',
  description: 'Make a custom API call to the Xero API',
  inputSchema: {
    type: 'object',
    properties: {
      endpoint: {
        type: 'string',
        description: 'The Xero API endpoint to call (e.g., "getContacts", "getInvoices")',
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
    endpoint: 'getContacts',
    method: 'GET',
  },
  exampleOutput: {
    data: {
      Contacts: [
        {
          ContactID: '00000000-0000-0000-0000-000000000000',
          Name: 'John Doe',
          EmailAddress: 'john.doe@example.com',
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

      // Create Xero client
      const client = new XeroApiClient(auth);
      
      // Initialize the client with the refresh token
      await client.initialize(auth.refreshToken);

      // Make the API request
      const response = await client.makeCustomApiCall(
        input.endpoint,
        input.method,
        input.data
      );

      return response;
    } catch (error: any) {
      throw new Error(`Failed to make custom API call: ${error.message}`);
    }
  },
};
