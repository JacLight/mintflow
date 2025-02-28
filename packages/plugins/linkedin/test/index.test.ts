import { describe, it, expect, vi, beforeEach } from 'vitest';
import linkedinPlugin from '../src/index.js';
import * as actions from '../src/actions/index.js';
import * as common from '../src/common.js';

// Mock the actions
vi.mock('../src/actions/index.js', () => ({
  createShareUpdate: vi.fn(),
  createCompanyUpdate: vi.fn()
}));

// Mock the common functions
vi.mock('../src/common.js', () => ({
  validateOAuthToken: vi.fn()
}));

describe('LinkedIn Plugin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should have the correct name and description', () => {
    expect(linkedinPlugin.name).toBe('linkedin');
    expect(linkedinPlugin.description).toContain('Connect and network with professionals');
  });

  it('should have the correct actions', () => {
    expect(linkedinPlugin.actions).toHaveLength(2);
    expect(linkedinPlugin.actions[0].name).toBe('createShareUpdate');
    expect(linkedinPlugin.actions[1].name).toBe('createCompanyUpdate');
  });

  it('should validate credentials correctly when valid', async () => {
    vi.mocked(common.validateOAuthToken).mockResolvedValue(true);
    
    const result = await linkedinPlugin.validateCredentials({ accessToken: 'valid-token' });
    
    expect(result.valid).toBe(true);
    expect(result.message).toBe('API key is valid');
    expect(common.validateOAuthToken).toHaveBeenCalledWith('valid-token');
  });

  it('should validate credentials correctly when invalid', async () => {
    vi.mocked(common.validateOAuthToken).mockResolvedValue(false);
    
    const result = await linkedinPlugin.validateCredentials({ accessToken: 'invalid-token' });
    
    expect(result.valid).toBe(false);
    expect(result.message).toBe('Invalid API key');
    expect(common.validateOAuthToken).toHaveBeenCalledWith('invalid-token');
  });

  it('should handle errors during credential validation', async () => {
    vi.mocked(common.validateOAuthToken).mockRejectedValue(new Error('Network error'));
    
    const result = await linkedinPlugin.validateCredentials({ accessToken: 'error-token' });
    
    expect(result.valid).toBe(false);
    expect(result.message).toBe('Error validating API key');
    expect(common.validateOAuthToken).toHaveBeenCalledWith('error-token');
  });
});
