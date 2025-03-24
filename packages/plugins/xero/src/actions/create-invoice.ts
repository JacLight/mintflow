import { z } from 'zod';
import { XeroApiClient } from '../utils/index.js';

export const createInvoice = {
  name: 'create_invoice',
  displayName: 'Create Invoice',
  description: 'Create a new invoice in Xero',
  inputSchema: {
    type: 'object',
    properties: {
      contactId: {
        type: 'string',
        description: 'The ID of the contact for the invoice',
        required: true,
      },
      lineItems: {
        type: 'array',
        description: 'The line items for the invoice',
        items: {
          type: 'object',
          properties: {
            description: {
              type: 'string',
              description: 'The description of the item',
              required: true,
            },
            quantity: {
              type: 'number',
              description: 'The quantity of the item',
              default: 1,
              required: false,
            },
            unitAmount: {
              type: 'number',
              description: 'The unit amount of the item',
              required: true,
            },
            accountCode: {
              type: 'string',
              description: 'The account code for the item',
              required: false,
            },
            taxType: {
              type: 'string',
              description: 'The tax type for the item',
              required: false,
            },
          },
          required: ['description', 'unitAmount'],
        },
        required: true,
      },
      invoiceType: {
        type: 'string',
        description: 'The type of invoice',
        enum: ['ACCREC', 'ACCPAY'],
        default: 'ACCREC',
        required: false,
      },
      dueDate: {
        type: 'string',
        description: 'The due date of the invoice (YYYY-MM-DD)',
        required: false,
      },
      reference: {
        type: 'string',
        description: 'The reference for the invoice',
        required: false,
      },
      status: {
        type: 'string',
        description: 'The status of the invoice',
        enum: ['DRAFT', 'SUBMITTED', 'AUTHORISED'],
        default: 'DRAFT',
        required: false,
      },
    },
    required: ['contactId', 'lineItems'],
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
    contactId: '00000000-0000-0000-0000-000000000000',
    lineItems: [
      {
        description: 'Consulting Services',
        quantity: 2,
        unitAmount: 100,
        accountCode: '200',
      },
    ],
    invoiceType: 'ACCREC',
    dueDate: '2023-12-31',
    reference: 'INV-001',
    status: 'DRAFT',
  },
  exampleOutput: {
    invoice: {
      InvoiceID: '00000000-0000-0000-0000-000000000000',
      Type: 'ACCREC',
      Contact: {
        ContactID: '00000000-0000-0000-0000-000000000000',
        Name: 'John Doe',
      },
      Date: '2023-12-01',
      DueDate: '2023-12-31',
      Status: 'DRAFT',
      LineAmountTypes: 'Exclusive',
      LineItems: [
        {
          Description: 'Consulting Services',
          Quantity: 2,
          UnitAmount: 100,
          AccountCode: '200',
          LineAmount: 200,
        },
      ],
      SubTotal: 200,
      TotalTax: 0,
      Total: 200,
    },
  },
  async execute(input: any, auth: any): Promise<any> {
    try {
      // Validate input
      const contactIdSchema = z.string().uuid();
      const lineItemsSchema = z.array(
        z.object({
          description: z.string().min(1),
          quantity: z.number().positive().default(1),
          unitAmount: z.number().positive(),
          accountCode: z.string().optional(),
          taxType: z.string().optional(),
        })
      ).min(1);
      const invoiceTypeSchema = z.enum(['ACCREC', 'ACCPAY']).default('ACCREC');
      const dueDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional();
      const referenceSchema = z.string().optional();
      const statusSchema = z.enum(['DRAFT', 'SUBMITTED', 'AUTHORISED']).default('DRAFT');
      
      try {
        contactIdSchema.parse(input.contactId);
        lineItemsSchema.parse(input.lineItems);
        if (input.invoiceType) {
          invoiceTypeSchema.parse(input.invoiceType);
        }
        if (input.dueDate) {
          dueDateSchema.parse(input.dueDate);
        }
        if (input.reference) {
          referenceSchema.parse(input.reference);
        }
        if (input.status) {
          statusSchema.parse(input.status);
        }
      } catch (error) {
        throw new Error(`Invalid input: ${(error as Error).message}`);
      }

      // Create Xero client
      const client = new XeroApiClient(auth);
      
      // Initialize the client with the refresh token
      await client.initialize(auth.refreshToken);

      // Format line items
      const formattedLineItems = input.lineItems.map((item: any) => {
        const lineItem: any = {
          Description: item.description,
          Quantity: item.quantity || 1,
          UnitAmount: item.unitAmount,
          LineAmount: (item.quantity || 1) * item.unitAmount,
        };

        if (item.accountCode) {
          lineItem.AccountCode = item.accountCode;
        }

        if (item.taxType) {
          lineItem.TaxType = item.taxType;
        }

        return lineItem;
      });

      // Create invoice data
      const invoiceData: any = {
        Type: input.invoiceType || 'ACCREC',
        Contact: {
          ContactID: input.contactId,
        },
        LineItems: formattedLineItems,
        Date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
        Status: input.status || 'DRAFT',
        LineAmountTypes: 'Exclusive', // Tax exclusive
      };

      if (input.dueDate) {
        invoiceData.DueDate = input.dueDate;
      }

      if (input.reference) {
        invoiceData.Reference = input.reference;
      }

      // Create the invoice
      const response = await client.createInvoice(invoiceData);

      return {
        invoice: response.Invoices?.[0],
      };
    } catch (error: any) {
      throw new Error(`Failed to create invoice: ${error.message}`);
    }
  },
};
