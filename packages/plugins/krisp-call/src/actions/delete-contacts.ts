import axios from 'axios';

export interface DeleteContactsProps {
  contactIds: string[];
}

export const deleteContacts = {
  name: 'delete-contacts',
  displayName: 'Delete Contacts',
  description: 'Delete contacts from KrispCall',
  inputSchema: {
    type: 'object',
    properties: {
      contactIds: {
        type: 'array',
        description: 'Array of contact IDs to delete',
        items: {
          type: 'string',
        },
        required: true,
      },
    },
  },
  outputSchema: {
    type: 'object',
    properties: {
      success: { type: 'boolean' },
      message: { type: 'string' },
      deletedIds: { 
        type: 'array',
        items: { type: 'string' }
      },
    },
  },
  async execute(input: DeleteContactsProps, config: any) {
    const apiKey = config.auth?.api_key;

    if (!apiKey) {
      throw new Error('API key is required for KrispCall');
    }

    try {
      const response = await axios.post(
        'https://automationapi.krispcall.com/api/v1/platform/activepiece/delete-contacts',
        {
          contactIds: input.contactIds,
        },
        {
          headers: {
            'X-API-KEY': apiKey,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error deleting contacts from KrispCall:', error);
      throw error;
    }
  },
};
