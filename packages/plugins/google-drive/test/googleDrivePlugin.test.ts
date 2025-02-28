import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import googleDrivePlugin from '../src/index.js';

describe('googleDrivePlugin', () => {
    it('should have the correct plugin metadata', () => {
        expect(googleDrivePlugin.name).toBe('Google Drive');
        expect(googleDrivePlugin.description).toBe('Cloud storage and file backup');
        expect(googleDrivePlugin.id).toBe('google-drive');
        expect(googleDrivePlugin.runner).toBe('node');
    });

    it('should have the correct input schema', () => {
        expect(googleDrivePlugin.inputSchema.type).toBe('object');
        expect(googleDrivePlugin.inputSchema.properties.action.enum).toContain('upload_file');
        expect(googleDrivePlugin.inputSchema.properties.action.enum).toContain('create_folder');
        expect(googleDrivePlugin.inputSchema.properties.action.enum).toContain('list_files');
    });

    it('should have the correct example input and output', () => {
        expect(googleDrivePlugin.exampleInput).toBeDefined();
        expect(googleDrivePlugin.exampleOutput).toBeDefined();
    });

    it('should have the correct documentation URL', () => {
        expect(googleDrivePlugin.documentation).toBe('https://developers.google.com/drive/api/v3/reference');
    });

    it('should have the correct method', () => {
        expect(googleDrivePlugin.method).toBe('exec');
    });
});
