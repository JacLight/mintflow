import { describe, it, expect, vi, beforeEach } from 'vitest';
import { textToSpeech, getVoices, textToSpeechElevenLabs } from '../src/actions/text-to-speech.js';

// Mock axios
vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    isAxiosError: vi.fn()
  }
}));

// Import axios after mocking
import axios from 'axios';

// Mock ElevenLabs client
vi.mock('elevenlabs', () => ({
  ElevenLabsClient: vi.fn().mockImplementation(() => ({
    generate: vi.fn().mockImplementation(async () => {
      // Create a mock async iterable for the audio chunks
      const chunks = [Buffer.from('chunk1'), Buffer.from('chunk2')];
      return {
        async *[Symbol.asyncIterator]() {
          for (const chunk of chunks) {
            yield chunk;
          }
        }
      };
    })
  }))
}));

describe('Text-to-Speech Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('textToSpeech', () => {
    it('should convert text to speech using ElevenLabs', async () => {
      const input = {
        apiKey: 'test-api-key',
        text: 'Hello, this is a test',
        voice: 'test-voice-id',
        provider: 'elevenlabs' as const,
        model: 'eleven_turbo_v2',
        outputFormat: 'mp3' as const
      };

      const result = await textToSpeech(input);

      // Check that the result has the expected structure
      expect(result).toHaveProperty('audioData');
      expect(result).toHaveProperty('mimeType', 'audio/mpeg');
      expect(result).toHaveProperty('provider', 'elevenlabs');
      expect(typeof result.audioData).toBe('string');
    });

    it('should convert text to speech using OpenAI', async () => {
      // Mock the axios response for OpenAI
      (axios.post as any).mockResolvedValueOnce({
        data: Buffer.from('audio-data')
      });

      const input = {
        apiKey: 'test-api-key',
        text: 'Hello, this is a test',
        voice: 'alloy',
        provider: 'openai' as const,
        speed: 1.0,
        outputFormat: 'mp3' as const
      };

      const result = await textToSpeech(input);

      // Check that the result has the expected structure
      expect(result).toHaveProperty('audioData');
      expect(result).toHaveProperty('mimeType', 'audio/mpeg');
      expect(result).toHaveProperty('provider', 'openai');
    });
  });

  describe('getVoices', () => {
    it('should return a list of voices from ElevenLabs', async () => {
      // Mock the axios response
      (axios.get as any).mockResolvedValueOnce({
        data: {
          voices: [
            {
              voice_id: 'voice1',
              name: 'Voice 1',
              description: 'Description 1',
              preview_url: 'https://example.com/preview1',
              category: 'premium'
            },
            {
              voice_id: 'voice2',
              name: 'Voice 2',
              description: 'Description 2',
              preview_url: 'https://example.com/preview2',
              category: 'standard'
            }
          ]
        }
      });

      const result = await getVoices('elevenlabs', 'test-api-key');

      // Check that axios was called correctly
      expect(axios.get).toHaveBeenCalledWith('https://api.elevenlabs.io/v1/voices', {
        headers: {
          'xi-api-key': 'test-api-key',
          'Content-Type': 'application/json'
        }
      });

      // Check that the result has the expected structure
      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('id', 'voice1');
      expect(result[0]).toHaveProperty('name', 'Voice 1');
      expect(result[0]).toHaveProperty('provider', 'elevenlabs');
      expect(result[1]).toHaveProperty('id', 'voice2');
      expect(result[1]).toHaveProperty('name', 'Voice 2');
    });

    it('should return a list of voices from OpenAI', async () => {
      const result = await getVoices('openai', 'test-api-key');

      // Check that the result has the expected structure
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toHaveProperty('id');
      expect(result[0]).toHaveProperty('name');
      expect(result[0]).toHaveProperty('provider', 'openai');
    });

    it('should handle errors properly', async () => {
      // Mock axios to throw an error
      (axios.get as any).mockRejectedValueOnce(new Error('API Error'));
      (axios.isAxiosError as any).mockReturnValueOnce(true);

      await expect(getVoices('elevenlabs', 'test-api-key')).rejects.toThrow();
    });
  });
});
