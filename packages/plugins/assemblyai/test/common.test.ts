import { describe, it, expect, vi, beforeEach } from 'vitest';
import { validateApiKey, createAssemblyAIClient, BASE_URL } from '../src/common.js';
import axios from 'axios';
import { AssemblyAI } from 'assemblyai';

// Mock axios
vi.mock('axios', () => ({
  default: {
    get: vi.fn()
  }
}));

// Mock AssemblyAI
vi.mock('assemblyai', () => ({
  AssemblyAI: vi.fn()
}));

describe('common', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('validateApiKey', () => {
    it('should return true for a valid API key', async () => {
      // Mock axios.get to return a successful response
      vi.mocked(axios.get).mockResolvedValueOnce({
        status: 200,
        data: {}
      });

      const result = await validateApiKey('valid-api-key');

      expect(axios.get).toHaveBeenCalledWith(`${BASE_URL}/v2/account`, {
        headers: {
          'Authorization': 'valid-api-key',
          'Content-Type': 'application/json'
        }
      });
      expect(result).toBe(true);
    });

    it('should return false for an invalid API key', async () => {
      // Mock axios.get to return an error response
      vi.mocked(axios.get).mockResolvedValueOnce({
        status: 401,
        data: { error: 'Invalid API key' }
      });

      const result = await validateApiKey('invalid-api-key');

      expect(axios.get).toHaveBeenCalledWith(`${BASE_URL}/v2/account`, {
        headers: {
          'Authorization': 'invalid-api-key',
          'Content-Type': 'application/json'
        }
      });
      expect(result).toBe(false);
    });

    it('should return false when an error occurs', async () => {
      // Mock axios.get to throw an error
      vi.mocked(axios.get).mockRejectedValueOnce(new Error('Network error'));

      const result = await validateApiKey('api-key');

      expect(axios.get).toHaveBeenCalledWith(`${BASE_URL}/v2/account`, {
        headers: {
          'Authorization': 'api-key',
          'Content-Type': 'application/json'
        }
      });
      expect(result).toBe(false);
    });
  });

  describe('createAssemblyAIClient', () => {
    it('should create an AssemblyAI client with the provided API key', () => {
      createAssemblyAIClient('test-api-key');

      expect(AssemblyAI).toHaveBeenCalledWith({
        apiKey: 'test-api-key',
        userAgent: {
          integration: {
            name: 'MintFlow',
            version: '1.0.0',
          },
        },
        baseUrl: BASE_URL,
      });
    });
  });
});
