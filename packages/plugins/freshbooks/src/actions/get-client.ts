import { z } from 'zod';
import { FreshbooksClient } from '../utils/index.js';

export const getClient = {
  name: 'get_client',
  displayName: 'Get Client',
  description: 'Retrieve a client from Freshbooks by ID',
  inputSchema: {
    type: 'object',
    properties: {
      clientId: {
        type: 'string',
        description: 'The ID of the client to retrieve',
        required: true,
      },
    },
    required: ['clientId'],
  },
  outputSchema: {
    type: 'object',
    properties: {
      client: {
        type: 'object',
        description: 'The client data',
      },
    },
  },
  exampleInput: {
    clientId: '123456',
  },
  exampleOutput: {
    client: {
      id: 123456,
      organization: 'ACME Inc.',
      fname: 'John',
      lname: 'Doe',
      email: 'john.doe@example.com',
      home_phone: '555-555-5555',
      mobile: '555-555-5556',
      bus_phone: '555-555-5557',
      fax: '555-555-5558',
      notes: 'Important client',
      p_street: '123 Main St',
      p_city: 'Anytown',
      p_state: 'CA',
      p_country: 'United States',
      p_code: '12345',
      s_street: '123 Main St',
      s_city: 'Anytown',
      s_state: 'CA',
      s_country: 'United States',
      s_code: '12345',
      currency_code: 'USD',
      language: 'en',
      bill_method: 'send_email',
      vat_number: '',
      pref_email: true,
      username: 'johndoe',
      updated: '2023-01-01 12:00:00',
      last_activity: '2023-01-01 12:00:00',
      num_logins: 5,
      signup_date: '2022-01-01 12:00:00',
      last_login: '2023-01-01 12:00:00',
      industry: 'Technology',
      company_size: '10-50',
      business_type: 'Corporation',
      accounting_systemid: 'freshbooks',
      address: '123 Main St, Anytown, CA, 12345, United States',
    },
  },
  async execute(input: any, auth: any): Promise<any> {
    try {
      // Validate input
      const clientIdSchema = z.string().min(1);
      
      try {
        clientIdSchema.parse(input.clientId);
      } catch (error) {
        throw new Error(`Invalid input: ${(error as Error).message}`);
      }

      // Create Freshbooks client
      const client = new FreshbooksClient(auth);

      // Get the client
      const response = await client.getClient(input.clientId);

      // Extract client data from response
      if (!response.response || !response.response.result || !response.response.result.client) {
        throw new Error('Client not found or invalid response format');
      }

      return {
        client: response.response.result.client,
      };
    } catch (error: any) {
      throw new Error(`Failed to get client: ${error.message}`);
    }
  },
};
