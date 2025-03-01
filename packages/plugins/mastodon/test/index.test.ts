import mastodonPlugin from '../src/index.js';

describe('Mastodon Plugin', () => {
  it('should be defined', () => {
    expect(mastodonPlugin).toBeDefined();
  });

  it('should have the correct properties', () => {
    expect(mastodonPlugin.name).toBe('Mastodon');
    expect(mastodonPlugin.id).toBe('mastodon');
    expect(mastodonPlugin.runner).toBe('node');
    expect(mastodonPlugin.type).toBe('node');
    expect(mastodonPlugin.actions).toHaveLength(3);
  });

  it('should have the correct actions', () => {
    const actionNames = mastodonPlugin.actions.map(action => action.name);
    expect(actionNames).toContain('custom_api_call');
    expect(actionNames).toContain('post_status');
    expect(actionNames).toContain('get_account');
  });

  it('should have the correct authentication schema', () => {
    expect(mastodonPlugin.inputSchema.type).toBe('object');
    expect(mastodonPlugin.inputSchema.properties).toHaveProperty('baseUrl');
    expect(mastodonPlugin.inputSchema.properties).toHaveProperty('accessToken');
    expect(mastodonPlugin.inputSchema.required).toContain('baseUrl');
    expect(mastodonPlugin.inputSchema.required).toContain('accessToken');
  });

  it('should have the custom_api_call action with correct properties', () => {
    const customApiCallAction = mastodonPlugin.actions.find(action => action.name === 'custom_api_call');
    expect(customApiCallAction).toBeDefined();
    expect(customApiCallAction?.displayName).toBe('Custom API Call');
    expect(customApiCallAction?.description).toContain('Make a custom API call');
    expect(customApiCallAction?.inputSchema.properties).toHaveProperty('endpoint');
    expect(customApiCallAction?.inputSchema.properties).toHaveProperty('method');
    expect(customApiCallAction?.inputSchema.required).toContain('endpoint');
    expect(customApiCallAction?.inputSchema.required).toContain('method');
  });

  it('should have the post_status action with correct properties', () => {
    const postStatusAction = mastodonPlugin.actions.find(action => action.name === 'post_status');
    expect(postStatusAction).toBeDefined();
    expect(postStatusAction?.displayName).toBe('Post Status');
    expect(postStatusAction?.description).toContain('Post a status');
    expect(postStatusAction?.inputSchema.properties).toHaveProperty('status');
    expect(postStatusAction?.inputSchema.properties).toHaveProperty('mediaBase64');
    expect(postStatusAction?.inputSchema.properties).toHaveProperty('visibility');
    expect(postStatusAction?.inputSchema.required).toContain('status');
  });

  it('should have the get_account action with correct properties', () => {
    const getAccountAction = mastodonPlugin.actions.find(action => action.name === 'get_account');
    expect(getAccountAction).toBeDefined();
    expect(getAccountAction?.displayName).toBe('Get Account');
    expect(getAccountAction?.description).toContain('Get a Mastodon account');
    expect(getAccountAction?.inputSchema.properties).toHaveProperty('accountId');
    expect(getAccountAction?.inputSchema.required).toContain('accountId');
  });
});
