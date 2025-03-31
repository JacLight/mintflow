import airtablePlugin, { AirtableClient } from '../src/index.js';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

describe('airtablePlugin', () => {
    let mock: MockAdapter;
    let axiosInstance: any;
    let executeAirtable: any;

    beforeEach(() => {
        // Create a new axios instance for testing
        axiosInstance = axios.create();

        // Create a mock adapter for the axios instance
        mock = new MockAdapter(axiosInstance);

        // Get the execute function from the plugin
        executeAirtable = airtablePlugin.actions[0].execute;
    });

    afterEach(() => {
        // Reset and restore the mock
        mock.reset();
        mock.restore();
    });

    it('should create a record successfully', async () => {
        // Mock the bases endpoint for token validation
        mock.onGet('https://api.airtable.com/v0/meta/bases').reply(200, {
            bases: [{ id: 'app123', name: 'Test Base', permissionLevel: 'create' }]
        });

        // Mock the tables endpoint for field processing
        mock.onGet('https://api.airtable.com/v0/meta/bases/app123/tables').reply(200, {
            tables: [{
                id: 'tbl123',
                name: 'Test Table',
                fields: [
                    { id: 'fld1', name: 'Name', type: 'singleLineText', description: '' },
                    { id: 'fld2', name: 'Email', type: 'email', description: '' },
                    { id: 'fld3', name: 'Status', type: 'singleSelect', description: '' }
                ],
                description: '',
                primaryFieldId: 'fld1',
                views: []
            }]
        });

        // Mock the create record endpoint
        mock.onPost('https://api.airtable.com/v0/app123/tbl123').reply(200, {
            id: 'rec123',
            createdTime: '2023-01-01T00:00:00.000Z',
            fields: {
                'fld1': 'John Doe',
                'fld2': 'john@example.com',
                'fld3': 'Active'
            }
        });

        const input = {
            action: 'create_record',
            token: 'test-token',
            baseId: 'app123',
            tableId: 'tbl123',
            fields: {
                'fld1': 'John Doe',
                'fld2': 'john@example.com',
                'fld3': 'Active'
            }
        };

        // Pass the axiosInstance in the context
        const result = await executeAirtable(input, { axiosInstance });

        expect(result).toEqual({
            id: 'rec123',
            createdTime: '2023-01-01T00:00:00.000Z',
            fields: {
                'fld1': 'John Doe',
                'fld2': 'john@example.com',
                'fld3': 'Active'
            }
        });
    });

    it('should find records successfully', async () => {
        // Mock the bases endpoint for token validation
        mock.onGet('https://api.airtable.com/v0/meta/bases').reply(200, {
            bases: [{ id: 'app123', name: 'Test Base', permissionLevel: 'create' }]
        });

        // Mock the find records endpoint
        mock.onGet('https://api.airtable.com/v0/app123/tbl123').reply(200, {
            records: [
                {
                    id: 'rec123',
                    createdTime: '2023-01-01T00:00:00.000Z',
                    fields: {
                        'Name': 'John Doe',
                        'Email': 'john@example.com',
                        'Status': 'Active'
                    }
                },
                {
                    id: 'rec456',
                    createdTime: '2023-01-02T00:00:00.000Z',
                    fields: {
                        'Name': 'Jane Doe',
                        'Email': 'jane@example.com',
                        'Status': 'Active'
                    }
                }
            ]
        });

        const input = {
            action: 'find_record',
            token: 'test-token',
            baseId: 'app123',
            tableId: 'tbl123',
            searchField: 'Status',
            searchValue: 'Active'
        };

        // Pass the axiosInstance in the context
        const result = await executeAirtable(input, { axiosInstance });

        expect(result).toEqual([
            {
                id: 'rec123',
                createdTime: '2023-01-01T00:00:00.000Z',
                fields: {
                    'Name': 'John Doe',
                    'Email': 'john@example.com',
                    'Status': 'Active'
                }
            },
            {
                id: 'rec456',
                createdTime: '2023-01-02T00:00:00.000Z',
                fields: {
                    'Name': 'Jane Doe',
                    'Email': 'jane@example.com',
                    'Status': 'Active'
                }
            }
        ]);
    });

    it('should update a record successfully', async () => {
        // Mock the bases endpoint for token validation
        mock.onGet('https://api.airtable.com/v0/meta/bases').reply(200, {
            bases: [{ id: 'app123', name: 'Test Base', permissionLevel: 'create' }]
        });

        // Mock the tables endpoint for field processing
        mock.onGet('https://api.airtable.com/v0/meta/bases/app123/tables').reply(200, {
            tables: [{
                id: 'tbl123',
                name: 'Test Table',
                fields: [
                    { id: 'fld1', name: 'Name', type: 'singleLineText', description: '' },
                    { id: 'fld2', name: 'Email', type: 'email', description: '' },
                    { id: 'fld3', name: 'Status', type: 'singleSelect', description: '' }
                ],
                description: '',
                primaryFieldId: 'fld1',
                views: []
            }]
        });

        // Mock the update record endpoint
        mock.onPatch('https://api.airtable.com/v0/app123/tbl123/rec123').reply(200, {
            id: 'rec123',
            createdTime: '2023-01-01T00:00:00.000Z',
            fields: {
                'fld1': 'John Doe',
                'fld2': 'john@example.com',
                'fld3': 'Inactive'
            }
        });

        const input = {
            action: 'update_record',
            token: 'test-token',
            baseId: 'app123',
            tableId: 'tbl123',
            recordId: 'rec123',
            fields: {
                'fld3': 'Inactive'
            }
        };

        // Pass the axiosInstance in the context
        const result = await executeAirtable(input, { axiosInstance });

        expect(result).toEqual({
            id: 'rec123',
            createdTime: '2023-01-01T00:00:00.000Z',
            fields: {
                'fld1': 'John Doe',
                'fld2': 'john@example.com',
                'fld3': 'Inactive'
            }
        });
    });

    it('should delete a record successfully', async () => {
        // Mock the bases endpoint for token validation
        mock.onGet('https://api.airtable.com/v0/meta/bases').reply(200, {
            bases: [{ id: 'app123', name: 'Test Base', permissionLevel: 'create' }]
        });

        // Mock the delete record endpoint
        mock.onDelete('https://api.airtable.com/v0/app123/tbl123/rec123').reply(200, {
            id: 'rec123',
            deleted: true
        });

        const input = {
            action: 'delete_record',
            token: 'test-token',
            baseId: 'app123',
            tableId: 'tbl123',
            recordId: 'rec123'
        };

        // Pass the axiosInstance in the context
        const result = await executeAirtable(input, { axiosInstance });

        expect(result).toEqual({
            id: 'rec123',
            deleted: true
        });
    });

    it('should throw an error for invalid token', async () => {
        // Mock the bases endpoint to return an error
        mock.onGet('https://api.airtable.com/v0/meta/bases').reply(401, {
            error: 'UNAUTHORIZED',
            message: 'Invalid API key'
        });

        const input = {
            action: 'create_record',
            token: 'invalid-token',
            baseId: 'app123',
            tableId: 'tbl123',
            fields: {
                'Name': 'John Doe',
                'Email': 'john@example.com'
            }
        };

        // Pass the axiosInstance in the context
        await expect(executeAirtable(input, { axiosInstance })).rejects.toThrow('Invalid Airtable token');
    });

    it('should throw an error for invalid action', async () => {
        // Mock the bases endpoint for token validation
        mock.onGet('https://api.airtable.com/v0/meta/bases').reply(200, {
            bases: [{ id: 'app123', name: 'Test Base', permissionLevel: 'create' }]
        });

        const input = {
            action: 'invalid_action',
            token: 'test-token',
            baseId: 'app123',
            tableId: 'tbl123'
        };

        // Pass the axiosInstance in the context
        await expect(executeAirtable(input, { axiosInstance })).rejects.toThrow('Unsupported action: invalid_action');
    });

    it('should throw an error for missing required parameters', async () => {
        // Mock the bases endpoint for token validation
        mock.onGet('https://api.airtable.com/v0/meta/bases').reply(200, {
            bases: [{ id: 'app123', name: 'Test Base', permissionLevel: 'create' }]
        });

        const input = {
            action: 'create_record',
            token: 'test-token',
            baseId: 'app123',
            tableId: 'tbl123'
            // Missing fields
        };

        // Pass the axiosInstance in the context
        await expect(executeAirtable(input, { axiosInstance })).rejects.toThrow('Missing or invalid fields parameter');
    });
});
