import pineconePlugin from '../src/index';
import { describe, it, expect } from '@jest/globals';

describe('Pinecone Plugin', () => {
  it('should have the correct plugin metadata', () => {
    expect(pineconePlugin.name).toBe('Pinecone');
    expect(pineconePlugin.id).toBe('pinecone');
    expect(pineconePlugin.runner).toBe('node');
  });

  it('should have all required actions', () => {
    const actionNames = pineconePlugin.actions.map(action => action.name);
    expect(actionNames).toContain('listIndexes');
    expect(actionNames).toContain('describeIndex');
    expect(actionNames).toContain('createIndex');
    expect(actionNames).toContain('deleteIndex');
    expect(actionNames).toContain('upsertVectors');
    expect(actionNames).toContain('queryVectors');
    expect(actionNames).toContain('deleteVectors');
    expect(actionNames).toContain('fetchVectors');
    expect(actionNames).toContain('updateVector');
    expect(actionNames).toContain('describeIndexStats');
    expect(pineconePlugin.actions).toHaveLength(10);
  });

  it('should have the correct input schema', () => {
    const { inputSchema } = pineconePlugin;
    expect(inputSchema.type).toBe('object');
    expect(inputSchema.properties).toHaveProperty('apiKey');
    expect(inputSchema.properties).toHaveProperty('environment');
    expect(inputSchema.properties).toHaveProperty('projectId');
    expect(inputSchema.required).toContain('apiKey');
  });

  it('should have the correct output schema', () => {
    const { outputSchema } = pineconePlugin;
    expect(outputSchema.type).toBe('object');
    expect(outputSchema.properties).toHaveProperty('data');
    expect(outputSchema.properties).toHaveProperty('error');
  });
});
