import { z } from 'zod';
import { QuickBooksClient } from '../utils/index.js';

export const createInvoice = {
  name: 'create_invoice',
  displayName: 'Create Invoice',
  description: 'Create a new invoice in QuickBooks',
  inputSchema: {
    type: 'object',
    properties: {
      customerId: {
        type: 'string',
        description: 'The ID of the customer for the invoice',
        required: true,
      },
      lineItems: {
        type: 'array',
        description: 'The line items for the invoice',
        items: {
          type: 'object',
          properties: {
            itemId: {
              type: 'string',
              description: 'The ID of the item',
              required: false,
            },
            description: {
              type: 'string',
              description: 'The description of the item',
              required: true,
            },
            amount: {
              type: 'number',
              description: 'The amount of the item',
              required: true,
            },
            quantity: {
              type: 'number',
              description: 'The quantity of the item',
              default: 1,
              required: false,
            },
          },
          required: ['description', 'amount'],
        },
        required: true,
      },
      dueDate: {
        type: 'string',
        description: 'The due date of the invoice (YYYY-MM-DD)',
        required: false,
      },
      memo: {
        type: 'string',
        description: 'A memo for the invoice',
        required: false,
      },
      emailToCustomer: {
        type: 'boolean',
        description: 'Whether to email the invoice to the customer',
        default: false,
        required: false,
      },
    },
    required: ['customerId', 'lineItems'],
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
    customerId: '1',
    lineItems: [
      {
        description: 'Consulting Services',
        amount: 100,
        quantity: 2,
      },
    ],
    dueDate: '2023-12-31',
    memo: 'Thank you for your business',
    emailToCustomer: false,
  },
  exampleOutput: {
    invoice: {
      Id: '123',
      DocNumber: 'INV-123',
      CustomerRef: {
        value: '1',
      },
      TotalAmt: 200,
      Balance: 200,
      DueDate: '2023-12-31',
    },
  },
  async execute(input: any, auth: any): Promise<any> {
    try {
      // Validate input
      const customerIdSchema = z.string().min(1);
      const lineItemsSchema = z.array(
        z.object({
          itemId: z.string().optional(),
          description: z.string().min(1),
          amount: z.number().positive(),
          quantity: z.number().positive().default(1),
        })
      ).min(1);
      const dueDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional();
      
      try {
        customerIdSchema.parse(input.customerId);
        lineItemsSchema.parse(input.lineItems);
        if (input.dueDate) {
          dueDateSchema.parse(input.dueDate);
        }
      } catch (error) {
        throw new Error(`Invalid input: ${(error as Error).message}`);
      }

      // Create QuickBooks client
      const client = new QuickBooksClient(auth);

      // Format line items
      const formattedLineItems = input.lineItems.map((item: any, index: number) => {
        const lineItem: any = {
          DetailType: 'SalesItemLineDetail',
          Amount: item.amount * (item.quantity || 1),
          Description: item.description,
          SalesItemLineDetail: {
            Qty: item.quantity || 1,
            UnitPrice: item.amount,
          },
        };

        if (item.itemId) {
          lineItem.SalesItemLineDetail.ItemRef = {
            value: item.itemId,
          };
        }

        return lineItem;
      });

      // Create invoice data
      const invoiceData: any = {
        Line: formattedLineItems,
        CustomerRef: {
          value: input.customerId,
        },
      };

      if (input.dueDate) {
        invoiceData.DueDate = input.dueDate;
      }

      if (input.memo) {
        invoiceData.CustomerMemo = {
          value: input.memo,
        };
      }

      // Make the API request
      const response = await client.makeRequest(
        auth,
        'POST',
        'invoice',
        invoiceData,
        { minorversion: 65 }
      );

      // Email the invoice if requested
      if (input.emailToCustomer && response.Invoice && response.Invoice.Id) {
        try {
          await client.makeRequest(
            auth,
            'POST',
            `invoice/${response.Invoice.Id}/send`,
            { sendTo: 'customer' },
            { minorversion: 65 }
          );
        } catch (emailError) {
          console.error('Failed to email invoice:', emailError);
          // Continue with the response even if emailing fails
        }
      }

      return {
        invoice: response.Invoice,
      };
    } catch (error: any) {
      throw new Error(`Failed to create invoice: ${error.message}`);
    }
  },
};
