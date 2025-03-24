import redditPlugin from '../src/index.js';

describe('Reddit Plugin', () => {
  it('should be defined', () => {
    expect(redditPlugin).toBeDefined();
  });

  it('should have the correct properties', () => {
    expect(redditPlugin.name).toBe('Reddit');
    expect(redditPlugin.id).toBe('reddit');
    expect(redditPlugin.runner).toBe('node');
    expect(redditPlugin.type).toBe('node');
    expect(redditPlugin.actions).toHaveLength(3);
  });

  it('should have the correct actions', () => {
    const actionNames = redditPlugin.actions.map(action => action.name);
    expect(actionNames).toContain('custom_api_call');
    expect(actionNames).toContain('get_subreddit');
    expect(actionNames).toContain('submit_post');
  });

  it('should have the correct authentication schema', () => {
    expect(redditPlugin.inputSchema.type).toBe('object');
    expect(redditPlugin.inputSchema.properties).toHaveProperty('clientId');
    expect(redditPlugin.inputSchema.properties).toHaveProperty('clientSecret');
    expect(redditPlugin.inputSchema.properties).toHaveProperty('username');
    expect(redditPlugin.inputSchema.properties).toHaveProperty('password');
    expect(redditPlugin.inputSchema.properties).toHaveProperty('userAgent');
    expect(redditPlugin.inputSchema.required).toContain('clientId');
    expect(redditPlugin.inputSchema.required).toContain('clientSecret');
    expect(redditPlugin.inputSchema.required).toContain('username');
    expect(redditPlugin.inputSchema.required).toContain('password');
    expect(redditPlugin.inputSchema.required).toContain('userAgent');
  });

  it('should have the custom_api_call action with correct properties', () => {
    const customApiCallAction = redditPlugin.actions.find(action => action.name === 'custom_api_call');
    expect(customApiCallAction).toBeDefined();
    expect(customApiCallAction?.displayName).toBe('Custom API Call');
    expect(customApiCallAction?.description).toContain('Make a custom API call');
    expect(customApiCallAction?.inputSchema.properties).toHaveProperty('endpoint');
    expect(customApiCallAction?.inputSchema.properties).toHaveProperty('method');
    expect(customApiCallAction?.inputSchema.required).toContain('endpoint');
    expect(customApiCallAction?.inputSchema.required).toContain('method');
  });

  it('should have the get_subreddit action with correct properties', () => {
    const getSubredditAction = redditPlugin.actions.find(action => action.name === 'get_subreddit');
    expect(getSubredditAction).toBeDefined();
    expect(getSubredditAction?.displayName).toBe('Get Subreddit');
    expect(getSubredditAction?.description).toContain('Get information about a subreddit');
    expect(getSubredditAction?.inputSchema.properties).toHaveProperty('subreddit');
    expect(getSubredditAction?.inputSchema.required).toContain('subreddit');
  });

  it('should have the submit_post action with correct properties', () => {
    const submitPostAction = redditPlugin.actions.find(action => action.name === 'submit_post');
    expect(submitPostAction).toBeDefined();
    expect(submitPostAction?.displayName).toBe('Submit Post');
    expect(submitPostAction?.description).toContain('Submit a new post');
    expect(submitPostAction?.inputSchema.properties).toHaveProperty('subreddit');
    expect(submitPostAction?.inputSchema.properties).toHaveProperty('title');
    expect(submitPostAction?.inputSchema.properties).toHaveProperty('content');
    expect(submitPostAction?.inputSchema.properties).toHaveProperty('kind');
    expect(submitPostAction?.inputSchema.required).toContain('subreddit');
    expect(submitPostAction?.inputSchema.required).toContain('title');
    expect(submitPostAction?.inputSchema.required).toContain('content');
    expect(submitPostAction?.inputSchema.required).toContain('kind');
  });
});
