import { CalComClient } from '../utils/index.js';

export interface WebhookInformation {
  id: string;
  userId: number;
  eventTypeId?: null | string;
  payloadTemplate?: null | string;
  eventTriggers: string[];
  appId?: null | string;
  subscriberUrl: string;
}

export interface WebhookResponseBody {
  webhook: WebhookInformation;
  message: string;
}

export const registerWebhooks = ({
  name,
  description,
  displayName,
  sampleData,
}: {
  name: string;
  description: string;
  displayName: string;
  sampleData: Record<string, unknown>;
}) => {
  return {
    name,
    displayName,
    description,
    type: 'webhook',
    sampleData,
    async onEnable(context: any) {
      const client = new CalComClient({
        apiKey: context.auth.apiKey,
      });

      try {
        const response = await client.createWebhook(
          [name],
          context.webhookUrl
        );

        if (response && response.webhook) {
          await context.store?.put(
            `cal_com_trigger_${name}`,
            response.webhook
          );
        }
      } catch (error: any) {
        throw new Error(`Failed to register Cal.com webhook: ${error.message}`);
      }
    },
    async onDisable(context: any) {
      const data = await context.store?.get(
        `cal_com_trigger_${name}`
      ) as WebhookInformation | undefined;
      
      if (data != null) {
        const client = new CalComClient({
          apiKey: context.auth.apiKey,
        });

        try {
          await client.deleteWebhook(data.id);
        } catch (error: any) {
          throw new Error(`Failed to delete Cal.com webhook: ${error.message}`);
        }
      }
    },
    async run(context: any) {
      return [context.payload.body];
    },
  };
};
