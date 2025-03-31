import mediumPlugin from '../src/index.js';

describe('Medium Plugin', () => {
  it('should be defined', () => {
    expect(mediumPlugin).toBeDefined();
  });

  it('should have the correct properties', () => {
    expect(mediumPlugin.name).toBe('Medium');
    expect(mediumPlugin.id).toBe('medium');
    expect(mediumPlugin.runner).toBe('node');
    expect(mediumPlugin.type).toBe('node');
    expect(mediumPlugin.actions).toHaveLength(3);
  });

  it('should have the correct actions', () => {
    const actionNames = mediumPlugin.actions.map(action => action.name);
    expect(actionNames).toContain('custom_api_call');
    expect(actionNames).toContain('get_user');
    expect(actionNames).toContain('create_post');
  });

  it('should have the correct authentication schema', () => {
    expect(mediumPlugin.inputSchema.type).toBe('object');
    expect(mediumPlugin.inputSchema.properties).toHaveProperty('integrationToken');
    expect(mediumPlugin.inputSchema.required).toContain('integrationToken');
  });

  it('should have the custom_api_call action with correct properties', () => {
    const customApiCallAction = mediumPlugin.actions.find(action => action.name === 'custom_api_call');
    expect(customApiCallAction).toBeDefined();
    expect(customApiCallAction?.displayName).toBe('Custom API Call');
    expect(customApiCallAction?.description).toContain('Make a custom API call');
    expect(customApiCallAction?.inputSchema.properties).toHaveProperty('endpoint');
    expect(customApiCallAction?.inputSchema.properties).toHaveProperty('method');
    expect(customApiCallAction?.inputSchema.required).toContain('endpoint');
    expect(customApiCallAction?.inputSchema.required).toContain('method');
  });

  it('should have the get_user action with correct properties', () => {
    const getUserAction = mediumPlugin.actions.find(action => action.name === 'get_user');
    expect(getUserAction).toBeDefined();
    expect(getUserAction?.displayName).toBe('Get User');
    expect(getUserAction?.description).toContain('Get information about the authenticated Medium user');
    expect(getUserAction?.inputSchema.properties).toBeDefined();
    expect(getUserAction?.inputSchema.required).toHaveLength(0);
  });

  it('should have the create_post action with correct properties', () => {
    const createPostAction = mediumPlugin.actions.find(action => action.name === 'create_post');
    expect(createPostAction).toBeDefined();
    expect(createPostAction?.displayName).toBe('Create Post');
    expect(createPostAction?.description).toContain('Create a new post');
    expect(createPostAction?.inputSchema.properties).toHaveProperty('title');
    expect(createPostAction?.inputSchema.properties).toHaveProperty('content');
    expect(createPostAction?.inputSchema.properties).toHaveProperty('contentFormat');
    expect(createPostAction?.inputSchema.required).toContain('title');
    expect(createPostAction?.inputSchema.required).toContain('content');
    expect(createPostAction?.inputSchema.required).toContain('contentFormat');
  });
});
