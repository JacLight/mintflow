import { describe, it, expect, vi, beforeEach } from 'vitest';
import { lemurTask } from '../src/actions/lemur-task.js';
import { createAssemblyAIClient } from '../src/common.js';

// Mock the AssemblyAI client
vi.mock('../src/common.js', () => ({
  createAssemblyAIClient: vi.fn()
}));

describe('lemurTask', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should run a LeMUR task with required parameters', async () => {
    // Mock the client methods
    const mockLemurTask = vi.fn().mockResolvedValue({
      id: 'test-lemur-task-id',
      request: {
        prompt: 'Summarize the key points',
        transcript_ids: ['transcript-id-1', 'transcript-id-2'],
        final_model: undefined,
        max_output_size: undefined,
        temperature: undefined
      },
      response: 'This is a summary of the key points from the transcripts.',
      status: 'completed',
      error: null
    });

    vi.mocked(createAssemblyAIClient).mockReturnValue({
      lemur: {
        task: mockLemurTask
      }
    });

    // Call the function
    const result = await lemurTask({
      apiKey: 'test-api-key',
      transcriptIds: ['transcript-id-1', 'transcript-id-2'],
      prompt: 'Summarize the key points'
    });

    // Verify the result
    expect(createAssemblyAIClient).toHaveBeenCalledWith('test-api-key');
    expect(mockLemurTask).toHaveBeenCalledWith({
      transcript_ids: ['transcript-id-1', 'transcript-id-2'],
      prompt: 'Summarize the key points'
    });
    expect(result).toEqual({
      id: 'test-lemur-task-id',
      request: {
        prompt: 'Summarize the key points',
        transcript_ids: ['transcript-id-1', 'transcript-id-2'],
        final_model: undefined,
        max_output_size: undefined,
        temperature: undefined
      },
      response: 'This is a summary of the key points from the transcripts.',
      status: 'completed',
      error: null
    });
  });

  it('should run a LeMUR task with all parameters', async () => {
    // Mock the client methods
    const mockLemurTask = vi.fn().mockResolvedValue({
      id: 'test-lemur-task-id',
      request: {
        prompt: 'Summarize the key points',
        context: 'This is a meeting about product development',
        transcript_ids: ['transcript-id-1', 'transcript-id-2'],
        final_model: 'gpt-4',
        max_output_size: 500,
        temperature: 0.7
      },
      response: 'This is a detailed summary of the key points from the transcripts.',
      status: 'completed',
      error: null
    });

    vi.mocked(createAssemblyAIClient).mockReturnValue({
      lemur: {
        task: mockLemurTask
      }
    });

    // Call the function
    const result = await lemurTask({
      apiKey: 'test-api-key',
      transcriptIds: ['transcript-id-1', 'transcript-id-2'],
      prompt: 'Summarize the key points',
      context: 'This is a meeting about product development',
      final_model: 'gpt-4',
      max_output_size: 500,
      temperature: 0.7
    });

    // Verify the result
    expect(createAssemblyAIClient).toHaveBeenCalledWith('test-api-key');
    expect(mockLemurTask).toHaveBeenCalledWith({
      transcript_ids: ['transcript-id-1', 'transcript-id-2'],
      prompt: 'Summarize the key points',
      context: 'This is a meeting about product development',
      final_model: 'gpt-4',
      max_output_size: 500,
      temperature: 0.7
    });
    expect(result).toEqual({
      id: 'test-lemur-task-id',
      request: {
        prompt: 'Summarize the key points',
        context: 'This is a meeting about product development',
        transcript_ids: ['transcript-id-1', 'transcript-id-2'],
        final_model: 'gpt-4',
        max_output_size: 500,
        temperature: 0.7
      },
      response: 'This is a detailed summary of the key points from the transcripts.',
      status: 'completed',
      error: null
    });
  });

  it('should handle errors', async () => {
    // Mock the client to throw an error
    vi.mocked(createAssemblyAIClient).mockReturnValue({
      lemur: {
        task: vi.fn().mockRejectedValue(new Error('API error'))
      }
    });

    // Call the function and expect it to throw
    await expect(lemurTask({
      apiKey: 'test-api-key',
      transcriptIds: ['transcript-id-1'],
      prompt: 'Summarize the key points'
    })).rejects.toThrow('AssemblyAI LeMUR Task Error: API error');
  });
});
