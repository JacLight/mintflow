import supabasePlugin from '../src/index';
import { describe, it, expect } from '@jest/globals';

describe('Supabase Plugin', () => {
  it('should have the correct plugin metadata', () => {
    expect(supabasePlugin.name).toBe('Supabase');
    expect(supabasePlugin.id).toBe('supabase');
    expect(supabasePlugin.runner).toBe('node');
  });

  it('should have all required actions', () => {
    const actionNames = supabasePlugin.actions.map(action => action.name);
    expect(actionNames).toContain('uploadFile');
    expect(actionNames).toContain('downloadFile');
    expect(actionNames).toContain('listFiles');
    expect(actionNames).toContain('deleteFile');
    expect(actionNames).toContain('executeQuery');
    expect(actionNames).toContain('insertRecord');
    expect(actionNames).toContain('updateRecord');
    expect(actionNames).toContain('deleteRecord');
    expect(actionNames).toContain('createBucket');
    expect(supabasePlugin.actions).toHaveLength(9);
  });
});
