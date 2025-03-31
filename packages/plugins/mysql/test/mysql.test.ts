import mysqlPlugin from '../src/index';
import { describe, it, expect } from '@jest/globals';

describe('MySQL Plugin', () => {
  it('should have the correct plugin metadata', () => {
    expect(mysqlPlugin.name).toBe('MySQL');
    expect(mysqlPlugin.id).toBe('mysql');
    expect(mysqlPlugin.runner).toBe('node');
  });
});
