import axios from 'axios';

type FormListResponse = {
  page_count: number;
  total_items: number;
  items: {
    id: string;
    title: string;
  }[];
};

export const formsDropdown = {
  displayName: 'Form',
  description: 'Form Name',
  required: true,
  type: 'string',
  async options({ auth }: { auth: any }) {
    if (!auth || !auth.access_token) {
      return {
        disabled: true,
        placeholder: 'Connect typeform account',
        options: [],
      };
    }

    const accessToken = auth.access_token;
    const options: { label: string; value: string }[] = [];
    let hasMore = true;
    let page = 1;

    do {
      try {
        const response = await axios.get<FormListResponse>('https://api.typeform.com/forms', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          params: {
            page: page.toString(),
            page_size: '200',
          },
        });

        for (const form of response.data.items) {
          options.push({ label: form.title, value: form.id });
        }

        hasMore = response.data.page_count != undefined && page < response.data.page_count;
        page++;
      } catch (error) {
        console.error('Error fetching Typeform forms:', error);
        hasMore = false;
      }
    } while (hasMore);

    return {
      disabled: false,
      placeholder: 'Select form',
      options,
    };
  },
};

export const typeformCommon = {
  baseUrl: 'https://api.typeform.com',
  subscribeWebhook: async (
    formId: string,
    tag: string,
    webhookUrl: string,
    accessToken: string
  ) => {
    try {
      await axios.put(
        `${typeformCommon.baseUrl}/forms/${formId}/webhooks/${tag}`,
        {
          enabled: true,
          url: webhookUrl,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return { success: true };
    } catch (error) {
      console.error('Error subscribing to Typeform webhook:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  },
  unsubscribeWebhook: async (
    formId: string,
    tag: string,
    accessToken: string
  ) => {
    try {
      await axios.delete(`${typeformCommon.baseUrl}/forms/${formId}/webhooks/${tag}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return { success: true };
    } catch (error) {
      console.error('Error unsubscribing from Typeform webhook:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  },
};
