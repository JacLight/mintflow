import { InvoiceNinjaClient } from '../utils/index.js';

export const newPayment = {
  name: 'new_payment',
  displayName: 'New Payment',
  description: 'Triggers when a new payment is created in InvoiceNinja',
  type: 'polling',
  sampleData: {
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

      // Get payments created since the last poll
      // InvoiceNinja API doesn't support filtering by created_at directly,
      // so we'll get all payments and filter them in code
      const response = await client.getPayments({
        per_page: 100,
        sort: 'id|desc', // Get newest first
      });

      if (!response.data || !Array.isArray(response.data)) {
        return [];
      }

      // Filter out payments that are not new
      const newPayments = response.data.filter((payment: any) => {
        // Check if the payment was created after the last poll
        // InvoiceNinja uses created_at field for the creation timestamp
        const createdAt = payment.created_at;
        if (!createdAt) return false;
        
        const createdDate = new Date(createdAt);
        const lastPollDate = new Date(lastPollTime);
        
        return createdDate > lastPollDate;
      });

      // Return the new payments
      return newPayments.map((payment: any) => ({
        payment,
      }));
    } catch (error: any) {
      throw new Error(`Failed to get new payments: ${error.message}`);
    }
  },
};
