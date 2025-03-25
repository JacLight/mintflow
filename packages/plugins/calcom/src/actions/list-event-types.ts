import { z } from 'zod';
import { CalComClient } from '../utils/index.js';

export const listEventTypes = {
  name: 'list_event_types',
  displayName: 'List Event Types',
  description: 'Retrieve a list of all event types from Cal.com',
  props: {},
  async run(context: any) {
    const client = new CalComClient({
      apiKey: context.auth.apiKey,
    });

    try {
      const response = await client.getEventTypes();
      return response;
    } catch (error: any) {
      throw new Error(`Failed to list event types: ${error.message}`);
    }
  },
};
