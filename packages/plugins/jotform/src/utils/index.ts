import axios from 'axios';

export interface JotformAuth {
  apiKey: string;
  region: string;
}

export interface JotformForm {
  id: string;
  username: string;
  title: string;
  height: string;
  status: string;
  created_at: string;
  updated_at: string;
  last_submission: string;
  new: string;
  count: string;
  type: string;
  favorite: string;
  archived: string;
  url: string;
}

export interface WebhookInformation {
  jotformWebhook: string;
}

export const jotformUtils = {
  baseUrl: (region: string): string => {
    if (region === 'eu') {
      return 'https://eu-api.jotform.com';
    }
    if (region === 'hipaa') {
      return 'https://hipaa-api.jotform.com';
    }
    return 'https://api.jotform.com';
  },

  getUserForms: async (auth: JotformAuth): Promise<Array<{ label: string; value: string }>> => {
    try {
      const response = await axios.get(`${jotformUtils.baseUrl(auth.region)}/user/forms`, {
        headers: {
          APIKEY: auth.apiKey,
        },
      });

      if (response.data && response.data.content) {
        return response.data.content.map((form: JotformForm) => ({
          label: form.title,
          value: form.id,
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching JotForm forms:', error);
      throw new Error('Failed to fetch forms from JotForm');
    }
  },

  subscribeWebhook: async (formId: string, webhookUrl: string, auth: JotformAuth): Promise<void> => {
    try {
      const formData = new FormData();
      formData.append('webhookURL', webhookUrl);

      await axios.post(
        `${jotformUtils.baseUrl(auth.region)}/form/${formId}/webhooks`,
        formData,
        {
          headers: {
            APIKEY: auth.apiKey,
            'Content-Type': 'multipart/form-data',
          },
        }
      );
    } catch (error) {
      console.error('Error subscribing to JotForm webhook:', error);
      throw new Error('Failed to subscribe to JotForm webhook');
    }
  },

  unsubscribeWebhook: async (formId: string, webhookUrl: string, auth: JotformAuth): Promise<void> => {
    try {
      // Get all webhooks for the form
      const response = await axios.get(
        `${jotformUtils.baseUrl(auth.region)}/form/${formId}/webhooks`,
        {
          headers: {
            APIKEY: auth.apiKey,
          },
        }
      );

      // Find the webhook ID that matches our URL
      let webhookId;
      if (response.data && response.data.content) {
        Object.entries(response.data.content).forEach(([key, value]) => {
          if (value === webhookUrl) {
            webhookId = key;
          }
        });
      }

      if (!webhookId) {
        console.warn('Webhook URL not found, nothing to unsubscribe');
        return;
      }

      // Delete the webhook
      await axios.delete(
        `${jotformUtils.baseUrl(auth.region)}/form/${formId}/webhooks/${webhookId}`,
        {
          headers: {
            APIKEY: auth.apiKey,
          },
        }
      );
    } catch (error) {
      console.error('Error unsubscribing from JotForm webhook:', error);
      throw new Error('Failed to unsubscribe from JotForm webhook');
    }
  },
};
