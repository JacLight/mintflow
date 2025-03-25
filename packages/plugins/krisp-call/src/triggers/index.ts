import axios from 'axios';

export const triggers = [
  {
    name: 'new-voicemail',
    displayName: 'New Voicemail',
    description: 'Triggered when a new voicemail is received',
    type: 'webhook',
    sampleData: {
      id: '',
      from: '+9779821110987',
      duration: '5 seconds',
      call_time: '2000-10-31T01:30:00.000-05:00',
      voicemail_audio: 'voicemail.mp4',
    },
    inputSchema: {
      type: 'object',
      properties: {},
    },
    outputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        from: { type: 'string' },
        duration: { type: 'string' },
        call_time: { type: 'string' },
        voicemail_audio: { type: 'string' },
      },
    },
    async onEnable(context: any) {
      const apiKey = context.auth?.api_key;
      if (!apiKey) {
        throw new Error('API key is required for KrispCall');
      }

      const response = await axios.post(
        'https://automationapi.krispcall.com/api/v1/platform/activepiece/subscribe',
        {
          hookUrl: context.webhookUrl,
          action: 'new_voicemail',
        },
        {
          headers: {
            'X-API-KEY': apiKey,
          },
        }
      );

      return { id: response.data.id };
    },
    async onDisable(context: any) {
      const apiKey = context.auth?.api_key;
      if (!apiKey) {
        throw new Error('API key is required for KrispCall');
      }

      await axios.delete(
        'https://automationapi.krispcall.com/api/v1/platform/activepiece/unsubscribe',
        {
          data: {
            hookUrl: context.webhookId,
          },
          headers: {
            'X-API-KEY': apiKey,
          },
        }
      );
    },
  },
  {
    name: 'new-sms-mms',
    displayName: 'New SMS/MMS',
    description: 'Triggered when a new SMS or MMS is received',
    type: 'webhook',
    sampleData: {
      id: 'YiW2nyxqtJPYqkRKbrcJQ7',
      from_number: '+16466813538',
      to_number: '+12517327005',
      content: 'Test message',
      media_link: 'https://api.twilio.com/2010-04-01/Accounts/LINK/Media/SOMETHING',
    },
    inputSchema: {
      type: 'object',
      properties: {},
    },
    outputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        from_number: { type: 'string' },
        to_number: { type: 'string' },
        content: { type: 'string' },
        media_link: { type: 'string' },
      },
    },
    async onEnable(context: any) {
      const apiKey = context.auth?.api_key;
      if (!apiKey) {
        throw new Error('API key is required for KrispCall');
      }

      const response = await axios.post(
        'https://automationapi.krispcall.com/api/v1/platform/activepiece/subscribe',
        {
          hookUrl: context.webhookUrl,
          action: 'new_sms_or_mms',
        },
        {
          headers: {
            'X-API-KEY': apiKey,
          },
        }
      );

      return { id: response.data.id };
    },
    async onDisable(context: any) {
      const apiKey = context.auth?.api_key;
      if (!apiKey) {
        throw new Error('API key is required for KrispCall');
      }

      await axios.delete(
        'https://automationapi.krispcall.com/api/v1/platform/activepiece/unsubscribe',
        {
          data: {
            hookUrl: context.webhookId,
          },
          headers: {
            'X-API-KEY': apiKey,
          },
        }
      );
    },
  },
  {
    name: 'new-contact',
    displayName: 'New Contact',
    description: 'Triggered when a new contact is added',
    type: 'webhook',
    sampleData: {
      id: '1',
      email: 'john@example.com',
      company: 'KrispCall',
      address: 'Singapore',
      name: 'John Smith',
      contactNumber: '+9779834509123',
    },
    inputSchema: {
      type: 'object',
      properties: {},
    },
    outputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        email: { type: 'string' },
        company: { type: 'string' },
        address: { type: 'string' },
        name: { type: 'string' },
        contactNumber: { type: 'string' },
      },
    },
    async onEnable(context: any) {
      const apiKey = context.auth?.api_key;
      if (!apiKey) {
        throw new Error('API key is required for KrispCall');
      }

      const response = await axios.post(
        'https://automationapi.krispcall.com/api/v1/platform/activepiece/subscribe',
        {
          hookUrl: context.webhookUrl,
          action: 'new_contact',
        },
        {
          headers: {
            'X-API-KEY': apiKey,
          },
        }
      );

      return { id: response.data.id };
    },
    async onDisable(context: any) {
      const apiKey = context.auth?.api_key;
      if (!apiKey) {
        throw new Error('API key is required for KrispCall');
      }

      await axios.delete(
        'https://automationapi.krispcall.com/api/v1/platform/activepiece/unsubscribe',
        {
          data: {
            hookUrl: context.webhookId,
          },
          headers: {
            'X-API-KEY': apiKey,
          },
        }
      );
    },
  },
  {
    name: 'new-call-log',
    displayName: 'New Call Log',
    description: 'Triggered when a new call log is recorded',
    type: 'webhook',
    sampleData: {
      id: '101',
      callFrom: '+11234567890',
      callTo: '+11234567891',
      direction: 'Outgoing',
      duration: '0hr 01min 30sec',
      outcome: 'Completed',
      callRecording: 'http://example.com/recording.mp3',
    },
    inputSchema: {
      type: 'object',
      properties: {},
    },
    outputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        callFrom: { type: 'string' },
        callTo: { type: 'string' },
        direction: { type: 'string' },
        duration: { type: 'string' },
        outcome: { type: 'string' },
        callRecording: { type: 'string' },
      },
    },
    async onEnable(context: any) {
      const apiKey = context.auth?.api_key;
      if (!apiKey) {
        throw new Error('API key is required for KrispCall');
      }

      const response = await axios.post(
        'https://automationapi.krispcall.com/api/v1/platform/activepiece/subscribe',
        {
          hookUrl: context.webhookUrl,
          action: 'new_call_log',
        },
        {
          headers: {
            'X-API-KEY': apiKey,
          },
        }
      );

      return { id: response.data.id };
    },
    async onDisable(context: any) {
      const apiKey = context.auth?.api_key;
      if (!apiKey) {
        throw new Error('API key is required for KrispCall');
      }

      await axios.delete(
        'https://automationapi.krispcall.com/api/v1/platform/activepiece/unsubscribe',
        {
          data: {
            hookUrl: context.webhookId,
          },
          headers: {
            'X-API-KEY': apiKey,
          },
        }
      );
    },
  },
  {
    name: 'outbound-sms-mms',
    displayName: 'Outbound SMS/MMS',
    description: 'Triggered when a new SMS or MMS is sent',
    type: 'webhook',
    sampleData: {
      id: 'YiW2nyxqtJPYqkRKbrcJQ7',
      from_number: '+16466813538',
      to_number: '+12517327005',
      content: 'Test message',
      media_link: 'https://api.twilio.com/2010-04-01/Accounts/LINK/Media/SOMETHING',
    },
    inputSchema: {
      type: 'object',
      properties: {},
    },
    outputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        from_number: { type: 'string' },
        to_number: { type: 'string' },
        content: { type: 'string' },
        media_link: { type: 'string' },
      },
    },
    async onEnable(context: any) {
      const apiKey = context.auth?.api_key;
      if (!apiKey) {
        throw new Error('API key is required for KrispCall');
      }

      const response = await axios.post(
        'https://automationapi.krispcall.com/api/v1/platform/activepiece/subscribe',
        {
          hookUrl: context.webhookUrl,
          action: 'outbound_sms_or_mms',
        },
        {
          headers: {
            'X-API-KEY': apiKey,
          },
        }
      );

      return { id: response.data.id };
    },
    async onDisable(context: any) {
      const apiKey = context.auth?.api_key;
      if (!apiKey) {
        throw new Error('API key is required for KrispCall');
      }

      await axios.delete(
        'https://automationapi.krispcall.com/api/v1/platform/activepiece/unsubscribe',
        {
          data: {
            hookUrl: context.webhookId,
          },
          headers: {
            'X-API-KEY': apiKey,
          },
        }
      );
    },
  },
];
