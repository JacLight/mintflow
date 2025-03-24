import { z } from 'zod';
import { InvoiceNinjaClient } from '../utils/index.js';

export const createInvoice = {
  name: 'create_invoice',
  displayName: 'Create Invoice',
  description: 'Create a new invoice in InvoiceNinja',
  inputSchema: {
    type: 'object',
    properties: {
      clientId: {
        type: 'string',
        description: 'The ID of the client for the invoice',
        required: true,
      },
      lineItems: {
        type: 'array',
        description: 'The line items for the invoice',
        items: {
          type: 'object',
          properties: {
            productKey: {
              type: 'string',
              description: 'The product key or name',
              required: true,
            },
            notes: {
              type: 'string',
              description: 'The description of the item',
              required: false,
            },
            cost: {
              type: 'number',
              description: 'The cost of the item',
              required: true,
            },
            quantity: {
              type: 'number',
              description: 'The quantity of the item',
              default: 1,
              required: false,
            },
            taxRate1: {
              type: 'number',
              description: 'The first tax rate for the item',
              required: false,
            },
            taxRate2: {
              type: 'number',
              description: 'The second tax rate for the item',
              required: false,
            },
          },
          required: ['productKey', 'cost'],
        },
        required: true,
      },
      invoiceNumber: {
        type: 'string',
        description: 'The invoice number',
        required: false,
      },
      poNumber: {
        type: 'string',
        description: 'The purchase order number',
        required: false,
      },
      date: {
        type: 'string',
        description: 'The invoice date (YYYY-MM-DD)',
        required: false,
      },
      dueDate: {
        type: 'string',
        description: 'The due date of the invoice (YYYY-MM-DD)',
        required: false,
      },
      isAmountDiscount: {
        type: 'boolean',
        description: 'Whether the discount is a fixed amount (true) or a percentage (false)',
        default: false,
        required: false,
      },
      discount: {
        type: 'number',
        description: 'The discount amount or percentage',
        required: false,
      },
      publicNotes: {
        type: 'string',
        description: 'Public notes visible to the client',
        required: false,
      },
      privateNotes: {
        type: 'string',
        description: 'Private notes not visible to the client',
        required: false,
      },
      emailInvoice: {
        type: 'boolean',
        description: 'Whether to email the invoice to the client',
        default: false,
        required: false,
      },
    },
    required: ['clientId', 'lineItems'],
  },
  outputSchema: {
    type: 'object',
    properties: {
      invoice: {
        type: 'object',
        description: 'The created invoice data',
      },
    },
  },
  exampleInput: {
    clientId: '1',
    lineItems: [
      {
        productKey: 'Consulting',
        notes: 'Consulting Services',
        cost: 100,
        quantity: 2,
      },
    ],
    date: '2023-12-01',
    dueDate: '2023-12-31',
    publicNotes: 'Thank you for your business',
    emailInvoice: false,
  },
  exampleOutput: {
    invoice: {
      id: '1',
      number: 'INV-0001',
      client_id: '1',
      date: '2023-12-01',
      due_date: '2023-12-31',
      amount: 200,
      balance: 200,
      status_id: '1',
      public_notes: 'Thank you for your business',
      private_notes: '',
      line_items: [
        {
          product_key: 'Consulting',
          notes: 'Consulting Services',
          cost: 100,
          quantity: 2,
          line_total: 200,
        },
      ],
    },
  },
  async execute(input: any, auth: any): Promise<any> {
    try {
      // Validate input
      const clientIdSchema = z.string().min(1);
      const lineItemsSchema = z.array(
        z.object({
          productKey: z.string().min(1),
          notes: z.string().optional(),
          cost: z.number().positive(),
          quantity: z.number().positive().default(1),
          taxRate1: z.number().optional(),
          taxRate2: z.number().optional(),
        })
      ).min(1);
      const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional();
      
      try {
        clientIdSchema.parse(input.clientId);
        lineItemsSchema.parse(input.lineItems);
        if (input.date) {
          dateSchema.parse(input.date);
        }
        if (input.dueDate) {
          dateSchema.parse(input.dueDate);
        }
      } catch (error) {
        throw new Error(`Invalid input: ${(error as Error).message}`);
      }

      // Create InvoiceNinja client
      const client = new InvoiceNinjaClient(auth);

      // Format line items
      const formattedLineItems = input.lineItems.map((item: any) => {
        const lineItem: any = {
          product_key: item.productKey,
          notes: item.notes || '',
          cost: item.cost,
          quantity: item.quantity || 1,
        };

        if (item.taxRate1) {
          lineItem.tax_rate1 = item.taxRate1;
        }

        if (item.taxRate2) {
          lineItem.tax_rate2 = item.taxRate2;
        }

        return lineItem;
      });

      // Create invoice data
      const invoiceData: any = {
        client_id: input.clientId,
        line_items: formattedLineItems,
      };

      if (input.invoiceNumber) {
        invoiceData.number = input.invoiceNumber;
      }

      if (input.poNumber) {
        invoiceData.po_number = input.poNumber;
      }

      if (input.date) {
        invoiceData.date = input.date;
      }

      if (input.dueDate) {
        invoiceData.due_date = input.dueDate;
      }

      if (input.isAmountDiscount !== undefined) {
        invoiceData.is_amount_discount = input.isAmountDiscount;
      }

      if (input.discount !== undefined) {
        invoiceData.discount = input.discount;
      }

      if (input.publicNotes) {
        invoiceData.public_notes = input.publicNotes;
      }

      if (input.privateNotes) {
        invoiceData.private_notes = input.privateNotes;
      }

      // Create the invoice
      const response = await client.createInvoice(invoiceData);

      // Email the invoice if requested
      if (input.emailInvoice && response.data && response.data.id) {
        try {
          await client.makeRequest('POST', `api/v1/invoices/${response.data.id}/email`, {
            template: 'invoice',
          });
        } catch (emailError) {
          console.error('Failed to email invoice:', emailError);
          // Continue with the response even if emailing fails
        }
      }

      return {
        invoice: response.data,
      };
    } catch (error: any) {
      throw new Error(`Failed to create invoice: ${error.message}`);
    }
  },
};
