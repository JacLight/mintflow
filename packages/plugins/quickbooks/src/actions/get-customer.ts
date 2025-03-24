import { z } from 'zod';
import { QuickBooksClient } from '../utils/index.js';

export const getCustomer = {
  name: 'get_customer',
  displayName: 'Get Customer',
  description: 'Retrieve a customer from QuickBooks by ID',
  inputSchema: {
    type: 'object',
    properties: {
      customerId: {
        type: 'string',
        description: 'The ID of the customer to retrieve',
        required: true,
      },
      includeDetails: {
        type: 'boolean',
        description: 'Whether to include all customer details',
        default: true,
        required: false,
      },
    },
    required: ['customerId'],
  },
  outputSchema: {
    type: 'object',
    properties: {
      customer: {
        type: 'object',
        description: 'The customer data',
      },
    },
  },
  exampleInput: {
    customerId: '1',
    includeDetails: true,
  },
  exampleOutput: {
    customer: {
      Id: '1',
      DisplayName: 'John Doe',
      PrimaryEmailAddr: {
        Address: 'john.doe@example.com',
      },
      PrimaryPhone: {
        FreeFormNumber: '555-555-5555',
      },
      BillAddr: {
        Line1: '123 Main St',
        City: 'Anytown',
        CountrySubDivisionCode: 'CA',
        PostalCode: '12345',
      },
    },
  },
  async execute(input: any, auth: any): Promise<any> {
    try {
      // Validate input
      const customerIdSchema = z.string().min(1);
      
      try {
        customerIdSchema.parse(input.customerId);
      } catch (error) {
        throw new Error(`Invalid customer ID: ${(error as Error).message}`);
      }

      // Create QuickBooks client
      const client = new QuickBooksClient(auth);

      // Make the API request
      const response = await client.makeRequest(
        auth,
        'GET',
        `customer/${input.customerId}`,
        undefined,
        input.includeDetails ? { minorversion: 65 } : undefined
      );

      return {
        customer: response.Customer,
      };
    } catch (error: any) {
      throw new Error(`Failed to get customer: ${error.message}`);
    }
  },
};
