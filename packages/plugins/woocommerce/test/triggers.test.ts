import { wooCommon } from '../src/common/index.js';
import { woocommerceRegisterTrigger } from '../src/triggers/register-trigger.js';
import { triggers } from '../src/triggers/index.js';

// Mock wooCommon
jest.mock('../src/common/index.js', () => ({
  wooCommon: {
    makeRequest: jest.fn(),
    baseUrl: jest.fn(),
  },
}));

const mockedWooCommon = wooCommon as jest.Mocked<typeof wooCommon>;

describe('WooCommerce Triggers', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('woocommerceRegisterTrigger', () => {
    it('should create a trigger with the correct properties', () => {
      const triggerConfig = {
        name: 'test_trigger',
        displayName: 'Test Trigger',
        description: 'Test description',
        topic: 'test.topic',
        sampleData: { id: 1, name: 'Test' },
      };

      const trigger = woocommerceRegisterTrigger(triggerConfig);

      expect(trigger.name).toBe('test_trigger');
      expect(trigger.displayName).toBe('Test Trigger');
      expect(trigger.description).toBe('Test description');
      expect(trigger.type).toBe('webhook');
      expect(trigger.sampleData).toEqual({ id: 1, name: 'Test' });
      expect(trigger.onEnable).toBeInstanceOf(Function);
      expect(trigger.onDisable).toBeInstanceOf(Function);
      expect(trigger.run).toBeInstanceOf(Function);
    });

    it('should handle onEnable correctly', async () => {
      const triggerConfig = {
        name: 'test_trigger',
        displayName: 'Test Trigger',
        description: 'Test description',
        topic: 'test.topic',
        sampleData: { id: 1, name: 'Test' },
      };

      const trigger = woocommerceRegisterTrigger(triggerConfig);

      const context = {
        webhookUrl: 'https://example.com/webhook',
        auth: {
          baseUrl: 'https://example.com',
          consumerKey: 'test-key',
          consumerSecret: 'test-secret',
        },
        store: {
          put: jest.fn().mockResolvedValue(true),
        },
      };

      const mockResponse = {
        success: true,
        data: { id: 123, name: 'Test Webhook' },
      };

      mockedWooCommon.makeRequest.mockResolvedValueOnce(mockResponse);

      await trigger.onEnable(context);

      expect(mockedWooCommon.makeRequest).toHaveBeenCalledWith(
        'POST',
        '/wp-json/wc/v3/webhooks',
        context.auth,
        {
          name: 'MintFlow Test Trigger Webhook',
          topic: 'test.topic',
          delivery_url: 'https://example.com/webhook',
          status: 'active',
        }
      );

      expect(context.store.put).toHaveBeenCalledWith('woocommerce_test_trigger_webhook_id', {
        webhookId: 123,
      });
    });

    it('should throw an error if webhook creation fails', async () => {
      const triggerConfig = {
        name: 'test_trigger',
        displayName: 'Test Trigger',
        description: 'Test description',
        topic: 'test.topic',
        sampleData: { id: 1, name: 'Test' },
      };

      const trigger = woocommerceRegisterTrigger(triggerConfig);

      const context = {
        webhookUrl: 'https://example.com/webhook',
        auth: {
          baseUrl: 'https://example.com',
          consumerKey: 'test-key',
          consumerSecret: 'test-secret',
        },
        store: {
          put: jest.fn().mockResolvedValue(true),
        },
      };

      const mockResponse = {
        success: false,
        error: 'Failed to create webhook',
      };

      mockedWooCommon.makeRequest.mockResolvedValueOnce(mockResponse);

      await expect(trigger.onEnable(context)).rejects.toThrow('Failed to create webhook: Failed to create webhook');
    });

    it('should handle onDisable correctly', async () => {
      const triggerConfig = {
        name: 'test_trigger',
        displayName: 'Test Trigger',
        description: 'Test description',
        topic: 'test.topic',
        sampleData: { id: 1, name: 'Test' },
      };

      const trigger = woocommerceRegisterTrigger(triggerConfig);

      const context = {
        auth: {
          baseUrl: 'https://example.com',
          consumerKey: 'test-key',
          consumerSecret: 'test-secret',
        },
        store: {
          get: jest.fn().mockResolvedValue({ webhookId: 123 }),
        },
      };

      const mockResponse = {
        success: true,
        data: { id: 123, name: 'Test Webhook' },
      };

      mockedWooCommon.makeRequest.mockResolvedValueOnce(mockResponse);

      await trigger.onDisable(context);

      expect(context.store.get).toHaveBeenCalledWith('woocommerce_test_trigger_webhook_id');
      expect(mockedWooCommon.makeRequest).toHaveBeenCalledWith(
        'DELETE',
        '/wp-json/wc/v3/webhooks/123',
        context.auth
      );
    });

    it('should not call makeRequest if no webhook ID is found', async () => {
      const triggerConfig = {
        name: 'test_trigger',
        displayName: 'Test Trigger',
        description: 'Test description',
        topic: 'test.topic',
        sampleData: { id: 1, name: 'Test' },
      };

      const trigger = woocommerceRegisterTrigger(triggerConfig);

      const context = {
        auth: {
          baseUrl: 'https://example.com',
          consumerKey: 'test-key',
          consumerSecret: 'test-secret',
        },
        store: {
          get: jest.fn().mockResolvedValue(null),
        },
      };

      await trigger.onDisable(context);

      expect(context.store.get).toHaveBeenCalledWith('woocommerce_test_trigger_webhook_id');
      expect(mockedWooCommon.makeRequest).not.toHaveBeenCalled();
    });

    it('should handle run correctly', async () => {
      const triggerConfig = {
        name: 'test_trigger',
        displayName: 'Test Trigger',
        description: 'Test description',
        topic: 'test.topic',
        sampleData: { id: 1, name: 'Test' },
      };

      const trigger = woocommerceRegisterTrigger(triggerConfig);

      const context = {
        payload: {
          body: { id: 1, name: 'Test Data' },
        },
      };

      const result = await trigger.run(context);

      expect(result).toEqual([{ id: 1, name: 'Test Data' }]);
    });
  });

  describe('triggers', () => {
    it('should export an array of triggers', () => {
      expect(Array.isArray(triggers)).toBe(true);
      expect(triggers.length).toBeGreaterThan(0);
    });

    it('should include product triggers', () => {
      const productCreatedTrigger = triggers.find(t => t.name === 'product_created');
      const productUpdatedTrigger = triggers.find(t => t.name === 'product_updated');
      const productDeletedTrigger = triggers.find(t => t.name === 'product_deleted');

      expect(productCreatedTrigger).toBeDefined();
      expect(productUpdatedTrigger).toBeDefined();
      expect(productDeletedTrigger).toBeDefined();

      if (productCreatedTrigger) {
        expect(productCreatedTrigger.displayName).toBe('Product Created');
      }
      if (productUpdatedTrigger) {
        expect(productUpdatedTrigger.displayName).toBe('Product Updated');
      }
      if (productDeletedTrigger) {
        expect(productDeletedTrigger.displayName).toBe('Product Deleted');
      }
    });

    it('should include order triggers', () => {
      const orderCreatedTrigger = triggers.find(t => t.name === 'order_created');
      const orderUpdatedTrigger = triggers.find(t => t.name === 'order_updated');
      const orderDeletedTrigger = triggers.find(t => t.name === 'order_deleted');

      expect(orderCreatedTrigger).toBeDefined();
      expect(orderUpdatedTrigger).toBeDefined();
      expect(orderDeletedTrigger).toBeDefined();

      if (orderCreatedTrigger) {
        expect(orderCreatedTrigger.displayName).toBe('Order Created');
      }
      if (orderUpdatedTrigger) {
        expect(orderUpdatedTrigger.displayName).toBe('Order Updated');
      }
      if (orderDeletedTrigger) {
        expect(orderDeletedTrigger.displayName).toBe('Order Deleted');
      }
    });

    it('should include coupon triggers', () => {
      const couponCreatedTrigger = triggers.find(t => t.name === 'coupon_created');
      const couponUpdatedTrigger = triggers.find(t => t.name === 'coupon_updated');
      const couponDeletedTrigger = triggers.find(t => t.name === 'coupon_deleted');

      expect(couponCreatedTrigger).toBeDefined();
      expect(couponUpdatedTrigger).toBeDefined();
      expect(couponDeletedTrigger).toBeDefined();

      if (couponCreatedTrigger) {
        expect(couponCreatedTrigger.displayName).toBe('Coupon Created');
      }
      if (couponUpdatedTrigger) {
        expect(couponUpdatedTrigger.displayName).toBe('Coupon Updated');
      }
      if (couponDeletedTrigger) {
        expect(couponDeletedTrigger.displayName).toBe('Coupon Deleted');
      }
    });

    it('should include customer triggers', () => {
      const customerCreatedTrigger = triggers.find(t => t.name === 'customer_created');
      const customerUpdatedTrigger = triggers.find(t => t.name === 'customer_updated');
      const customerDeletedTrigger = triggers.find(t => t.name === 'customer_deleted');

      expect(customerCreatedTrigger).toBeDefined();
      expect(customerUpdatedTrigger).toBeDefined();
      expect(customerDeletedTrigger).toBeDefined();

      if (customerCreatedTrigger) {
        expect(customerCreatedTrigger.displayName).toBe('Customer Created');
      }
      if (customerUpdatedTrigger) {
        expect(customerUpdatedTrigger.displayName).toBe('Customer Updated');
      }
      if (customerDeletedTrigger) {
        expect(customerDeletedTrigger.displayName).toBe('Customer Deleted');
      }
    });
  });
});
