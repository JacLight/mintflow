import mattermostPlugin from '../src/index';

describe('Mattermost Plugin', () => {
  it('should be defined', () => {
    expect(mattermostPlugin).toBeDefined();
  });

  it('should have the correct properties', () => {
    expect(mattermostPlugin.name).toBe('Mattermost');
    expect(mattermostPlugin.id).toBe('mattermost');
    expect(mattermostPlugin.runner).toBe('node');
    expect(mattermostPlugin.type).toBe('node');
    expect(mattermostPlugin.actions).toHaveLength(2);
  });
});
