import { z } from 'zod';
import { XeroApiClient } from '../utils/index.js';

export const getContact = {
  name: 'get_contact',
  displayName: 'Get Contact',
  description: 'Retrieve a contact from Xero by ID',
  inputSchema: {
    type: 'object',
    properties: {
      contactId: {
        type: 'string',
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
    contactId: '00000000-0000-0000-0000-000000000000',
  },
  exampleOutput: {
    contact: {
      ContactID: '00000000-0000-0000-0000-000000000000',
      Name: 'John Doe',
      FirstName: 'John',
      LastName: 'Doe',
      EmailAddress: 'john.doe@example.com',
      Addresses: [
        {
          AddressType: 'STREET',
          AddressLine1: '123 Main St',
          City: 'Anytown',
          Region: 'CA',
          PostalCode: '12345',
          Country: 'USA',
        },
      ],
      Phones: [
        {
          PhoneType: 'DEFAULT',
          PhoneNumber: '555-555-5555',
        },
      ],
    },
  },
  async execute(input: any, auth: any): Promise<any> {
    try {
      // Validate input
      const contactIdSchema = z.string().uuid();
      
      try {
        contactIdSchema.parse(input.contactId);
      } catch (error) {
        throw new Error(`Invalid contact ID: ${(error as Error).message}`);
      }

      // Create Xero client
      const client = new XeroApiClient(auth);
      
      // Initialize the client with the refresh token
      await client.initialize(auth.refreshToken);

      // Get the contact
      const response = await client.getContact(input.contactId);

      return {
        contact: response.Contacts?.[0],
      };
    } catch (error: any) {
      throw new Error(`Failed to get contact: ${error.message}`);
    }
  },
};
