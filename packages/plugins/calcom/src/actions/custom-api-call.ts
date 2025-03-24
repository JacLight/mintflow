import { z } from 'zod';
import { CalComClient } from '../utils/index.js';

export const customApiCall = {
  name: 'custom_api_call',
  displayName: 'Custom API Call',
  description: 'Make a custom API call to Cal.com',
  props: {
    method: {
      type: 'string',
      displayName: 'Method',
      description: 'HTTP method for the API call',
      required: true,
      choices: [
        { value: 'GET', name: 'GET' },
        { value: 'POST', name: 'POST' },
        { value: 'PUT', name: 'PUT' },
        { value: 'PATCH', name: 'PATCH' },
        { value: 'DELETE', name: 'DELETE' },
      ],
    },
    endpoint: {
      type: 'string',
      displayName: 'Endpoint',
      description: 'API endpoint (e.g., /event-types)',
      required: true,
    },
    body: {
      type: 'object',
      displayName: 'Body',
      description: 'Request body for POST, PUT, and PATCH requests',
      required: false,
    },
  },
  async run(context: any) {
    const { method, endpoint, body } = context.propsValue;
    
    const client = new CalComClient({
      apiKey: context.auth.apiKey,
    });

    try {
      const response = await client.makeCustomApiCall(method, endpoint, body);
      return response;
    } catch (error: any) {
      throw new Error(`Cal.com API call failed: ${error.message}`);
    }
  },
};
