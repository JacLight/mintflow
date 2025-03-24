import { z } from 'zod';
import { CalComClient } from '../utils/index.js';

export const getEventType = {
  name: 'get_event_type',
  displayName: 'Get Event Type',
  description: 'Retrieve details of a specific event type from Cal.com',
  props: {
    eventTypeId: {
      type: 'string',
      displayName: 'Event Type ID',
      description: 'The ID of the event type to retrieve',
      required: true,
    },
  },
  async run(context: any) {
    const { eventTypeId } = context.propsValue;
    
    const client = new CalComClient({
      apiKey: context.auth.apiKey,
    });

    try {
      const response = await client.getEventType(eventTypeId);
      return response;
    } catch (error: any) {
      throw new Error(`Failed to get event type: ${error.message}`);
    }
  },
};
