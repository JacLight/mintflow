import { z } from 'zod';
import { FreshbooksClient } from '../utils/index.js';

export const createInvoice = {
  name: 'create_invoice',
  displayName: 'Create Invoice',
  description: 'Create a new invoice in Freshbooks',
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
            name: {
              type: 'string',
              description: 'The name of the item',
              required: true,
            },
            description: {
              type: 'string',
              description: 'The description of the item',
              required: false,
            },
            rate: {
              type: 'number',
              description: 'The rate of the item',
              required: true,
            },
            quantity: {
              type: 'number',
              description: 'The quantity of the item',
              default: 1,
              required: false,
            },
            taxName1: {
              type: 'string',
              description: 'The name of the first tax',
              required: false,
            },
            taxAmount1: {
              type: 'number',
              description: 'The amount of the first tax',
              required: false,
            },
            taxName2: {
              type: 'string',
              description: 'The name of the second tax',
              required: false,
            },
            taxAmount2: {
              type: 'number',
              description: 'The amount of the second tax',
              required: false,
            },
          },
          required: ['name', 'rate'],
        },
        required: true,
      },
      invoiceNumber: {
        type: 'string',
        description: 'The invoice number',
        required: false,
      },
      createDate: {
        type: 'string',
        description: 'The creation date of the invoice (YYYY-MM-DD)',
        required: false,
      },
      dueDate: {
        type: 'string',
        description: 'The due date of the invoice (YYYY-MM-DD)',
        required: false,
      },
      poNumber: {
        type: 'string',
        description: 'The purchase order number',
        required: false,
      },
      discount: {
        type: 'number',
        description: 'The discount percentage',
        required: false,
      },
      notes: {
        type: 'string',
        description: 'Notes to be displayed on the invoice',
        required: false,
      },
      terms: {
        type: 'string',
        description: 'Terms to be displayed on the invoice',
        required: false,
      },
      currency: {
        type: 'string',
        description: 'The currency code for the invoice (e.g., USD, EUR, GBP)',
        required: false,
      },
      language: {
        type: 'string',
        description: 'The language code for the invoice (e.g., en, fr, es)',
        required: false,
      },
      sendEmail: {
        type: 'boolean',
        description: 'Whether to send the invoice to the client via email',
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
    clientId: '123456',
    lineItems: [
      {
        name: 'Consulting Services',
        description: 'Professional consulting services',
        rate: 100,
        quantity: 2,
      },
    ],
    createDate: '2023-12-01',
    dueDate: '2023-12-31',
    notes: 'Thank you for your business',
    sendEmail: false,
  },
  exampleOutput: {
    invoice: {
      id: 654321,
      client_id: 123456,
      number: 'INV-0001',
      create_date: '2023-12-01',
      due_date: '2023-12-31',
      status: 1,
      amount: {
        amount: '200.00',
        code: 'USD',
      },
      outstanding: {
        amount: '200.00',
        code: 'USD',
      },
      notes: 'Thank you for your business',
      lines: [
        {
          id: 1,
          name: 'Consulting Services',
          description: 'Professional consulting services',
          unit_cost: {
            amount: '100.00',
            code: 'USD',
          },
          quantity: 2,
          amount: {
            amount: '200.00',
            code: 'USD',
          },
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
          name: z.string().min(1),
          description: z.string().optional(),
          rate: z.number().positive(),
          quantity: z.number().positive().default(1),
          taxName1: z.string().optional(),
          taxAmount1: z.number().optional(),
          taxName2: z.string().optional(),
          taxAmount2: z.number().optional(),
        })
      ).min(1);
      const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional();
      
      try {
        clientIdSchema.parse(input.clientId);
        lineItemsSchema.parse(input.lineItems);
        if (input.createDate) {
          dateSchema.parse(input.createDate);
        }
        if (input.dueDate) {
          dateSchema.parse(input.dueDate);
        }
      } catch (error) {
        throw new Error(`Invalid input: ${(error as Error).message}`);
      }

      // Create Freshbooks client
      const client = new FreshbooksClient(auth);

      // Format line items
      const formattedLineItems = input.lineItems.map((item: any) => {
        const lineItem: any = {
          name: item.name,
          description: item.description || '',
          unit_cost: {
            amount: item.rate.toString(),
            code: input.currency || 'USD',
          },
          quantity: item.quantity || 1,
        };

        if (item.taxName1 && item.taxAmount1) {
          lineItem.tax_name1 = item.taxName1;
          lineItem.tax_amount1 = item.taxAmount1;
        }

        if (item.taxName2 && item.taxAmount2) {
          lineItem.tax_name2 = item.taxName2;
          lineItem.tax_amount2 = item.taxAmount2;
        }

        return lineItem;
      });

      // Create invoice data
      const invoiceData: any = {
        clientid: input.clientId,
        lines: formattedLineItems,
      };

      if (input.invoiceNumber) {
        invoiceData.invoice_number = input.invoiceNumber;
      }

      if (input.createDate) {
        invoiceData.create_date = input.createDate;
      }

      if (input.dueDate) {
        invoiceData.due_date = input.dueDate;
      }

      if (input.poNumber) {
        invoiceData.po_number = input.poNumber;
      }

      if (input.discount !== undefined) {
        invoiceData.discount_value = input.discount;
      }

      if (input.notes) {
        invoiceData.notes = input.notes;
      }

      if (input.terms) {
        invoiceData.terms = input.terms;
      }

      if (input.currency) {
        invoiceData.currency_code = input.currency;
      }

      if (input.language) {
        invoiceData.language = input.language;
      }

      // Create the invoice
      const response = await client.createInvoice(invoiceData);

      // Extract invoice data from response
      if (!response.response || !response.response.result || !response.response.result.invoice) {
        throw new Error('Failed to create invoice or invalid response format');
      }

      // Send the invoice via email if requested
      if (input.sendEmail && response.response.result.invoice.id) {
        try {
          await client.makeRequest(
            'PUT',
            `/accounting/account/:account_id/invoices/invoices/${response.response.result.invoice.id}/email`,
            {}
          );
        } catch (emailError) {
          console.error('Failed to email invoice:', emailError);
          // Continue with the response even if emailing fails
        }
      }

      return {
        invoice: response.response.result.invoice,
      };
    } catch (error: any) {
      throw new Error(`Failed to create invoice: ${error.message}`);
    }
  },
};
