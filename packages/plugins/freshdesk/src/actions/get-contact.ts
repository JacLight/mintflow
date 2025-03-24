import { z } from 'zod';
import { FreshdeskClient } from '../utils/index.js';

export const getContact = {
  name: 'get_contact',
  displayName: 'Get Contact',
  description: 'Retrieve a contact from Freshdesk by ID',
  inputSchema: {
    type: 'object',
    properties: {
      contactId: {
        type: 'number',
        description: 'The ID of the contact to retrieve',
        required: true,
      },
    },
    required: ['contactId'],
  },
  outputSchema: {
    type: 'object',
    properties: {
      contact: {
        type: 'object',
        description: 'The contact data',
      },
    },
  },
  exampleInput: {
    contactId: 123,
  },
  exampleOutput: {
    contact: {
      id: 123,
      name: 'John Doe',
      email: 'john.doe@example.com',
      phone: '555-555-5555',
      mobile: '555-555-5556',
      address: '123 Main St, Anytown, CA 12345',
      company_id: 456,
      description: 'VIP Customer',
      job_title: 'CEO',
      language: 'en',
      time_zone: 'Eastern Time (US & Canada)',
      created_at: '2023-01-01T12:00:00Z',
      updated_at: '2023-01-01T12:30:00Z',
      custom_fields: {
        cf_department: 'Executive',
        cf_account_type: 'Enterprise',
      },
      tags: ['vip', 'enterprise'],
    },
  },
  async execute(input: any, auth: any): Promise<any> {
    try {
      // Validate input
      const contactIdSchema = z.number().int().positive();
      
      try {
        contactIdSchema.parse(input.contactId);
      } catch (error) {
        throw new Error(`Invalid input: ${(error as Error).message}`);
      }

      // Create Freshdesk client
      const client = new FreshdeskClient(auth);

      // Get the contact
      const contact = await client.getContact(input.contactId);

      return {
        contact,
      };
    } catch (error: any) {
      throw new Error(`Failed to get contact: ${error.message}`);
    }
  },
};
