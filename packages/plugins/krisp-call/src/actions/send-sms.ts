import axios from 'axios';

export interface SendSmsProps {
  from_number: string;
  to_number: number;
  content: string;
}

export const sendSms = {
  name: 'send-sms',
  displayName: 'Send SMS',
  description: 'Send an SMS message through KrispCall',
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
        description: 'The content of the SMS message',
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
  async execute(input: SendSmsProps, config: any) {
    const apiKey = config.auth?.api_key;

    if (!apiKey) {
      throw new Error('API key is required for KrispCall');
    }

    try {
      const response = await axios.post(
        'https://automationapi.krispcall.com/api/v1/platform/activepiece/send-sms',
        {
          from_number: input.from_number,
          to_number: input.to_number,
          content: input.content,
        },
        {
          headers: {
            'X-API-KEY': apiKey,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error sending SMS through KrispCall:', error);
      throw error;
    }
  },
};
