import { describe, it, expect, vi, beforeEach } from 'vitest';
import assemblyaiPlugin from '../src/index.js';
import * as actions from '../src/actions/index.js';
import { validateApiKey } from '../src/common.js';

// Mock the actions
vi.mock('../src/actions/index.js', () => ({
  transcribe: vi.fn(),
  lemurTask: vi.fn(),
  getTranscriptStatus: vi.fn()
}));

// Mock the validateApiKey function
vi.mock('../src/common.js', () => ({
  validateApiKey: vi.fn()
}));

describe('assemblyaiPlugin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should have the correct plugin properties', () => {
    expect(assemblyaiPlugin.name).toBe('assemblyai');
    expect(assemblyaiPlugin.id).toBe('assemblyai');
    expect(assemblyaiPlugin.runner).toBe('node');
    expect(assemblyaiPlugin.description).toContain('Advanced speech recognition');
    expect(assemblyaiPlugin.documentation).toBe('https://www.assemblyai.com/docs');
    expect(assemblyaiPlugin.method).toBe('exec');
  });

  it('should have the correct input and output schemas', () => {
    expect(assemblyaiPlugin.inputSchema).toHaveProperty('type', 'object');
    expect(assemblyaiPlugin.inputSchema.properties).toHaveProperty('apiKey');
    expect(assemblyaiPlugin.inputSchema.required).toContain('apiKey');

    expect(assemblyaiPlugin.outputSchema).toHaveProperty('type', 'object');
    expect(assemblyaiPlugin.outputSchema.properties).toHaveProperty('success');
    expect(assemblyaiPlugin.outputSchema.properties).toHaveProperty('message');
  });

  it('should have the correct actions', () => {
    expect(assemblyaiPlugin.actions).toHaveLength(3);
    
    // Check transcribe action
    const transcribeAction = assemblyaiPlugin.actions.find(action => action.name === 'transcribe');
    expect(transcribeAction).toBeDefined();
    expect(transcribeAction?.description).toContain('Transcribe audio');
    expect(transcribeAction?.runner).toBe(actions.transcribe);
    
    // Check lemurTask action
    const lemurTaskAction = assemblyaiPlugin.actions.find(action => action.name === 'lemurTask');
    expect(lemurTaskAction).toBeDefined();
    expect(lemurTaskAction?.description).toContain('LeMUR');
    expect(lemurTaskAction?.runner).toBe(actions.lemurTask);
    
    // Check getTranscriptStatus action
    const getTranscriptStatusAction = assemblyaiPlugin.actions.find(action => action.name === 'getTranscriptStatus');
    expect(getTranscriptStatusAction).toBeDefined();
    expect(getTranscriptStatusAction?.description).toContain('status');
    expect(getTranscriptStatusAction?.runner).toBe(actions.getTranscriptStatus);
  });

  describe('validateCredentials', () => {
    it('should return valid=true when API key is valid', async () => {
      vi.mocked(validateApiKey).mockResolvedValueOnce(true);
      
      const result = await assemblyaiPlugin.validateCredentials?.({ apiKey: 'valid-api-key' });
      
      expect(validateApiKey).toHaveBeenCalledWith('valid-api-key');
      expect(result).toEqual({
        valid: true,
        message: 'API key is valid'
      });
    });

    it('should return valid=false when API key is invalid', async () => {
      vi.mocked(validateApiKey).mockResolvedValueOnce(false);
      
      const result = await assemblyaiPlugin.validateCredentials?.({ apiKey: 'invalid-api-key' });
      
      expect(validateApiKey).toHaveBeenCalledWith('invalid-api-key');
      expect(result).toEqual({
        valid: false,
        message: 'Invalid API key'
      });
    });

    it('should handle errors during validation', async () => {
      vi.mocked(validateApiKey).mockRejectedValueOnce(new Error('Network error'));
      
      const result = await assemblyaiPlugin.validateCredentials?.({ apiKey: 'api-key' });
      
      expect(validateApiKey).toHaveBeenCalledWith('api-key');
      expect(result).toEqual({
        valid: false,
        message: 'Error validating API key'
      });
    });
  });
});
