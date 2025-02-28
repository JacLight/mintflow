import qdrantPlugin from '../src/index';
import { describe, it, expect } from '@jest/globals';

describe('Qdrant Plugin', () => {
  it('should have the correct plugin metadata', () => {
    expect(qdrantPlugin.name).toBe('Qdrant');
    expect(qdrantPlugin.id).toBe('qdrant');
    expect(qdrantPlugin.runner).toBe('node');
  });

  it('should have all required actions', () => {
    const actionNames = qdrantPlugin.actions.map(action => action.name);
    expect(actionNames).toContain('listCollections');
    expect(actionNames).toContain('getCollectionInfo');
    expect(actionNames).toContain('createCollection');
    expect(actionNames).toContain('deleteCollection');
    expect(actionNames).toContain('addPoints');
    expect(actionNames).toContain('searchPoints');
    expect(actionNames).toContain('getPoints');
    expect(actionNames).toContain('deletePoints');
    expect(actionNames).toContain('getCollectionStats');
    expect(qdrantPlugin.actions).toHaveLength(9);
  });

  it('should have the correct input schema', () => {
    const { inputSchema } = qdrantPlugin;
    expect(inputSchema.type).toBe('object');
    expect(inputSchema.properties).toHaveProperty('serverAddress');
    expect(inputSchema.properties).toHaveProperty('apiKey');
    expect(inputSchema.required).toContain('serverAddress');
    expect(inputSchema.required).toContain('apiKey');
  });

  it('should have the correct output schema', () => {
    const { outputSchema } = qdrantPlugin;
    expect(outputSchema.type).toBe('object');
    expect(outputSchema.properties).toHaveProperty('data');
    expect(outputSchema.properties).toHaveProperty('error');
  });

  describe('Action Input Schemas', () => {
    it('should have correct input schema for listCollections', () => {
      const action = qdrantPlugin.actions.find(a => a.name === 'listCollections');
      expect(action).toBeDefined();
      expect(action?.inputSchema.type).toBe('object');
      expect(Object.keys(action?.inputSchema.properties || {})).toHaveLength(0);
    });

    it('should have correct input schema for createCollection', () => {
      const action = qdrantPlugin.actions.find(a => a.name === 'createCollection');
      expect(action).toBeDefined();
      expect(action?.inputSchema.type).toBe('object');
      expect(action?.inputSchema.properties).toHaveProperty('collectionName');
      expect(action?.inputSchema.properties).toHaveProperty('dimension');
      expect(action?.inputSchema.properties).toHaveProperty('distance');
      expect(action?.inputSchema.properties).toHaveProperty('onDisk');
      expect(action?.inputSchema.required).toContain('collectionName');
      expect(action?.inputSchema.required).toContain('dimension');
    });

    it('should have correct input schema for searchPoints', () => {
      const action = qdrantPlugin.actions.find(a => a.name === 'searchPoints');
      expect(action).toBeDefined();
      expect(action?.inputSchema.type).toBe('object');
      expect(action?.inputSchema.properties).toHaveProperty('collectionName');
      expect(action?.inputSchema.properties).toHaveProperty('vector');
      expect(action?.inputSchema.properties).toHaveProperty('limit');
      expect(action?.inputSchema.properties).toHaveProperty('filter');
      expect(action?.inputSchema.properties).toHaveProperty('withPayload');
      expect(action?.inputSchema.properties).toHaveProperty('withVector');
      expect(action?.inputSchema.required).toContain('collectionName');
      expect(action?.inputSchema.required).toContain('vector');
    });
  });
});
