import redisPlugin from '../src/index';
import { describe, it, expect } from '@jest/globals';

describe('Redis Plugin', () => {
  it('should have the correct plugin metadata', () => {
    expect(redisPlugin.name).toBe('Redis');
    expect(redisPlugin.id).toBe('redis');
    expect(redisPlugin.runner).toBe('node');
  });

  it('should have all required actions', () => {
    const actionNames = redisPlugin.actions.map(action => action.name);
    expect(actionNames).toContain('set');
    expect(actionNames).toContain('get');
    expect(actionNames).toContain('delete');
    expect(actionNames).toContain('exists');
    expect(actionNames).toContain('expire');
    expect(actionNames).toContain('ttl');
    expect(actionNames).toContain('incr');
    expect(actionNames).toContain('incrBy');
    expect(actionNames).toContain('decr');
    expect(actionNames).toContain('decrBy');
    expect(actionNames).toContain('hSet');
    expect(actionNames).toContain('hGet');
    expect(actionNames).toContain('hGetAll');
    expect(actionNames).toContain('hDel');
    expect(actionNames).toContain('publish');
    expect(actionNames).toContain('lPush');
    expect(actionNames).toContain('rPush');
    expect(actionNames).toContain('lPop');
    expect(actionNames).toContain('rPop');
    expect(actionNames).toContain('lRange');
    expect(actionNames).toContain('executeCommand');
    expect(redisPlugin.actions).toHaveLength(21);
  });

  it('should have the correct input schema', () => {
    const { inputSchema } = redisPlugin;
    expect(inputSchema.type).toBe('object');
    expect(inputSchema.properties).toHaveProperty('url');
    expect(inputSchema.properties).toHaveProperty('username');
    expect(inputSchema.properties).toHaveProperty('password');
    expect(inputSchema.properties).toHaveProperty('database');
    expect(inputSchema.required).toContain('url');
  });

  it('should have the correct output schema', () => {
    const { outputSchema } = redisPlugin;
    expect(outputSchema.type).toBe('object');
    expect(outputSchema.properties).toHaveProperty('result');
    expect(outputSchema.properties).toHaveProperty('error');
  });
});
