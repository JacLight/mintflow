import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import calendlyPlugin from '../src/index.js';

describe('calendlyPlugin', () => {
    it('should have the correct plugin metadata', () => {
        expect(calendlyPlugin.name).toBe('Calendly');
        expect(calendlyPlugin.description).toBe('Simple, modern scheduling');
        expect(calendlyPlugin.id).toBe('calendly');
        expect(calendlyPlugin.runner).toBe('node');
    });

    it('should have the correct input schema', () => {
        expect(calendlyPlugin.inputSchema.type).toBe('object');
        expect(calendlyPlugin.inputSchema.properties.action.enum).toContain('get_user');
        expect(calendlyPlugin.inputSchema.properties.action.enum).toContain('list_events');
        expect(calendlyPlugin.inputSchema.properties.action.enum).toContain('get_event');
    });

    it('should have the correct example input and output', () => {
        expect(calendlyPlugin.exampleInput).toBeDefined();
        expect(calendlyPlugin.exampleOutput).toBeDefined();
    });

    it('should have the correct documentation URL', () => {
        expect(calendlyPlugin.documentation).toBe('https://developer.calendly.com/api-docs');
    });

    it('should have the correct method', () => {
        expect(calendlyPlugin.method).toBe('exec');
    });
});
