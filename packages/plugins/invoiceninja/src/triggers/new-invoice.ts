import { InvoiceNinjaClient } from '../utils/index.js';

export const newInvoice = {
  name: 'new_invoice',
  displayName: 'New Invoice',
  description: 'Triggers when a new invoice is created in InvoiceNinja',
  type: 'polling',
  sampleData: {
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
  async run(context: any): Promise<any> {
    const auth = context.auth;
    const store = context.store;

    try {
      // Create InvoiceNinja client
      const client = new InvoiceNinjaClient(auth);

      // Get the last poll time from the store
      const lastPollTime = store.get('lastPollTime') || new Date(0).toISOString();
      
      // Update the last poll time
      const currentTime = new Date().toISOString();
      store.set('lastPollTime', currentTime);

      // Get invoices created since the last poll
      // InvoiceNinja API doesn't support filtering by created_at directly,
      // so we'll get all invoices and filter them in code
      const response = await client.getInvoices({
        per_page: 100,
        sort: 'id|desc', // Get newest first
      });

      if (!response.data || !Array.isArray(response.data)) {
        return [];
      }

      // Filter out invoices that are not new
      const newInvoices = response.data.filter((invoice: any) => {
        // Check if the invoice was created after the last poll
        // InvoiceNinja uses created_at field for the creation timestamp
        const createdAt = invoice.created_at;
        if (!createdAt) return false;
        
        const createdDate = new Date(createdAt);
        const lastPollDate = new Date(lastPollTime);
        
        return createdDate > lastPollDate;
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
