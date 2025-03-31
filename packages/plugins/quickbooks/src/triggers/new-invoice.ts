import { QuickBooksClient } from '../utils/index.js';

export const newInvoice = {
  name: 'new_invoice',
  displayName: 'New Invoice',
  description: 'Triggers when a new invoice is created in QuickBooks',
  type: 'webhook',
  sampleData: {
    invoice: {
      Id: '123',
      DocNumber: 'INV-123',
      CustomerRef: {
        value: '1',
        name: 'John Doe',
      },
      TotalAmt: 200,
      Balance: 200,
      DueDate: '2023-12-31',
      TxnDate: '2023-12-01',
      Line: [
        {
          DetailType: 'SalesItemLineDetail',
          Amount: 200,
          Description: 'Consulting Services',
          SalesItemLineDetail: {
            Qty: 2,
            UnitPrice: 100,
          },
        },
      ],
    },
  },
  async onEnable(context: any): Promise<any> {
    const auth = context.auth;
    const client = new QuickBooksClient(auth);

    try {
      // Create a webhook subscription for invoice events
      const webhookData = {
        webhookSubscription: {
          endpoint: context.webhookUrl,
          entities: [
            {
              type: 'Invoice',
              operations: ['Create'],
            },
          ],
        },
      };

      const response = await client.makeRequest(
        auth,
        'POST',
        'webhooks',
        webhookData,
        { minorversion: 65 }
      );

      return {
        webhookId: response.webhookSubscription.id,
      };
    } catch (error: any) {
      throw new Error(`Failed to create webhook subscription: ${error.message}`);
    }
  },
  async onDisable(context: any, configData: any): Promise<void> {
    const auth = context.auth;
    const client = new QuickBooksClient(auth);

    try {
      if (configData.webhookId) {
        // Delete the webhook subscription
        await client.makeRequest(
          auth,
          'DELETE',
          `webhooks/${configData.webhookId}`,
          undefined,
          { minorversion: 65 }
        );
      }
    } catch (error: any) {
      throw new Error(`Failed to delete webhook subscription: ${error.message}`);
    }
  },
  async run(context: any): Promise<any> {
    const auth = context.auth;
    const payload = context.payload;
    const client = new QuickBooksClient(auth);

    try {
      // Extract the invoice ID from the webhook payload
      const entities = payload.eventNotifications[0]?.dataChangeEvent?.entities;
      if (!entities || entities.length === 0) {
        throw new Error('No entities found in webhook payload');
      }

      const invoiceEntity = entities.find((entity: any) => entity.name === 'Invoice');
      if (!invoiceEntity) {
        throw new Error('No invoice entity found in webhook payload');
      }

      const invoiceId = invoiceEntity.id;
      if (!invoiceId) {
        throw new Error('No invoice ID found in webhook payload');
      }

      // Get the invoice details
      const response = await client.makeRequest(
        auth,
        'GET',
        `invoice/${invoiceId}`,
        undefined,
        { minorversion: 65 }
      );

      return {
        invoice: response.Invoice,
      };
    } catch (error: any) {
      throw new Error(`Failed to process webhook: ${error.message}`);
    }
  },
};
