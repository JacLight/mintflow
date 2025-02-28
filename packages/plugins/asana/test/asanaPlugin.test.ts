import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import asanaPlugin from '../src/index.js';

describe('asanaPlugin', () => {
    it('should have the correct plugin metadata', () => {
        expect(asanaPlugin.name).toBe('asana');
        expect(asanaPlugin.id).toBe('asana');
        expect(asanaPlugin.runner).toBe('node');
    });

    it('should have the correct input schema', () => {
        expect(asanaPlugin.inputSchema.type).toBe('object');
    });

    it('should have documentation URL', () => {
        expect(asanaPlugin.documentation).toBeDefined();
    });

    it('should have the correct method', () => {
        expect(asanaPlugin.method).toBe('exec');
    });
});
