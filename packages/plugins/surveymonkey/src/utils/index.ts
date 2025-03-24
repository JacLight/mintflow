import axios from 'axios';

export interface SurveyMonkeyAuth {
  access_token: string;
}

export interface WebhookInformation {
  webhookId: string | number;
}

export interface Survey {
  id: string | number;
  title: string;
}

export interface SurveyResponse {
  id: string | number;
  [key: string]: any;
}

export const smUtils = {
  baseUrl: 'https://api.surveymonkey.com/v3',

  async getSurveys(accessToken: string): Promise<Array<{ label: string; value: string | number }>> {
    try {
      const response = await axios.get(`${smUtils.baseUrl}/surveys`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.data && response.data.data) {
        return response.data.data.map((survey: Survey) => ({
          label: survey.title,
          value: survey.id,
        }));
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching SurveyMonkey surveys:', error);
      throw new Error('Failed to fetch surveys from SurveyMonkey');
    }
  },

  async subscribeWebhook(
    surveyId: string | number,
    webhookUrl: string,
    accessToken: string
  ): Promise<string | number> {
    try {
      const response = await axios.post(
        `${smUtils.baseUrl}/webhooks`,
        {
          name: 'New Response Webhook',
          event_type: 'response_created',
          object_type: 'survey',
          object_ids: [surveyId],
          subscription_url: webhookUrl,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data.id;
    } catch (error) {
      console.error('Error subscribing to SurveyMonkey webhook:', error);
      throw new Error('Failed to subscribe to SurveyMonkey webhook');
    }
  },

  async unsubscribeWebhook(
    webhookId: string | number,
    accessToken: string
  ): Promise<void> {
    try {
      await axios.delete(`${smUtils.baseUrl}/webhooks/${webhookId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
    } catch (error) {
      console.error('Error unsubscribing from SurveyMonkey webhook:', error);
      throw new Error('Failed to unsubscribe from SurveyMonkey webhook');
    }
  },

  async getResponseDetails(
    accessToken: string,
    surveyId: string | number,
    responseId: string | number
  ): Promise<SurveyResponse> {
    try {
      const response = await axios.get(
        `${smUtils.baseUrl}/surveys/${surveyId}/responses/${responseId}/details`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      console.error('Error fetching SurveyMonkey response details:', error);
      throw new Error('Failed to fetch response details from SurveyMonkey');
    }
  },
};
