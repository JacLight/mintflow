import { FreshbooksClient } from '../utils/index.js';

export const newInvoice = {
  name: 'new_invoice',
  displayName: 'New Invoice',
  description: 'Triggers when a new invoice is created in Freshbooks',
  type: 'polling',
  sampleData: {
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
  async run(context: any): Promise<any> {
    const auth = context.auth;
    const store = context.store;

    try {
      // Create Freshbooks client
      const client = new FreshbooksClient(auth);

      // Get the last poll time from the store
      const lastPollTime = store.get('lastPollTime') || new Date(0).toISOString();
      
      // Update the last poll time
      const currentTime = new Date().toISOString();
      store.set('lastPollTime', currentTime);

      // Get invoices created since the last poll
      // Freshbooks API doesn't support filtering by created_at directly,
      // so we'll get all invoices and filter them in code
      const response = await client.getInvoices({
        per_page: 100,
        sort: 'create_date_desc', // Get newest first
      });

      if (!response.response || !response.response.result || !response.response.result.invoices) {
        return [];
      }

      // Filter out invoices that are not new
      const newInvoices = response.response.result.invoices.filter((invoice: any) => {
        // Check if the invoice was created after the last poll
        // Freshbooks uses updated field for the last update timestamp
        const updated = invoice.updated;
        if (!updated) return false;
        
        const updatedDate = new Date(updated);
        const lastPollDate = new Date(lastPollTime);
        
        return updatedDate > lastPollDate;
      });

      // Return the new invoices
      return newInvoices.map((invoice: any) => ({
        invoice,
      }));
    } catch (error: any) {
      throw new Error(`Failed to get new invoices: ${error.message}`);
    }
  },
};
