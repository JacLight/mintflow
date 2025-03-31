import { describe, it, expect, vi, beforeEach } from 'vitest';
import { speechToText, getTranscriptionStatus } from '../src/actions/speech-to-text.js';

// Mock AssemblyAI
vi.mock('assemblyai', () => ({
  AssemblyAI: vi.fn().mockImplementation(() => ({
    transcripts: {
      submit: vi.fn().mockResolvedValue({
        id: 'transcript-id',
        status: 'queued',
        audio_url: 'https://example.com/audio.mp3'
      }),
      waitUntilDone: vi.fn().mockResolvedValue({
        id: 'transcript-id',
        text: 'This is a test transcription.',
        status: 'completed',
        audio_url: 'https://example.com/audio.mp3',
        words: [{ text: 'This', confidence: 0.99 }],
        utterances: [],
        confidence: 0.95,
        audio_duration: 5000,
        language_code: 'en',
        sentiment_analysis_results: null,
        entities: null,
        error: null
      }),
      get: vi.fn().mockResolvedValue({
        id: 'transcript-id',
        text: 'This is a test transcription.',
        status: 'completed',
        audio_url: 'https://example.com/audio.mp3',
        words: [{ text: 'This', confidence: 0.99 }],
        utterances: [],
        confidence: 0.95,
        audio_duration: 5000,
        language_code: 'en',
        sentiment_analysis_results: null,
        entities: null,
        error: null
      }),
      upload: vi.fn().mockResolvedValue({
        upload_url: 'https://example.com/upload'
      })
    }
  }))
}));

// Mock axios
vi.mock('axios', () => ({
  default: {
    isAxiosError: vi.fn()
  }
}));

// Import axios after mocking
import axios from 'axios';

describe('Speech-to-Text Actions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('speechToText', () => {
    it('should transcribe audio from URL without waiting', async () => {
      const input = {
        apiKey: 'test-api-key',
        audioUrl: 'https://example.com/audio.mp3',
        language: 'en',
        speakerLabels: true,
        waitUntilReady: false
      };

      const result = await speechToText(input);

      // Check that the result has the expected structure
      expect(result).toHaveProperty('id', 'transcript-id');
      expect(result).toHaveProperty('status', 'queued');
      expect(result).toHaveProperty('audioUrl', 'https://example.com/audio.mp3');
      expect(result.text).toBe('');
    });

    it('should transcribe audio from URL and wait until ready', async () => {
      const input = {
        apiKey: 'test-api-key',
        audioUrl: 'https://example.com/audio.mp3',
        language: 'en',
        speakerLabels: true,
        waitUntilReady: true
      };

      const result = await speechToText(input);

      // Check that the result has the expected structure
      expect(result).toHaveProperty('id', 'transcript-id');
      expect(result).toHaveProperty('status', 'completed');
      expect(result).toHaveProperty('text', 'This is a test transcription.');
      expect(result).toHaveProperty('audioUrl', 'https://example.com/audio.mp3');
      expect(result).toHaveProperty('confidence', 0.95);
      expect(result).toHaveProperty('durationMs', 5000);
      expect(result).toHaveProperty('language', 'en');
    });

    it('should transcribe audio from base64 data', async () => {
      const input = {
        apiKey: 'test-api-key',
        audioData: 'base64-audio-data',
        waitUntilReady: true
      };

      const result = await speechToText(input);

      // Check that the result has the expected structure
      expect(result).toHaveProperty('id', 'transcript-id');
      expect(result).toHaveProperty('status', 'completed');
      expect(result).toHaveProperty('text', 'This is a test transcription.');
    });
  });

  describe('getTranscriptionStatus', () => {
    it('should get the status of a transcription', async () => {
      const result = await getTranscriptionStatus('test-api-key', 'transcript-id');

      // Check that the result has the expected structure
      expect(result).toHaveProperty('id', 'transcript-id');
      expect(result).toHaveProperty('status', 'completed');
      expect(result).toHaveProperty('text', 'This is a test transcription.');
      expect(result).toHaveProperty('audioUrl', 'https://example.com/audio.mp3');
      expect(result).toHaveProperty('confidence', 0.95);
      expect(result).toHaveProperty('durationMs', 5000);
      expect(result).toHaveProperty('language', 'en');
    });

    it('should handle errors properly', async () => {
      // Mock AssemblyAI to throw an error
      const mockAssemblyAI = {
        transcripts: {
          get: vi.fn().mockRejectedValue(new Error('API Error'))
        }
      };
      
      vi.mocked(require('assemblyai').AssemblyAI).mockImplementationOnce(() => mockAssemblyAI);
      (axios.isAxiosError as any).mockReturnValueOnce(false);

      await expect(getTranscriptionStatus('test-api-key', 'transcript-id')).rejects.toThrow();
    });
  });
});
