import axios from 'axios';

export interface AddContactProps {
  name?: string;
  number: number;
  address?: string;
  company?: string;
  email?: string;
}

export const addContact = {
  name: 'add-contact',
  displayName: 'Add Contact',
  description: 'Add a new contact to KrispCall',
  inputSchema: {
    type: 'object',
    properties: {
      name: {
        type: 'string',
        description: 'The name of the contact',
        required: false,
      },
      number: {
        type: 'number',
        description: 'The contact number',
        required: true,
      },
      address: {
        type: 'string',
        description: 'The address of the contact',
        required: false,
      },
      company: {
        type: 'string',
        description: 'The company of the contact',
        required: false,
      },
      email: {
        type: 'string',
        description: 'The email of the contact',
        required: false,
      },
    },
  },
  outputSchema: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      name: { type: 'string' },
      number: { type: 'string' },
      address: { type: 'string' },
      company: { type: 'string' },
      email: { type: 'string' },
    },
  },
  async execute(input: AddContactProps, config: any) {
    const apiKey = config.auth?.api_key;

    if (!apiKey) {
      throw new Error('API key is required for KrispCall');
    }

    try {
      const response = await axios.post(
        'https://automationapi.krispcall.com/api/v1/platform/activepiece/add-contact',
        {
          name: input.name,
          number: input.number,
          company: input.company,
          email: input.email,
          address: input.address,
        },
        {
          headers: {
            'X-API-KEY': apiKey,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error adding contact to KrispCall:', error);
      throw error;
    }
  },
};
