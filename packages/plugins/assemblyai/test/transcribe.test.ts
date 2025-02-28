import { describe, it, expect, vi, beforeEach } from 'vitest';
import { transcribe } from '../src/actions/transcribe.js';
import { createAssemblyAIClient } from '../src/common.js';

// Mock the AssemblyAI client
vi.mock('../src/common.js', () => ({
  createAssemblyAIClient: vi.fn()
}));

describe('transcribe', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should transcribe audio from URL', async () => {
    // Mock the client methods
    const mockSubmit = vi.fn().mockResolvedValue({
      id: 'test-transcript-id',
      status: 'queued',
      audio_url: 'https://example.com/audio.mp3'
    });

    const mockWaitUntilDone = vi.fn().mockResolvedValue({
      id: 'test-transcript-id',
      status: 'completed',
      text: 'This is a test transcription',
      audio_url: 'https://example.com/audio.mp3',
      words: [{ text: 'This', start: 0, end: 0.5 }],
      confidence: 0.95,
      audio_duration: 5000,
      language_code: 'en'
    });

    vi.mocked(createAssemblyAIClient).mockReturnValue({
      transcripts: {
        submit: mockSubmit,
        waitUntilDone: mockWaitUntilDone
      }
    });

    // Call the function
    const result = await transcribe({
      apiKey: 'test-api-key',
      audioUrl: 'https://example.com/audio.mp3',
      language: 'en',
      speakerLabels: true,
      waitUntilReady: true
    });

    // Verify the result
    expect(createAssemblyAIClient).toHaveBeenCalledWith('test-api-key');
    expect(mockSubmit).toHaveBeenCalledWith({
      audio_url: 'https://example.com/audio.mp3',
      language_code: 'en',
      speaker_labels: true
    });
    expect(mockWaitUntilDone).toHaveBeenCalledWith('test-transcript-id');
    expect(result).toEqual({
      id: 'test-transcript-id',
      status: 'completed',
      text: 'This is a test transcription',
      audioUrl: 'https://example.com/audio.mp3',
      words: [{ text: 'This', start: 0, end: 0.5 }],
      confidence: 0.95,
      durationMs: 5000,
      language: 'en'
    });
  });

  it('should transcribe audio from data', async () => {
    // Mock the client methods
    const mockUpload = vi.fn().mockResolvedValue({
      upload_url: 'https://example.com/uploaded-audio.mp3'
    });

    const mockSubmit = vi.fn().mockResolvedValue({
      id: 'test-transcript-id',
      status: 'queued',
      audio_url: 'https://example.com/uploaded-audio.mp3'
    });

    vi.mocked(createAssemblyAIClient).mockReturnValue({
      transcripts: {
        upload: mockUpload,
        submit: mockSubmit
      }
    });

    // Call the function
    const result = await transcribe({
      apiKey: 'test-api-key',
      audioData: 'base64-audio-data',
      audioMimeType: 'audio/mp3',
      waitUntilReady: false
    });

    // Verify the result
    expect(createAssemblyAIClient).toHaveBeenCalledWith('test-api-key');
    expect(mockUpload).toHaveBeenCalledWith({
      data: expect.any(Buffer),
      contentType: 'audio/mp3'
    });
    expect(mockSubmit).toHaveBeenCalledWith({
      audio_url: 'https://example.com/uploaded-audio.mp3'
    });
    expect(result).toEqual({
      id: 'test-transcript-id',
      status: 'queued',
      text: '',
      audioUrl: 'https://example.com/uploaded-audio.mp3'
    });
  });

  it('should handle errors', async () => {
    // Mock the client to throw an error
    vi.mocked(createAssemblyAIClient).mockReturnValue({
      transcripts: {
        submit: vi.fn().mockRejectedValue(new Error('API error'))
      }
    });

    // Call the function and expect it to throw
    await expect(transcribe({
      apiKey: 'test-api-key',
      audioUrl: 'https://example.com/audio.mp3'
    })).rejects.toThrow('AssemblyAI Transcription Error: API error');
  });
});
