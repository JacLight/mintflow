import { wooCommon } from '../common/index.js';

export const woocommerceRegisterTrigger = (triggerConfig: any) => {
  return {
    name: triggerConfig.name,
    displayName: triggerConfig.displayName,
    description: triggerConfig.description,
    type: 'webhook',
    sampleData: triggerConfig.sampleData,
    
    async onEnable(context: any) {
      const webhookData = {
        name: `MintFlow ${triggerConfig.displayName} Webhook`,
        topic: triggerConfig.topic,
        delivery_url: context.webhookUrl,
        status: 'active',
      };
      
      const response = await wooCommon.makeRequest(
        'POST',
        '/wp-json/wc/v3/webhooks',
        context.auth,
        webhookData
      );
      
      if (response.success && response.data && response.data.id) {
        if (context.store) {
          await context.store.put(`woocommerce_${triggerConfig.name}_webhook_id`, {
            webhookId: response.data.id,
          });
        }
      } else {
        throw new Error(`Failed to create webhook: ${response.error || 'Unknown error'}`);
      }
    },
    
    async onDisable(context: any) {
      if (!context.store) {
        return;
      }
      
      const webhookInfo = await context.store.get(`woocommerce_${triggerConfig.name}_webhook_id`);
      
      if (webhookInfo && webhookInfo.webhookId) {
        await wooCommon.makeRequest(
          'DELETE',
          `/wp-json/wc/v3/webhooks/${webhookInfo.webhookId}`,
          context.auth
        );
      }
    },
    
    async run(context: any) {
      return [context.payload.body];
    },
  };
};
