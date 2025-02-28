import { describe, it, expect, vi, beforeEach } from 'vitest';
import { detectLanguage, detectLanguageGoogle } from '../src/actions/detect-language.js';

// Mock axios
vi.mock('axios', () => ({
  default: {
    post: vi.fn(),
    isAxiosError: vi.fn()
  }
}));

// Import axios after mocking
import axios from 'axios';

describe('Language Detection Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('detectLanguageGoogle', () => {
    it('should detect language using Google Translate API', async () => {
      // Mock the axios response
      (axios.post as any).mockResolvedValueOnce({
        data: {
          data: {
            detections: [
              [
                {
                  language: 'fr',
                  confidence: 0.98,
                  isReliable: true
                }
              ]
            ]
          }
        }
      });

      const input = {
        apiKey: 'test-api-key',
        text: 'Bonjour, comment ça va?'
      };

      const result = await detectLanguageGoogle(input);

      // Check that axios was called correctly
      expect(axios.post).toHaveBeenCalledWith(
        'https://translation.googleapis.com/language/translate/v2/detect',
        null,
        {
          params: {
            q: 'Bonjour, comment ça va?',
            key: 'test-api-key'
          }
        }
      );

      // Check that the result has the expected structure
      expect(result).toHaveProperty('detectedLanguage', 'fr');
      expect(result).toHaveProperty('confidence', 0.98);
      expect(result).toHaveProperty('provider', 'google');
    });

    it('should handle errors properly', async () => {
      // Mock axios to throw an error
      (axios.post as any).mockRejectedValueOnce(new Error('API Error'));
      (axios.isAxiosError as any).mockReturnValueOnce(true);

      const input = {
        apiKey: 'test-api-key',
        text: 'Bonjour, comment ça va?'
      };

      await expect(detectLanguageGoogle(input)).rejects.toThrow();
    });

    it('should handle empty detection results', async () => {
      // Mock the axios response with empty detections
      (axios.post as any).mockResolvedValueOnce({
        data: {
          data: {
            detections: []
          }
        }
      });

      const input = {
        apiKey: 'test-api-key',
        text: 'Bonjour, comment ça va?'
      };

      await expect(detectLanguageGoogle(input)).rejects.toThrow('No language detection results');
    });
  });

  describe('detectLanguage', () => {
    it('should call detectLanguageGoogle when provider is google', async () => {
      // Mock the detectLanguageGoogle function
      const mockDetectLanguageGoogle = vi.fn().mockResolvedValue({
        detectedLanguage: 'fr',
        confidence: 0.98,
        provider: 'google'
      });
      
      // Replace the real function with the mock
      const originalDetectLanguageGoogle = require('../src/actions/detect-language.js').detectLanguageGoogle;
      require('../src/actions/detect-language.js').detectLanguageGoogle = mockDetectLanguageGoogle;

      const input = {
        apiKey: 'test-api-key',
        text: 'Bonjour, comment ça va?',
        provider: 'google' as const
      };

      const result = await detectLanguage(input);

      // Check that detectLanguageGoogle was called with the correct parameters
      expect(mockDetectLanguageGoogle).toHaveBeenCalledWith({
        apiKey: 'test-api-key',
        text: 'Bonjour, comment ça va?'
      });

      // Check that the result is correct
      expect(result).toHaveProperty('detectedLanguage', 'fr');
      expect(result).toHaveProperty('confidence', 0.98);
      expect(result).toHaveProperty('provider', 'google');

      // Restore the original function
      require('../src/actions/detect-language.js').detectLanguageGoogle = originalDetectLanguageGoogle;
    });

    it('should throw an error for unsupported providers', async () => {
      const input = {
        apiKey: 'test-api-key',
        text: 'Bonjour, comment ça va?',
        provider: 'unsupported' as any
      };

      await expect(detectLanguage(input)).rejects.toThrow('Unsupported language detection provider');
    });
  });
});
