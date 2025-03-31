import { wooCommon } from '../src/common/index.js';
import { wooCreateCustomer } from '../src/actions/create-customer.js';
import { wooFindCustomer } from '../src/actions/find-customer.js';
import { wooCreateProduct } from '../src/actions/create-product.js';
import { wooFindProduct } from '../src/actions/find-product.js';
import { wooCreateCoupon } from '../src/actions/create-coupon.js';
import { customApiCall } from '../src/index.js';

// Mock wooCommon
jest.mock('../src/common/index.js', () => ({
  wooCommon: {
    makeRequest: jest.fn(),
    baseUrl: jest.fn(),
  },
}));

const mockedWooCommon = wooCommon as jest.Mocked<typeof wooCommon>;

describe('WooCommerce Actions', () => {
  const auth = {
    baseUrl: 'https://example.com',
    consumerKey: 'test-key',
    consumerSecret: 'test-secret',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('wooCreateCustomer', () => {
    it('should have the correct properties', () => {
      expect(wooCreateCustomer.name).toBe('create_customer');
      expect(wooCreateCustomer.displayName).toBe('Create Customer');
      expect(wooCreateCustomer.description).toBe('Creates a new customer in WooCommerce');
      expect(wooCreateCustomer.inputSchema).toBeDefined();
      expect(wooCreateCustomer.outputSchema).toBeDefined();
    });

    it('should call makeRequest with the correct parameters', async () => {
      const input = {
        email: 'test@example.com',
        first_name: 'John',
        last_name: 'Doe',
      };

      const mockResponse = {
        success: true,
        data: { id: 1, email: 'test@example.com' },
      };

      mockedWooCommon.makeRequest.mockResolvedValueOnce(mockResponse);

      const result = await wooCreateCustomer.execute(input, auth);

      expect(mockedWooCommon.makeRequest).toHaveBeenCalledWith(
        'POST',
        '/wp-json/wc/v3/customers',
        auth,
        input
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('wooFindCustomer', () => {
    it('should have the correct properties', () => {
      expect(wooFindCustomer.name).toBe('find_customer');
      expect(wooFindCustomer.displayName).toBe('Find Customer');
      expect(wooFindCustomer.description).toBe('Finds a customer in WooCommerce by email or ID');
      expect(wooFindCustomer.inputSchema).toBeDefined();
      expect(wooFindCustomer.outputSchema).toBeDefined();
    });

    it('should find a customer by ID', async () => {
      const input = { id: 1 };
      const mockResponse = {
        success: true,
        data: { id: 1, email: 'test@example.com' },
      };

      mockedWooCommon.makeRequest.mockResolvedValueOnce(mockResponse);

      const result = await wooFindCustomer.execute(input, auth);

      expect(mockedWooCommon.makeRequest).toHaveBeenCalledWith(
        'GET',
        '/wp-json/wc/v3/customers/1',
        auth
      );
      expect(result).toEqual(mockResponse);
    });

    it('should find a customer by email', async () => {
      const input = { email: 'test@example.com' };
      const mockResponse = {
        success: true,
        data: [{ id: 1, email: 'test@example.com' }],
      };

      mockedWooCommon.makeRequest.mockResolvedValueOnce(mockResponse);

      const result = await wooFindCustomer.execute(input, auth);

      expect(mockedWooCommon.makeRequest).toHaveBeenCalledWith(
        'GET',
        '/wp-json/wc/v3/customers',
        auth,
        undefined,
        { email: 'test@example.com' }
      );
      expect(result).toEqual({
        success: true,
        data: { id: 1, email: 'test@example.com' },
      });
    });

    it('should return error when customer not found by email', async () => {
      const input = { email: 'test@example.com' };
      const mockResponse = {
        success: true,
        data: [],
      };

      mockedWooCommon.makeRequest.mockResolvedValueOnce(mockResponse);

      const result = await wooFindCustomer.execute(input, auth);

      expect(result).toEqual({
        success: false,
        error: 'Customer not found',
      });
    });

    it('should return error when neither id nor email is provided', async () => {
      const input = {};
      const result = await wooFindCustomer.execute(input, auth);

      expect(result).toEqual({
        success: false,
        error: 'Either id or email must be provided',
      });
    });
  });

  describe('wooCreateProduct', () => {
    it('should have the correct properties', () => {
      expect(wooCreateProduct.name).toBe('create_product');
      expect(wooCreateProduct.displayName).toBe('Create Product');
      expect(wooCreateProduct.description).toBe('Creates a new product in WooCommerce');
      expect(wooCreateProduct.inputSchema).toBeDefined();
      expect(wooCreateProduct.outputSchema).toBeDefined();
    });

    it('should call makeRequest with the correct parameters', async () => {
      const input = {
        name: 'Test Product',
        regular_price: '19.99',
        description: 'Test description',
      };

      const mockResponse = {
        success: true,
        data: { id: 1, name: 'Test Product' },
      };

      mockedWooCommon.makeRequest.mockResolvedValueOnce(mockResponse);

      const result = await wooCreateProduct.execute(input, auth);

      expect(mockedWooCommon.makeRequest).toHaveBeenCalledWith(
        'POST',
        '/wp-json/wc/v3/products',
        auth,
        input
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('wooFindProduct', () => {
    it('should have the correct properties', () => {
      expect(wooFindProduct.name).toBe('find_product');
      expect(wooFindProduct.displayName).toBe('Find Product');
      expect(wooFindProduct.description).toBe('Finds a product in WooCommerce by ID or SKU');
      expect(wooFindProduct.inputSchema).toBeDefined();
      expect(wooFindProduct.outputSchema).toBeDefined();
    });

    it('should find a product by ID', async () => {
      const input = { id: 1 };
      const mockResponse = {
        success: true,
        data: { id: 1, name: 'Test Product' },
      };

      mockedWooCommon.makeRequest.mockResolvedValueOnce(mockResponse);

      const result = await wooFindProduct.execute(input, auth);

      expect(mockedWooCommon.makeRequest).toHaveBeenCalledWith(
        'GET',
        '/wp-json/wc/v3/products/1',
        auth
      );
      expect(result).toEqual(mockResponse);
    });

    it('should find a product by SKU', async () => {
      const input = { sku: 'TEST-SKU' };
      const mockResponse = {
        success: true,
        data: [{ id: 1, name: 'Test Product', sku: 'TEST-SKU' }],
      };

      mockedWooCommon.makeRequest.mockResolvedValueOnce(mockResponse);

      const result = await wooFindProduct.execute(input, auth);

      expect(mockedWooCommon.makeRequest).toHaveBeenCalledWith(
        'GET',
        '/wp-json/wc/v3/products',
        auth,
        undefined,
        { sku: 'TEST-SKU' }
      );
      expect(result).toEqual({
        success: true,
        data: { id: 1, name: 'Test Product', sku: 'TEST-SKU' },
      });
    });

    it('should return error when product not found by SKU', async () => {
      const input = { sku: 'TEST-SKU' };
      const mockResponse = {
        success: true,
        data: [],
      };

      mockedWooCommon.makeRequest.mockResolvedValueOnce(mockResponse);

      const result = await wooFindProduct.execute(input, auth);

      expect(result).toEqual({
        success: false,
        error: 'Product not found',
      });
    });

    it('should return error when neither id nor sku is provided', async () => {
      const input = {};
      const result = await wooFindProduct.execute(input, auth);

      expect(result).toEqual({
        success: false,
        error: 'Either id or sku must be provided',
      });
    });
  });

  describe('wooCreateCoupon', () => {
    it('should have the correct properties', () => {
      expect(wooCreateCoupon.name).toBe('create_coupon');
      expect(wooCreateCoupon.displayName).toBe('Create Coupon');
      expect(wooCreateCoupon.description).toBe('Creates a new coupon in WooCommerce');
      expect(wooCreateCoupon.inputSchema).toBeDefined();
      expect(wooCreateCoupon.outputSchema).toBeDefined();
    });

    it('should call makeRequest with the correct parameters', async () => {
      const input = {
        code: 'TESTCOUPON',
        discount_type: 'percent',
        amount: '10',
      };

      const mockResponse = {
        success: true,
        data: { id: 1, code: 'TESTCOUPON' },
      };

      mockedWooCommon.makeRequest.mockResolvedValueOnce(mockResponse);

      const result = await wooCreateCoupon.execute(input, auth);

      expect(mockedWooCommon.makeRequest).toHaveBeenCalledWith(
        'POST',
        '/wp-json/wc/v3/coupons',
        auth,
        input
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('customApiCall', () => {
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

      mockedWooCommon.makeRequest.mockResolvedValueOnce(mockResponse);

      const result = await customApiCall.execute(input, auth);

      expect(mockedWooCommon.makeRequest).toHaveBeenCalledWith(
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

      mockedWooCommon.makeRequest.mockResolvedValueOnce(mockResponse);

      const result = await customApiCall.execute(input, auth);

      expect(mockedWooCommon.makeRequest).toHaveBeenCalledWith(
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
