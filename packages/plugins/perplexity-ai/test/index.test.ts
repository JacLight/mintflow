import perplexityAiPlugin from '../src/index.js';

describe('Perplexity AI Plugin', () => {
  it('should be defined', () => {
    expect(perplexityAiPlugin).toBeDefined();
  });

  it('should have the correct properties', () => {
    expect(perplexityAiPlugin.name).toBe('Perplexity AI');
    expect(perplexityAiPlugin.id).toBe('perplexity-ai');
    expect(perplexityAiPlugin.runner).toBe('node');
    expect(perplexityAiPlugin.type).toBe('node');
    expect(perplexityAiPlugin.actions).toHaveLength(1);
    expect(perplexityAiPlugin.triggers).toHaveLength(0);
  });

  it('should have the correct actions', () => {
    const actionNames = perplexityAiPlugin.actions.map(action => action.name);
    expect(actionNames).toContain('ask_ai');
  });

  it('should have the correct authentication schema', () => {
    expect(perplexityAiPlugin.inputSchema.type).toBe('object');
    expect(perplexityAiPlugin.inputSchema.properties).toHaveProperty('apiKey');
    expect(perplexityAiPlugin.inputSchema.required).toContain('apiKey');
  });

  it('should have the ask_ai action with correct properties', () => {
    const askAiAction = perplexityAiPlugin.actions.find(action => action.name === 'ask_ai');
    expect(askAiAction).toBeDefined();
    expect(askAiAction?.displayName).toBe('Ask AI');
    expect(askAiAction?.description).toContain('generate prompt completion');
    expect(askAiAction?.inputSchema.properties).toHaveProperty('model');
    expect(askAiAction?.inputSchema.properties).toHaveProperty('prompt');
    expect(askAiAction?.inputSchema.required).toContain('model');
    expect(askAiAction?.inputSchema.required).toContain('prompt');
  });
});
