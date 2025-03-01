import { z } from 'zod';
import { InvoiceNinjaClient } from '../utils/index.js';

export const getClient = {
  name: 'get_client',
  displayName: 'Get Client',
  description: 'Retrieve a client from InvoiceNinja by ID',
  inputSchema: {
    type: 'object',
    properties: {
      clientId: {
        type: 'string',
        description: 'The ID of the client to retrieve',
        required: true,
      },
      includeContacts: {
        type: 'boolean',
        description: 'Whether to include contact information',
        default: true,
        required: false,
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
    clientId: '1',
    includeContacts: true,
  },
  exampleOutput: {
    client: {
      id: '1',
      name: 'John Doe',
      number: 'CLIENT-0001',
      balance: 0,
      paid_to_date: 0,
      address1: '123 Main St',
      address2: '',
      city: 'Anytown',
      state: 'CA',
      postal_code: '12345',
      country_id: '1',
      phone: '555-555-5555',
      private_notes: '',
      website: 'https://example.com',
      industry_id: null,
      size_id: null,
      is_deleted: false,
      vat_number: '',
      id_number: '',
      currency_id: '1',
      settings: {
        currency_id: '1',
      },
      contacts: [
        {
          id: '1',
          first_name: 'John',
          last_name: 'Doe',
          email: 'john.doe@example.com',
          phone: '555-555-5555',
          is_primary: true,
        },
      ],
    },
  },
  async execute(input: any, auth: any): Promise<any> {
    try {
      // Validate input
      const clientIdSchema = z.string().min(1);
      const includeContactsSchema = z.boolean().default(true);
      
      try {
        clientIdSchema.parse(input.clientId);
        if (input.includeContacts !== undefined) {
          includeContactsSchema.parse(input.includeContacts);
        }
      } catch (error) {
        throw new Error(`Invalid input: ${(error as Error).message}`);
      }

      // Create InvoiceNinja client
      const client = new InvoiceNinjaClient(auth);

      // Get the client
      const response = await client.getClient(input.clientId);

      // Filter out contacts if not requested
      if (response.data && !input.includeContacts && response.data.contacts) {
        delete response.data.contacts;
      }

      return {
        client: response.data,
      };
    } catch (error: any) {
      throw new Error(`Failed to get client: ${error.message}`);
    }
  },
};
