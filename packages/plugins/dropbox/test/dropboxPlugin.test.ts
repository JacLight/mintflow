import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import dropboxPlugin from '../src/index.js';

describe('dropboxPlugin', () => {
    it('should have the correct plugin metadata', () => {
        expect(dropboxPlugin.name).toBe('Dropbox');
        expect(dropboxPlugin.description).toBe('Cloud storage and file synchronization');
        expect(dropboxPlugin.id).toBe('dropbox');
        expect(dropboxPlugin.runner).toBe('node');
    });

    it('should have the correct input schema', () => {
        expect(dropboxPlugin.inputSchema.type).toBe('object');
        expect(dropboxPlugin.inputSchema.properties.action.enum).toContain('upload_file');
        expect(dropboxPlugin.inputSchema.properties.action.enum).toContain('list_folder');
        expect(dropboxPlugin.inputSchema.properties.action.enum).toContain('search');
    });

    it('should have the correct example input and output', () => {
        expect(dropboxPlugin.exampleInput).toBeDefined();
        expect(dropboxPlugin.exampleOutput).toBeDefined();
    });

    it('should have the correct documentation URL', () => {
        expect(dropboxPlugin.documentation).toBe('https://www.dropbox.com/developers/documentation/http/documentation');
    });

    it('should have the correct method', () => {
        expect(dropboxPlugin.method).toBe('exec');
    });
});
