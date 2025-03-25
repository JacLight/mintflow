import { z } from 'zod';
import { CalComClient } from '../utils/index.js';

export const listBookings = {
  name: 'list_bookings',
  displayName: 'List Bookings',
  description: 'Retrieve a list of bookings from Cal.com',
  props: {
    limit: {
      type: 'number',
      displayName: 'Limit',
      description: 'Maximum number of bookings to retrieve',
      required: false,
    },
    after: {
      type: 'string',
      displayName: 'After',
      description: 'Retrieve bookings after this date (ISO format)',
      required: false,
    },
    before: {
      type: 'string',
      displayName: 'Before',
      description: 'Retrieve bookings before this date (ISO format)',
      required: false,
    },
  },
  async run(context: any) {
    const { limit, after, before } = context.propsValue;
    
    const client = new CalComClient({
      apiKey: context.auth.apiKey,
    });

    try {
      const response = await client.getBookings({
        limit,
        after,
        before,
      });
      return response;
    } catch (error: any) {
      throw new Error(`Failed to list bookings: ${error.message}`);
    }
  },
};
