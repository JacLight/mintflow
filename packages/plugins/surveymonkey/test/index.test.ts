import surveymonkeyPlugin from '../src/index.js';

describe('SurveyMonkey Plugin', () => {
  it('should be defined', () => {
    expect(surveymonkeyPlugin).toBeDefined();
  });

  it('should have the correct properties', () => {
    expect(surveymonkeyPlugin.name).toBe('SurveyMonkey');
    expect(surveymonkeyPlugin.id).toBe('surveymonkey');
    expect(surveymonkeyPlugin.runner).toBe('node');
    expect(surveymonkeyPlugin.type).toBe('node');
    expect(surveymonkeyPlugin.actions).toHaveLength(1);
    expect(surveymonkeyPlugin.triggers).toHaveLength(1);
  });

  it('should have the correct actions', () => {
    const actionNames = surveymonkeyPlugin.actions.map(action => action.name);
    expect(actionNames).toContain('custom_api_call');
  });

  it('should have the correct triggers', () => {
    const triggerNames = surveymonkeyPlugin.triggers.map(trigger => trigger.name);
    expect(triggerNames).toContain('new_response');
  });

  it('should have the correct authentication schema', () => {
    expect(surveymonkeyPlugin.inputSchema.type).toBe('object');
    expect(surveymonkeyPlugin.inputSchema.properties).toHaveProperty('access_token');
    expect(surveymonkeyPlugin.inputSchema.required).toContain('access_token');
  });
});
