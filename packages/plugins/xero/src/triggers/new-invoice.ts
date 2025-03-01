import { XeroApiClient } from '../utils/index.js';

export const newInvoice = {
  name: 'new_invoice',
  displayName: 'New Invoice',
  description: 'Triggers when a new invoice is created in Xero',
  type: 'polling',
  sampleData: {
    invoice: {
      InvoiceID: '00000000-0000-0000-0000-000000000000',
      Type: 'ACCREC',
      Contact: {
        ContactID: '00000000-0000-0000-0000-000000000000',
        Name: 'John Doe',
      },
      Date: '2023-12-01',
      DueDate: '2023-12-31',
      Status: 'AUTHORISED',
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
  async run(context: any): Promise<any> {
    const auth = context.auth;
    const store = context.store;

    try {
      // Create Xero client
      const client = new XeroApiClient(auth);
      
      // Initialize the client with the refresh token
      await client.initialize(auth.refreshToken);

      // Get the last poll time from the store
      const lastPollTime = store.get('lastPollTime') || new Date(0).toISOString();
      
      // Update the last poll time
      const currentTime = new Date().toISOString();
      store.set('lastPollTime', currentTime);

      // Get invoices created since the last poll
      const response = await client.getInvoices(`UpdatedDateUTC >= DateTime(${lastPollTime.split('.')[0]})`);

      // Filter out invoices that are not new
      const newInvoices = response.Invoices?.filter((invoice: any) => {
        const createdDate = new Date(invoice.UpdatedDateUTC);
        const lastPollDate = new Date(lastPollTime);
        return createdDate > lastPollDate;
      }) || [];

      // Return the new invoices
      return newInvoices.map((invoice: any) => ({
        invoice,
      }));
    } catch (error: any) {
      throw new Error(`Failed to get new invoices: ${error.message}`);
    }
  },
};
