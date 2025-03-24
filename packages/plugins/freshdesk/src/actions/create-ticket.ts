import { z } from 'zod';
import { FreshdeskClient } from '../utils/index.js';

export const createTicket = {
  name: 'create_ticket',
  displayName: 'Create Ticket',
  description: 'Create a new ticket in Freshdesk',
  inputSchema: {
    type: 'object',
    properties: {
      subject: {
        type: 'string',
        description: 'The subject of the ticket',
        required: true,
      },
      description: {
        type: 'string',
        description: 'The description of the ticket',
        required: true,
      },
      email: {
        type: 'string',
        description: 'The email of the requester',
        required: true,
      },
      priority: {
        type: 'number',
        description: 'The priority of the ticket (1-4: Low, Medium, High, Urgent)',
        enum: [1, 2, 3, 4],
        default: 2,
        required: false,
      },
      status: {
        type: 'number',
        description: 'The status of the ticket (2-5: Open, Pending, Resolved, Closed)',
        enum: [2, 3, 4, 5],
        default: 2,
        required: false,
      },
      type: {
        type: 'string',
        description: 'The type of the ticket',
        required: false,
      },
      tags: {
        type: 'array',
        description: 'The tags to add to the ticket',
        items: {
          type: 'string',
        },
        required: false,
      },
      cc_emails: {
        type: 'array',
        description: 'The CC emails for the ticket',
        items: {
          type: 'string',
        },
        required: false,
      },
      custom_fields: {
        type: 'object',
        description: 'The custom fields for the ticket',
        required: false,
      },
      due_by: {
        type: 'string',
        description: 'The due date of the ticket (ISO 8601 format)',
        required: false,
      },
      group_id: {
        type: 'number',
        description: 'The ID of the group to assign the ticket to',
        required: false,
      },
      responder_id: {
        type: 'number',
        description: 'The ID of the agent to assign the ticket to',
        required: false,
      },
    },
    required: ['subject', 'description', 'email'],
  },
  outputSchema: {
    type: 'object',
    properties: {
      ticket: {
        type: 'object',
        description: 'The created ticket data',
      },
    },
  },
  exampleInput: {
    subject: 'Support Needed',
    description: 'I need help with your product',
    email: 'customer@example.com',
    priority: 2,
    status: 2,
    tags: ['urgent', 'customer'],
    custom_fields: {
      cf_department: 'Sales',
      cf_product: 'Product A',
    },
  },
  exampleOutput: {
    ticket: {
      id: 1,
      subject: 'Support Needed',
      description: 'I need help with your product',
      status: 2,
      priority: 2,
      created_at: '2023-01-01T12:00:00Z',
      updated_at: '2023-01-01T12:00:00Z',
      requester_id: 123,
      responder_id: null,
      group_id: null,
      type: null,
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
      const subjectSchema = z.string().min(1);
      const descriptionSchema = z.string().min(1);
      const emailSchema = z.string().email();
      const prioritySchema = z.number().int().min(1).max(4).optional();
      const statusSchema = z.number().int().min(2).max(5).optional();
      
      try {
        subjectSchema.parse(input.subject);
        descriptionSchema.parse(input.description);
        emailSchema.parse(input.email);
        if (input.priority !== undefined) {
          prioritySchema.parse(input.priority);
        }
        if (input.status !== undefined) {
          statusSchema.parse(input.status);
        }
      } catch (error) {
        throw new Error(`Invalid input: ${(error as Error).message}`);
      }

      // Create Freshdesk client
      const client = new FreshdeskClient(auth);

      // Prepare ticket data
      const ticketData: any = {
        subject: input.subject,
        description: input.description,
        email: input.email,
      };

      // Add optional fields if provided
      if (input.priority !== undefined) {
        ticketData.priority = input.priority;
      }
      if (input.status !== undefined) {
        ticketData.status = input.status;
      }
      if (input.type !== undefined) {
        ticketData.type = input.type;
      }
      if (input.tags !== undefined) {
        ticketData.tags = input.tags;
      }
      if (input.cc_emails !== undefined) {
        ticketData.cc_emails = input.cc_emails;
      }
      if (input.custom_fields !== undefined) {
        ticketData.custom_fields = input.custom_fields;
      }
      if (input.due_by !== undefined) {
        ticketData.due_by = input.due_by;
      }
      if (input.group_id !== undefined) {
        ticketData.group_id = input.group_id;
      }
      if (input.responder_id !== undefined) {
        ticketData.responder_id = input.responder_id;
      }

      // Create the ticket
      const ticket = await client.createTicket(ticketData);

      return {
        ticket,
      };
    } catch (error: any) {
      throw new Error(`Failed to create ticket: ${error.message}`);
    }
  },
};
