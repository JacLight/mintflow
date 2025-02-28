import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getTranscriptStatus } from '../src/actions/get-transcript-status.js';
import { createAssemblyAIClient } from '../src/common.js';

// Mock the AssemblyAI client
vi.mock('../src/common.js', () => ({
  createAssemblyAIClient: vi.fn()
}));

describe('getTranscriptStatus', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should get the status of a completed transcript', async () => {
    // Mock the client methods
    const mockGet = vi.fn().mockResolvedValue({
      id: 'test-transcript-id',
      status: 'completed',
      text: 'This is a test transcription',
      audio_url: 'https://example.com/audio.mp3',
      words: [{ text: 'This', start: 0, end: 0.5 }],
      utterances: [],
      confidence: 0.95,
      audio_duration: 5000,
      language_code: 'en',
      sentiment_analysis_results: [{ text: 'This', sentiment: 'POSITIVE' }],
      entities: [{ entity_type: 'PERSON', text: 'John' }],
      error: null
    });

    vi.mocked(createAssemblyAIClient).mockReturnValue({
      transcripts: {
        get: mockGet
      }
    });

    // Call the function
    const result = await getTranscriptStatus({
      apiKey: 'test-api-key',
      transcriptId: 'test-transcript-id'
    });

    // Verify the result
    expect(createAssemblyAIClient).toHaveBeenCalledWith('test-api-key');
    expect(mockGet).toHaveBeenCalledWith('test-transcript-id');
    expect(result).toEqual({
      id: 'test-transcript-id',
      status: 'completed',
      text: 'This is a test transcription',
      audioUrl: 'https://example.com/audio.mp3',
      words: [{ text: 'This', start: 0, end: 0.5 }],
      utterances: [],
      confidence: 0.95,
      durationMs: 5000,
      language: 'en',
      sentiment: [{ text: 'This', sentiment: 'POSITIVE' }],
      entities: [{ entity_type: 'PERSON', text: 'John' }],
      error: null
    });
  });

  it('should get the status of a processing transcript', async () => {
    // Mock the client methods
    const mockGet = vi.fn().mockResolvedValue({
      id: 'test-transcript-id',
      status: 'processing',
      text: null,
      audio_url: 'https://example.com/audio.mp3',
      words: null,
      utterances: null,
      confidence: null,
      audio_duration: null,
      language_code: null,
      sentiment_analysis_results: null,
      entities: null,
      error: null
    });

    vi.mocked(createAssemblyAIClient).mockReturnValue({
      transcripts: {
        get: mockGet
      }
    });

    // Call the function
    const result = await getTranscriptStatus({
      apiKey: 'test-api-key',
      transcriptId: 'test-transcript-id'
    });

    // Verify the result
    expect(createAssemblyAIClient).toHaveBeenCalledWith('test-api-key');
    expect(mockGet).toHaveBeenCalledWith('test-transcript-id');
    expect(result).toEqual({
      id: 'test-transcript-id',
      status: 'processing',
      text: '',
      audioUrl: 'https://example.com/audio.mp3',
      words: null,
      utterances: null,
      confidence: null,
      durationMs: null,
      language: null,
      sentiment: null,
      entities: null,
      error: null
    });
  });

  it('should get the status of a failed transcript', async () => {
    // Mock the client methods
    const mockGet = vi.fn().mockResolvedValue({
      id: 'test-transcript-id',
      status: 'error',
      text: null,
      audio_url: 'https://example.com/audio.mp3',
      words: null,
      utterances: null,
      confidence: null,
      audio_duration: null,
      language_code: null,
      sentiment_analysis_results: null,
      entities: null,
      error: 'Invalid audio format'
    });

    vi.mocked(createAssemblyAIClient).mockReturnValue({
      transcripts: {
        get: mockGet
      }
    });

    // Call the function
    const result = await getTranscriptStatus({
      apiKey: 'test-api-key',
      transcriptId: 'test-transcript-id'
    });

    // Verify the result
    expect(createAssemblyAIClient).toHaveBeenCalledWith('test-api-key');
    expect(mockGet).toHaveBeenCalledWith('test-transcript-id');
    expect(result).toEqual({
      id: 'test-transcript-id',
      status: 'error',
      text: '',
      audioUrl: 'https://example.com/audio.mp3',
      words: null,
      utterances: null,
      confidence: null,
      durationMs: null,
      language: null,
      sentiment: null,
      entities: null,
      error: 'Invalid audio format'
    });
  });

  it('should handle errors', async () => {
    // Mock the client to throw an error
    vi.mocked(createAssemblyAIClient).mockReturnValue({
      transcripts: {
        get: vi.fn().mockRejectedValue(new Error('API error'))
      }
    });

    // Call the function and expect it to throw
    await expect(getTranscriptStatus({
      apiKey: 'test-api-key',
      transcriptId: 'test-transcript-id'
    })).rejects.toThrow('AssemblyAI Get Transcript Status Error: API error');
  });
});
