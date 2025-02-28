import postgresPlugin from '../src/index';
import { describe, it, expect } from '@jest/globals';

describe('PostgreSQL Plugin', () => {
  it('should have the correct plugin metadata', () => {
    expect(postgresPlugin.name).toBe('PostgreSQL');
    expect(postgresPlugin.id).toBe('postgres');
    expect(postgresPlugin.runner).toBe('node');
  });

  it('should have all required actions', () => {
    const actionNames = postgresPlugin.actions.map(action => action.name);
    expect(actionNames).toContain('executeQuery');
    expect(actionNames).toContain('getTables');
    expect(actionNames).toContain('selectRows');
    expect(actionNames).toContain('insertRow');
    expect(actionNames).toContain('updateRows');
    expect(actionNames).toContain('deleteRows');
    expect(postgresPlugin.actions).toHaveLength(6);
  });
});
