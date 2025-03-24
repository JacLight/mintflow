import groqPlugin from '../src/index.js';

describe('Groq Plugin', () => {
  it('should be defined', () => {
    expect(groqPlugin).toBeDefined();
  });

  it('should have the correct properties', () => {
    expect(groqPlugin.name).toBe('Groq');
    expect(groqPlugin.id).toBe('groq');
    expect(groqPlugin.runner).toBe('node');
    expect(groqPlugin.type).toBe('node');
    expect(groqPlugin.actions).toHaveLength(4);
    expect(groqPlugin.triggers).toHaveLength(0);
  });

  it('should have the correct actions', () => {
    const actionNames = groqPlugin.actions.map(action => action.name);
    expect(actionNames).toContain('ask_ai');
    expect(actionNames).toContain('transcribe_audio');
    expect(actionNames).toContain('translate_audio');
    expect(actionNames).toContain('custom_api_call');
  });

  it('should have the correct authentication schema', () => {
    expect(groqPlugin.inputSchema.type).toBe('object');
    expect(groqPlugin.inputSchema.properties).toHaveProperty('apiKey');
    expect(groqPlugin.inputSchema.required).toContain('apiKey');
  });

  it('should have the ask_ai action with correct properties', () => {
    const askAiAction = groqPlugin.actions.find(action => action.name === 'ask_ai');
    expect(askAiAction).toBeDefined();
    expect(askAiAction?.displayName).toBe('Ask AI');
    expect(askAiAction?.description).toContain('Ask Groq anything');
    expect(askAiAction?.inputSchema.properties).toHaveProperty('model');
    expect(askAiAction?.inputSchema.properties).toHaveProperty('prompt');
    expect(askAiAction?.inputSchema.required).toContain('model');
    expect(askAiAction?.inputSchema.required).toContain('prompt');
  });

  it('should have the transcribe_audio action with correct properties', () => {
    const transcribeAudioAction = groqPlugin.actions.find(action => action.name === 'transcribe_audio');
    expect(transcribeAudioAction).toBeDefined();
    expect(transcribeAudioAction?.displayName).toBe('Transcribe Audio');
    expect(transcribeAudioAction?.description).toContain('Transcribes audio');
    expect(transcribeAudioAction?.inputSchema.properties).toHaveProperty('file');
    expect(transcribeAudioAction?.inputSchema.properties).toHaveProperty('model');
    expect(transcribeAudioAction?.inputSchema.required).toContain('file');
    expect(transcribeAudioAction?.inputSchema.required).toContain('model');
  });

  it('should have the translate_audio action with correct properties', () => {
    const translateAudioAction = groqPlugin.actions.find(action => action.name === 'translate_audio');
    expect(translateAudioAction).toBeDefined();
    expect(translateAudioAction?.displayName).toBe('Translate Audio');
    expect(translateAudioAction?.description).toContain('Translates audio');
    expect(translateAudioAction?.inputSchema.properties).toHaveProperty('file');
    expect(translateAudioAction?.inputSchema.properties).toHaveProperty('model');
    expect(translateAudioAction?.inputSchema.required).toContain('file');
    expect(translateAudioAction?.inputSchema.required).toContain('model');
  });

  it('should have the custom_api_call action with correct properties', () => {
    const customApiCallAction = groqPlugin.actions.find(action => action.name === 'custom_api_call');
    expect(customApiCallAction).toBeDefined();
    expect(customApiCallAction?.displayName).toBe('Custom API Call');
    expect(customApiCallAction?.description).toContain('Make a custom API call');
    expect(customApiCallAction?.inputSchema.properties).toHaveProperty('endpoint');
    expect(customApiCallAction?.inputSchema.properties).toHaveProperty('method');
    expect(customApiCallAction?.inputSchema.required).toContain('endpoint');
    expect(customApiCallAction?.inputSchema.required).toContain('method');
  });
});
