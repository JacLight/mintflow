import { FreshdeskClient } from '../utils/index.js';

export const updatedTicket = {
  name: 'updated_ticket',
  displayName: 'Updated Ticket',
  description: 'Triggers when a ticket is updated in Freshdesk',
  type: 'polling',
  sampleData: {
    ticket: {
      id: 1,
      subject: 'Support Needed',
      description: 'I need help with your product',
      status: 3, // Updated status (Pending)
      priority: 1,
      created_at: '2023-01-01T12:00:00Z',
      updated_at: '2023-01-01T13:30:00Z', // Updated time
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

      // Get tickets updated since the last poll
      // Freshdesk API doesn't support filtering by updated_at directly,
      // so we'll get all tickets and filter them in code
      const tickets = await client.getTickets({
        per_page: 100,
        order_by: 'updated_at',
        order_type: 'desc',
      });

      if (!tickets || !Array.isArray(tickets)) {
        return [];
      }

      // Filter out tickets that are not updated
      const updatedTickets = tickets.filter((ticket: any) => {
        // Check if the ticket was updated after the last poll
        const updatedAt = ticket.updated_at;
        const createdAt = ticket.created_at;
        
        if (!updatedAt || !createdAt) return false;
        
        const updatedDate = new Date(updatedAt);
        const createdDate = new Date(createdAt);
        const lastPollDate = new Date(lastPollTime);
        
        // Only include tickets that were updated after the last poll
        // and were not just created (to avoid duplicate triggers with new_ticket)
        return updatedDate > lastPollDate && createdDate <= lastPollDate;
      });

      // Return the updated tickets
      return updatedTickets.map((ticket: any) => ({
        ticket,
      }));
    } catch (error: any) {
      throw new Error(`Failed to get updated tickets: ${error.message}`);
    }
  },
};
