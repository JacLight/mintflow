import { FreshdeskClient } from '../utils/index.js';

export const newTicket = {
  name: 'new_ticket',
  displayName: 'New Ticket',
  description: 'Triggers when a new ticket is created in Freshdesk',
  type: 'polling',
  sampleData: {
    ticket: {
      id: 1,
      subject: 'Support Needed',
      description: 'I need help with your product',
      status: 2,
      priority: 1,
      created_at: '2023-01-01T12:00:00Z',
      updated_at: '2023-01-01T12:30:00Z',
      requester_id: 123,
      responder_id: 456,
      group_id: 789,
      type: 'Question',
      tags: ['urgent', 'customer'],
      source: 1,
      custom_fields: {
        cf_department: 'Sales',
        cf_product: 'Product A',
      },
    },
  },
  async run(context: any): Promise<any> {
    const auth = context.auth;
    const store = context.store;

    try {
      // Create Freshdesk client
      const client = new FreshdeskClient(auth);

      // Get the last poll time from the store
      const lastPollTime = store.get('lastPollTime') || new Date(0).toISOString();
      
      // Update the last poll time
      const currentTime = new Date().toISOString();
      store.set('lastPollTime', currentTime);

      // Get tickets created since the last poll
      // Freshdesk API doesn't support filtering by created_at directly,
      // so we'll get all tickets and filter them in code
      const tickets = await client.getTickets({
        per_page: 100,
        order_by: 'created_at',
        order_type: 'desc',
      });

      if (!tickets || !Array.isArray(tickets)) {
        return [];
      }

      // Filter out tickets that are not new
      const newTickets = tickets.filter((ticket: any) => {
        // Check if the ticket was created after the last poll
        const createdAt = ticket.created_at;
        if (!createdAt) return false;
        
        const createdDate = new Date(createdAt);
        const lastPollDate = new Date(lastPollTime);
        
        return createdDate > lastPollDate;
      });

      // Return the new tickets
      return newTickets.map((ticket: any) => ({
        ticket,
      }));
    } catch (error: any) {
      throw new Error(`Failed to get new tickets: ${error.message}`);
    }
  },
};
