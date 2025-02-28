import plugin, { wooAuth, customApiCall } from '../src/index.js';
import { wooCommon } from '../src/common/index.js';

// Mock wooCommon
jest.mock('../src/common/index.js', () => ({
  wooCommon: {
    makeRequest: jest.fn(),
    baseUrl: jest.fn(),
  },
}));

describe('WooCommerce Plugin', () => {
  describe('plugin', () => {
    it('should have the correct properties', () => {
      expect(plugin.name).toBe('woocommerce');
      expect(plugin.displayName).toBe('WooCommerce');
      expect(plugin.description).toBe('E-commerce platform built on WordPress');
      expect(plugin.logoUrl).toBe('https://cdn.activepieces.com/pieces/woocommerce.png');
      expect(plugin.auth).toBe(wooAuth);
      expect(Array.isArray(plugin.actions)).toBe(true);
      expect(plugin.actions.length).toBeGreaterThan(0);
      expect(Array.isArray(plugin.triggers)).toBe(true);
      expect(plugin.triggers.length).toBeGreaterThan(0);
    });
  });

  describe('wooAuth', () => {
    it('should have the correct properties', () => {
      expect(wooAuth.type).toBe('custom');
      expect(wooAuth.displayName).toBe('WooCommerce Authentication');
      expect(wooAuth.description).toBeDefined();
      expect(wooAuth.required).toBe(true);
      expect(wooAuth.properties).toBeDefined();
      expect(wooAuth.properties.baseUrl).toBeDefined();
      expect(wooAuth.properties.consumerKey).toBeDefined();
      expect(wooAuth.properties.consumerSecret).toBeDefined();
      expect(wooAuth.validate).toBeInstanceOf(Function);
    });

    it('should validate baseUrl correctly', async () => {
      const validAuth = {
        baseUrl: 'https://example.com',
        consumerKey: 'test-key',
        consumerSecret: 'test-secret',
      };

      const invalidAuth = {
        baseUrl: 'http://example.com',
        consumerKey: 'test-key',
        consumerSecret: 'test-secret',
      };

      const validResult = await wooAuth.validate({ auth: validAuth });
      const invalidResult = await wooAuth.validate({ auth: invalidAuth });

      expect(validResult).toEqual({ valid: true });
      expect(invalidResult).toEqual({
        valid: false,
        error: 'Base URL must start with https (e.g https://mystore.com)',
      });
    });
  });

  describe('customApiCall', () => {
    const auth = {
      baseUrl: 'https://example.com',
      consumerKey: 'test-key',
      consumerSecret: 'test-secret',
    };

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should have the correct properties', () => {
      expect(customApiCall.name).toBe('custom_api_call');
      expect(customApiCall.displayName).toBe('Custom API Call');
      expect(customApiCall.description).toBe('Make a custom API call to the WooCommerce API');
      expect(customApiCall.inputSchema).toBeDefined();
      expect(customApiCall.outputSchema).toBeDefined();
    });

    it('should call makeRequest with the correct parameters', async () => {
      const input = {
        method: 'GET',
        path: '/wp-json/wc/v3/products',
        queryParams: { per_page: '10' },
      };

      const mockResponse = {
        success: true,
        data: [{ id: 1, name: 'Test Product' }],
      };

      (wooCommon.makeRequest as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await customApiCall.execute(input, auth);

      expect(wooCommon.makeRequest).toHaveBeenCalledWith(
        'GET',
        '/wp-json/wc/v3/products',
        auth,
        undefined,
        { per_page: '10' }
      );
      expect(result).toEqual(mockResponse);
    });

    it('should call makeRequest with body for POST requests', async () => {
      const input = {
        method: 'POST',
        path: '/wp-json/wc/v3/products',
        body: { name: 'New Product' },
      };

      const mockResponse = {
        success: true,
        data: { id: 1, name: 'New Product' },
      };

      (wooCommon.makeRequest as jest.Mock).mockResolvedValueOnce(mockResponse);

      const result = await customApiCall.execute(input, auth);

      expect(wooCommon.makeRequest).toHaveBeenCalledWith(
        'POST',
        '/wp-json/wc/v3/products',
        auth,
        { name: 'New Product' },
        undefined
      );
      expect(result).toEqual(mockResponse);
    });
  });
});
