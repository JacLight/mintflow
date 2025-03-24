import axios from 'axios';
import { wooCommon } from '../src/common/index.js';

// Mock axios
jest.mock('axios');
const mockedAxios = jest.mocked(axios);

describe('wooCommon', () => {
  const auth = {
    baseUrl: 'https://example.com',
    consumerKey: 'test-key',
    consumerSecret: 'test-secret',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('baseUrl', () => {
    it('should return the base URL from auth', () => {
      expect(wooCommon.baseUrl(auth)).toBe('https://example.com');
    });
  });

  describe('makeRequest', () => {
    it('should make a successful GET request', async () => {
      const mockResponse = {
        data: { id: 1, name: 'Test Product' },
        status: 200,
      };
      mockedAxios.mockResolvedValueOnce(mockResponse);

      const result = await wooCommon.makeRequest(
        'GET',
        '/wp-json/wc/v3/products/1',
        auth
      );

      expect(mockedAxios).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://example.com/wp-json/wc/v3/products/1',
        params: undefined,
        data: undefined,
        headers: {
          'Content-Type': 'application/json',
          Authorization: expect.any(String),
        },
      });
      expect(result).toEqual({
        success: true,
        data: { id: 1, name: 'Test Product' },
      });
    });

    it('should make a successful POST request with body', async () => {
      const mockResponse = {
        data: { id: 1, name: 'New Product' },
        status: 201,
      };
      mockedAxios.mockResolvedValueOnce(mockResponse);

      const body = { name: 'New Product', regular_price: '19.99' };
      const result = await wooCommon.makeRequest(
        'POST',
        '/wp-json/wc/v3/products',
        auth,
        body
      );

      expect(mockedAxios).toHaveBeenCalledWith({
        method: 'POST',
        url: 'https://example.com/wp-json/wc/v3/products',
        params: undefined,
        data: body,
        headers: {
          'Content-Type': 'application/json',
          Authorization: expect.any(String),
        },
      });
      expect(result).toEqual({
        success: true,
        data: { id: 1, name: 'New Product' },
      });
    });

    it('should make a successful GET request with query parameters', async () => {
      const mockResponse = {
        data: [{ id: 1, name: 'Test Product' }],
        status: 200,
      };
      mockedAxios.mockResolvedValueOnce(mockResponse);

      const queryParams = { search: 'test', per_page: '10' };
      const result = await wooCommon.makeRequest(
        'GET',
        '/wp-json/wc/v3/products',
        auth,
        undefined,
        queryParams
      );

      expect(mockedAxios).toHaveBeenCalledWith({
        method: 'GET',
        url: 'https://example.com/wp-json/wc/v3/products',
        params: queryParams,
        data: undefined,
        headers: {
          'Content-Type': 'application/json',
          Authorization: expect.any(String),
        },
      });
      expect(result).toEqual({
        success: true,
        data: [{ id: 1, name: 'Test Product' }],
      });
    });

    it('should handle errors with response data', async () => {
      const mockError = {
        response: {
          status: 404,
          statusText: 'Not Found',
          data: { code: 'not_found', message: 'Product not found' },
        },
        message: 'Request failed with status code 404',
      };
      mockedAxios.mockRejectedValueOnce(mockError);

      const result = await wooCommon.makeRequest(
        'GET',
        '/wp-json/wc/v3/products/999',
        auth
      );

      expect(result).toEqual({
        success: false,
        error: 'Error: 404 - Not Found',
        data: { code: 'not_found', message: 'Product not found' },
      });
    });

    it('should handle errors without response data', async () => {
      const mockError = {
        message: 'Network Error',
      };
      mockedAxios.mockRejectedValueOnce(mockError);

      const result = await wooCommon.makeRequest(
        'GET',
        '/wp-json/wc/v3/products/1',
        auth
      );

      expect(result).toEqual({
        success: false,
        error: 'Network Error',
      });
    });
  });
});
