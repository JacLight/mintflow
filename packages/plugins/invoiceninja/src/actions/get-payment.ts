import { z } from 'zod';
import { InvoiceNinjaClient } from '../utils/index.js';

export const getPayment = {
  name: 'get_payment',
  displayName: 'Get Payment',
  description: 'Retrieve a payment from InvoiceNinja by ID',
  inputSchema: {
    type: 'object',
    properties: {
      paymentId: {
        type: 'string',
        description: 'The ID of the payment to retrieve',
        required: true,
      },
      includeInvoices: {
        type: 'boolean',
        description: 'Whether to include invoice information',
        default: true,
        required: false,
      },
    },
    required: ['paymentId'],
  },
  outputSchema: {
    type: 'object',
    properties: {
      payment: {
        type: 'object',
        description: 'The payment data',
      },
    },
  },
  exampleInput: {
    paymentId: '1',
    includeInvoices: true,
  },
  exampleOutput: {
    payment: {
      id: '1',
      client_id: '1',
      amount: 100,
      date: '2023-12-01',
      transaction_reference: 'TRANS-123',
      private_notes: '',
      is_deleted: false,
      payment_type_id: '1',
      invoices: [
        {
          id: '1',
          amount: 100,
          invoice_id: '1',
          invoice_number: 'INV-0001',
        },
      ],
    },
  },
  async execute(input: any, auth: any): Promise<any> {
    try {
      // Validate input
      const paymentIdSchema = z.string().min(1);
      const includeInvoicesSchema = z.boolean().default(true);
      
      try {
        paymentIdSchema.parse(input.paymentId);
        if (input.includeInvoices !== undefined) {
          includeInvoicesSchema.parse(input.includeInvoices);
        }
      } catch (error) {
        throw new Error(`Invalid input: ${(error as Error).message}`);
      }

      // Create InvoiceNinja client
      const client = new InvoiceNinjaClient(auth);

      // Get the payment
      const response = await client.getPayment(input.paymentId);

      // Filter out invoices if not requested
      if (response.data && !input.includeInvoices && response.data.invoices) {
        delete response.data.invoices;
      }

      return {
        payment: response.data,
      };
    } catch (error: any) {
      throw new Error(`Failed to get payment: ${error.message}`);
    }
  },
};
