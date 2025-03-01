import jotformPlugin from '../src/index.js';

describe('JotForm Plugin', () => {
  it('should be defined', () => {
    expect(jotformPlugin).toBeDefined();
  });

  it('should have the correct properties', () => {
    expect(jotformPlugin.name).toBe('JotForm');
    expect(jotformPlugin.id).toBe('jotform');
    expect(jotformPlugin.runner).toBe('node');
    expect(jotformPlugin.type).toBe('node');
    expect(jotformPlugin.actions).toHaveLength(1);
    expect(jotformPlugin.triggers).toHaveLength(1);
  });

  it('should have the correct actions', () => {
    const actionNames = jotformPlugin.actions.map(action => action.name);
    expect(actionNames).toContain('custom_api_call');
  });

  it('should have the correct triggers', () => {
    const triggerNames = jotformPlugin.triggers.map(trigger => trigger.name);
    expect(triggerNames).toContain('new_submission');
  });

  it('should have the correct authentication schema', () => {
    expect(jotformPlugin.inputSchema.type).toBe('object');
    expect(jotformPlugin.inputSchema.properties).toHaveProperty('apiKey');
    expect(jotformPlugin.inputSchema.properties).toHaveProperty('region');
    expect(jotformPlugin.inputSchema.required).toContain('apiKey');
    expect(jotformPlugin.inputSchema.required).toContain('region');
  });
});
