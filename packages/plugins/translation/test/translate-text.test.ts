import { describe, it, expect, vi, beforeEach } from 'vitest';
import { translateText, translateTextDeepL, translateTextGoogle } from '../src/actions/translate-text.js';

// Mock axios
vi.mock('axios', () => ({
  default: {
    post: vi.fn(),
    isAxiosError: vi.fn()
  }
}));

// Import axios after mocking
import axios from 'axios';

describe('Translation Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('translateTextDeepL', () => {
    it('should translate text using DeepL API (paid)', async () => {
      // Mock the axios response
      (axios.post as any).mockResolvedValueOnce({
        data: {
          translations: [
            {
              text: 'Hallo, wie geht es dir?',
              detected_source_language: 'EN'
            }
          ]
        }
      });

      const input = {
        apiKey: 'test-api-key',
        text: 'Hello, how are you?',
        targetLang: 'DE',
        preserveFormatting: true,
        formality: 'more' as const
      };

      const result = await translateTextDeepL(input);

      // Check that axios was called correctly
      expect(axios.post).toHaveBeenCalledWith(
        'https://api.deepl.com/v2/translate',
        expect.objectContaining({
          text: ['Hello, how are you?'],
          target_lang: 'DE',
          preserve_formatting: true,
          formality: 'more'
        }),
        expect.objectContaining({
          headers: {
            'Authorization': 'DeepL-Auth-Key test-api-key',
            'Content-Type': 'application/json'
          }
        })
      );

      // Check that the result has the expected structure
      expect(result).toHaveProperty('translatedText', 'Hallo, wie geht es dir?');
      expect(result).toHaveProperty('detectedSourceLang', 'EN');
      expect(result).toHaveProperty('provider', 'deepl');
    });

    it('should translate text using DeepL API (free)', async () => {
      // Mock the axios response
      (axios.post as any).mockResolvedValueOnce({
        data: {
          translations: [
            {
              text: 'Hallo, wie geht es dir?',
              detected_source_language: 'EN'
            }
          ]
        }
      });

      const input = {
        apiKey: 'test-api-key:fx',
        text: 'Hello, how are you?',
        targetLang: 'DE'
      };

      const result = await translateTextDeepL(input);

      // Check that axios was called with the free API URL
      expect(axios.post).toHaveBeenCalledWith(
        'https://api-free.deepl.com/v2/translate',
        expect.anything(),
        expect.anything()
      );

      // Check that the result has the expected structure
      expect(result).toHaveProperty('translatedText', 'Hallo, wie geht es dir?');
    });

    it('should handle errors properly', async () => {
      // Mock axios to throw an error
      (axios.post as any).mockRejectedValueOnce(new Error('API Error'));
      (axios.isAxiosError as any).mockReturnValueOnce(true);

      const input = {
        apiKey: 'test-api-key',
        text: 'Hello, how are you?',
        targetLang: 'DE'
      };

      await expect(translateTextDeepL(input)).rejects.toThrow();
    });
  });

  describe('translateTextGoogle', () => {
    it('should translate text using Google Translate API', async () => {
      // Mock the axios response
      (axios.post as any).mockResolvedValueOnce({
        data: {
          data: {
            translations: [
              {
                translatedText: 'Hola, ¿cómo estás?',
                detectedSourceLanguage: 'en'
              }
            ]
          }
        }
      });

      const input = {
        apiKey: 'test-api-key',
        text: 'Hello, how are you?',
        targetLang: 'es',
        sourceLang: 'en',
        tagHandling: 'html' as const
      };

      const result = await translateTextGoogle(input);

      // Check that axios was called correctly
      expect(axios.post).toHaveBeenCalledWith(
        'https://translation.googleapis.com/language/translate/v2',
        null,
        {
          params: {
            q: 'Hello, how are you?',
            target: 'es',
            source: 'en',
            format: 'html',
            key: 'test-api-key'
          }
        }
      );

      // Check that the result has the expected structure
      expect(result).toHaveProperty('translatedText', 'Hola, ¿cómo estás?');
      expect(result).toHaveProperty('detectedSourceLang', 'en');
      expect(result).toHaveProperty('provider', 'google');
    });

    it('should handle errors properly', async () => {
      // Mock axios to throw an error
      (axios.post as any).mockRejectedValueOnce(new Error('API Error'));
      (axios.isAxiosError as any).mockReturnValueOnce(true);

      const input = {
        apiKey: 'test-api-key',
        text: 'Hello, how are you?',
        targetLang: 'es'
      };

      await expect(translateTextGoogle(input)).rejects.toThrow();
    });
  });

  describe('translateText', () => {
    it('should call translateTextDeepL when provider is deepl', async () => {
      // Mock the translateTextDeepL function
      const mockTranslateTextDeepL = vi.fn().mockResolvedValue({
        translatedText: 'Hallo, wie geht es dir?',
        detectedSourceLang: 'EN',
        provider: 'deepl'
      });
      
      // Replace the real function with the mock
      const originalTranslateTextDeepL = require('../src/actions/translate-text.js').translateTextDeepL;
      require('../src/actions/translate-text.js').translateTextDeepL = mockTranslateTextDeepL;

      const input = {
        apiKey: 'test-api-key',
        text: 'Hello, how are you?',
        targetLang: 'DE',
        provider: 'deepl' as const
      };

      const result = await translateText(input);

      // Check that translateTextDeepL was called with the correct parameters
      expect(mockTranslateTextDeepL).toHaveBeenCalledWith({
        apiKey: 'test-api-key',
        text: 'Hello, how are you?',
        targetLang: 'DE'
      });

      // Check that the result is correct
      expect(result).toHaveProperty('translatedText', 'Hallo, wie geht es dir?');
      expect(result).toHaveProperty('provider', 'deepl');

      // Restore the original function
      require('../src/actions/translate-text.js').translateTextDeepL = originalTranslateTextDeepL;
    });

    it('should call translateTextGoogle when provider is google', async () => {
      // Mock the translateTextGoogle function
      const mockTranslateTextGoogle = vi.fn().mockResolvedValue({
        translatedText: 'Hola, ¿cómo estás?',
        detectedSourceLang: 'en',
        provider: 'google'
      });
      
      // Replace the real function with the mock
      const originalTranslateTextGoogle = require('../src/actions/translate-text.js').translateTextGoogle;
      require('../src/actions/translate-text.js').translateTextGoogle = mockTranslateTextGoogle;

      const input = {
        apiKey: 'test-api-key',
        text: 'Hello, how are you?',
        targetLang: 'es',
        provider: 'google' as const
      };

      const result = await translateText(input);

      // Check that translateTextGoogle was called with the correct parameters
      expect(mockTranslateTextGoogle).toHaveBeenCalledWith({
        apiKey: 'test-api-key',
        text: 'Hello, how are you?',
        targetLang: 'es'
      });

      // Check that the result is correct
      expect(result).toHaveProperty('translatedText', 'Hola, ¿cómo estás?');
      expect(result).toHaveProperty('provider', 'google');

      // Restore the original function
      require('../src/actions/translate-text.js').translateTextGoogle = originalTranslateTextGoogle;
    });

    it('should throw an error for unsupported providers', async () => {
      const input = {
        apiKey: 'test-api-key',
        text: 'Hello, how are you?',
        targetLang: 'DE',
        provider: 'unsupported' as any
      };

      await expect(translateText(input)).rejects.toThrow('Unsupported translation provider');
    });
  });
});
