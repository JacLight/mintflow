import { z } from 'zod';
import { FreshdeskClient } from '../utils/index.js';

export const getTicket = {
  name: 'get_ticket',
  displayName: 'Get Ticket',
  description: 'Retrieve a ticket from Freshdesk by ID',
  inputSchema: {
    type: 'object',
    properties: {
      ticketId: {
        type: 'number',
        description: 'The ID of the ticket to retrieve',
        required: true,
      },
    },
    required: ['ticketId'],
  },
  outputSchema: {
    type: 'object',
    properties: {
      ticket: {
        type: 'object',
        description: 'The ticket data',
      },
    },
  },
  exampleInput: {
    ticketId: 1,
  },
  exampleOutput: {
    ticket: {
      id: 1,
      subject: 'Support Needed',
      description: 'I need help with your product',
      status: 2,
      priority: 1,
      created_at: '2023-01-01T12:00:00Z',
      updated_at: '2023-01-01T12:30:00Z',
      requester_id: 123,
      responder_id: 456,
      group_id: 789,
      type: 'Question',
      tags: ['urgent', 'customer'],
      source: 1,
      custom_fields: {
        cf_department: 'Sales',
        cf_product: 'Product A',
      },
    },
  },
  async execute(input: any, auth: any): Promise<any> {
    try {
      // Validate input
      const ticketIdSchema = z.number().int().positive();
      
      try {
        ticketIdSchema.parse(input.ticketId);
      } catch (error) {
        throw new Error(`Invalid input: ${(error as Error).message}`);
      }

      // Create Freshdesk client
      const client = new FreshdeskClient(auth);

      // Get the ticket
      const ticket = await client.getTicket(input.ticketId);

      return {
        ticket,
      };
    } catch (error: any) {
      throw new Error(`Failed to get ticket: ${error.message}`);
    }
  },
};
