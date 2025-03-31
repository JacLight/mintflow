import tallyPlugin from '../src/index.js';

describe('Tally Plugin', () => {
  it('should be defined', () => {
    expect(tallyPlugin).toBeDefined();
  });

  it('should have the correct properties', () => {
    expect(tallyPlugin.name).toBe('Tally');
    expect(tallyPlugin.id).toBe('tally');
    expect(tallyPlugin.runner).toBe('node');
    expect(tallyPlugin.type).toBe('node');
    expect(tallyPlugin.actions).toHaveLength(0);
    expect(tallyPlugin.triggers).toHaveLength(1);
  });

  it('should have the correct triggers', () => {
    const triggerNames = tallyPlugin.triggers.map(trigger => trigger.name);
    expect(triggerNames).toContain('new_submission');
  });

  it('should have the correct trigger configuration', () => {
    const newSubmissionTrigger = tallyPlugin.triggers.find(trigger => trigger.name === 'new_submission');
    expect(newSubmissionTrigger).toBeDefined();
    expect(newSubmissionTrigger?.displayName).toBe('New Submission');
    expect(newSubmissionTrigger?.description).toBe('Triggers when form receives a new submission');
    expect(newSubmissionTrigger?.type).toBe('webhook');
    expect(newSubmissionTrigger?.instructions).toBeDefined();
  });
});
