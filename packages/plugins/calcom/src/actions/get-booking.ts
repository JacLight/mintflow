import { z } from 'zod';
import { CalComClient } from '../utils/index.js';

export const getBooking = {
  name: 'get_booking',
  displayName: 'Get Booking',
  description: 'Retrieve details of a specific booking from Cal.com',
  props: {
    bookingId: {
      type: 'string',
      displayName: 'Booking ID',
      description: 'The ID of the booking to retrieve',
      required: true,
    },
  },
  async run(context: any) {
    const { bookingId } = context.propsValue;
    
    const client = new CalComClient({
      apiKey: context.auth.apiKey,
    });

    try {
      const response = await client.getBooking(bookingId);
      return response;
    } catch (error: any) {
      throw new Error(`Failed to get booking: ${error.message}`);
    }
  },
};
