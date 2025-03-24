import axios from 'axios';

export interface SendMmsProps {
  from_number: string;
  to_number: number;
  content: string;
  media_url: string;
}

export const sendMms = {
  name: 'send-mms',
  displayName: 'Send MMS',
  description: 'Send an MMS message with media through KrispCall',
  inputSchema: {
    type: 'object',
    properties: {
      from_number: {
        type: 'string',
        description: 'The phone number to send from',
        required: true,
      },
      to_number: {
        type: 'number',
        description: 'The phone number to send to',
        required: true,
      },
      content: {
        type: 'string',
        description: 'The content of the MMS message',
        required: true,
      },
      media_url: {
        type: 'string',
        description: 'URL of the media to send',
        required: true,
      },
    },
  },
  outputSchema: {
    type: 'object',
    properties: {
      id: { type: 'string' },
      status: { type: 'string' },
      message: { type: 'string' },
    },
  },
  async execute(input: SendMmsProps, config: any) {
    const apiKey = config.auth?.api_key;

    if (!apiKey) {
      throw new Error('API key is required for KrispCall');
    }

    try {
      const response = await axios.post(
        'https://automationapi.krispcall.com/api/v1/platform/activepiece/send-mms',
        {
          from_number: input.from_number,
          to_number: input.to_number,
          content: input.content,
          media_url: input.media_url,
        },
        {
          headers: {
            'X-API-KEY': apiKey,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error sending MMS through KrispCall:', error);
      throw error;
    }
  },
};
