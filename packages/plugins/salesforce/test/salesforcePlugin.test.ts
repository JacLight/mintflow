import salesforcePlugin, { SalesforceClient } from '../src/index.js';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

describe('salesforcePlugin', () => {
    let mock: MockAdapter;
    let axiosInstance: any;
    let executeSalesforce: any;

    beforeEach(() => {
        // Create a new axios instance for testing
        axiosInstance = axios.create();

        // Create a mock adapter for the axios instance
        mock = new MockAdapter(axiosInstance);

        // Get the execute function from the plugin
        executeSalesforce = salesforcePlugin.actions[0].execute;
    });

    afterEach(() => {
        // Reset and restore the mock
        mock.reset();
        mock.restore();
    });

    it('should create an object successfully', async () => {
        // Mock the objects endpoint for auth validation
        mock.onGet('https://test-instance.salesforce.com/services/data/v56.0/sobjects').reply(200, {
            sobjects: [{ name: 'Account', label: 'Account' }]
        });

        // Mock the create object endpoint
        mock.onPost('https://test-instance.salesforce.com/services/data/v56.0/sobjects/Account').reply(200, {
            id: '001xx000003DGb2AAG',
            success: true,
            errors: [],
            created: true
        });

        const input = {
            action: 'create_object',
            access_token: 'test-token',
            instance_url: 'https://test-instance.salesforce.com',
            object_name: 'Account',
            data: {
                Name: 'Test Account',
                Industry: 'Technology'
            }
        };

        // Pass the axiosInstance in the context
        const result = await executeSalesforce(input, { axiosInstance });

        expect(result).toEqual({
            id: '001xx000003DGb2AAG',
            success: true,
            errors: [],
            created: true
        });
    });

    it('should update an object successfully', async () => {
        // Mock the objects endpoint for auth validation
        mock.onGet('https://test-instance.salesforce.com/services/data/v56.0/sobjects').reply(200, {
            sobjects: [{ name: 'Account', label: 'Account' }]
        });

        // Mock the update object endpoint
        mock.onPatch('https://test-instance.salesforce.com/services/data/v56.0/sobjects/Account/001xx000003DGb2AAG').reply(204);

        const input = {
            action: 'update_object',
            access_token: 'test-token',
            instance_url: 'https://test-instance.salesforce.com',
            object_name: 'Account',
            record_id: '001xx000003DGb2AAG',
            data: {
                Industry: 'Healthcare'
            }
        };

        // Pass the axiosInstance in the context
        const result = await executeSalesforce(input, { axiosInstance });

        expect(result).toEqual({
            success: true,
            message: 'Record 001xx000003DGb2AAG updated successfully'
        });
    });

    it('should run a query successfully', async () => {
        // Mock the objects endpoint for auth validation
        mock.onGet('https://test-instance.salesforce.com/services/data/v56.0/sobjects').reply(200, {
            sobjects: [{ name: 'Account', label: 'Account' }]
        });

        // Mock the query endpoint
        mock.onGet('https://test-instance.salesforce.com/services/data/v56.0/query').reply(200, {
            totalSize: 2,
            done: true,
            records: [
                {
                    Id: '001xx000003DGb2AAG',
                    Name: 'Test Account 1',
                    Industry: 'Technology'
                },
                {
                    Id: '001xx000003DGb3AAG',
                    Name: 'Test Account 2',
                    Industry: 'Healthcare'
                }
            ]
        });

        const input = {
            action: 'run_query',
            access_token: 'test-token',
            instance_url: 'https://test-instance.salesforce.com',
            query: 'SELECT Id, Name, Industry FROM Account'
        };

        // Pass the axiosInstance in the context
        const result = await executeSalesforce(input, { axiosInstance });

        expect(result).toEqual({
            totalSize: 2,
            done: true,
            records: [
                {
                    Id: '001xx000003DGb2AAG',
                    Name: 'Test Account 1',
                    Industry: 'Technology'
                },
                {
                    Id: '001xx000003DGb3AAG',
                    Name: 'Test Account 2',
                    Industry: 'Healthcare'
                }
            ]
        });
    });

    it('should upsert by external ID successfully', async () => {
        // Mock the objects endpoint for auth validation
        mock.onGet('https://test-instance.salesforce.com/services/data/v56.0/sobjects').reply(200, {
            sobjects: [{ name: 'Account', label: 'Account' }]
        });

        // Mock the upsert endpoint
        mock.onPatch('https://test-instance.salesforce.com/services/data/v56.0/composite/sobjects/Account/External_ID__c').reply(200, [
            {
                id: '001xx000003DGb2AAG',
                success: true,
                errors: [],
                created: false
            },
            {
                id: '001xx000003DGb3AAG',
                success: true,
                errors: [],
                created: true
            }
        ]);

        const input = {
            action: 'upsert_by_external_id',
            access_token: 'test-token',
            instance_url: 'https://test-instance.salesforce.com',
            object_name: 'Account',
            external_field: 'External_ID__c',
            records: {
                records: [
                    {
                        External_ID__c: 'EXT001',
                        Name: 'Test Account 1',
                        Industry: 'Technology'
                    },
                    {
                        External_ID__c: 'EXT002',
                        Name: 'Test Account 2',
                        Industry: 'Healthcare'
                    }
                ]
            }
        };

        // Pass the axiosInstance in the context
        const result = await executeSalesforce(input, { axiosInstance });

        expect(result).toEqual([
            {
                id: '001xx000003DGb2AAG',
                success: true,
                errors: [],
                created: false
            },
            {
                id: '001xx000003DGb3AAG',
                success: true,
                errors: [],
                created: true
            }
        ]);
    });

    it('should perform bulk upsert successfully', async () => {
        // Mock the objects endpoint for auth validation
        mock.onGet('https://test-instance.salesforce.com/services/data/v56.0/sobjects').reply(200, {
            sobjects: [{ name: 'Account', label: 'Account' }]
        });

        // Mock the create bulk job endpoint
        mock.onPost('https://test-instance.salesforce.com/services/data/v56.0/jobs/ingest/').reply(200, {
            id: 'job-123',
            operation: 'upsert',
            object: 'Account',
            state: 'Open'
        });

        // Mock the upload to bulk job endpoint
        mock.onPut('https://test-instance.salesforce.com/services/data/v56.0/jobs/ingest/job-123/batches').reply(200);

        // Mock the notify bulk job complete endpoint
        mock.onPatch('https://test-instance.salesforce.com/services/data/v56.0/jobs/ingest/job-123').reply(200);

        // Mock the get bulk job info endpoint
        mock.onGet('https://test-instance.salesforce.com/services/data/v56.0/jobs/ingest/job-123').reply(200, {
            id: 'job-123',
            operation: 'upsert',
            object: 'Account',
            createdById: '005xx000001X8zZAAS',
            createdDate: '2023-01-01T00:00:00.000Z',
            systemModstamp: '2023-01-01T00:00:00.000Z',
            state: 'JobComplete',
            externalIdFieldName: 'External_ID__c',
            concurrencyMode: 'Parallel',
            contentType: 'CSV',
            apiVersion: 'v56.0',
            jobType: 'V2Ingest',
            lineEnding: 'CRLF',
            columnDelimiter: 'COMMA',
            numberRecordsProcessed: 2,
            numberRecordsFailed: 0,
            retries: 0,
            totalProcessingTime: 1000,
            apiActiveProcessingTime: 500,
            apexProcessingTime: 500
        });

        const input = {
            action: 'bulk_upsert',
            access_token: 'test-token',
            instance_url: 'https://test-instance.salesforce.com',
            object_name: 'Account',
            external_field: 'External_ID__c',
            csv_records: 'External_ID__c,Name,Industry\nEXT001,Test Account 1,Technology\nEXT002,Test Account 2,Healthcare'
        };

        // Pass the axiosInstance in the context
        const result = await executeSalesforce(input, { axiosInstance });

        expect(result).toEqual({
            id: 'job-123',
            operation: 'upsert',
            object: 'Account',
            createdById: '005xx000001X8zZAAS',
            createdDate: '2023-01-01T00:00:00.000Z',
            systemModstamp: '2023-01-01T00:00:00.000Z',
            state: 'JobComplete',
            externalIdFieldName: 'External_ID__c',
            concurrencyMode: 'Parallel',
            contentType: 'CSV',
            apiVersion: 'v56.0',
            jobType: 'V2Ingest',
            lineEnding: 'CRLF',
            columnDelimiter: 'COMMA',
            numberRecordsProcessed: 2,
            numberRecordsFailed: 0,
            retries: 0,
            totalProcessingTime: 1000,
            apiActiveProcessingTime: 500,
            apexProcessingTime: 500
        });
    });

    it('should throw an error for invalid authentication', async () => {
        // Mock the objects endpoint to return an error
        mock.onGet('https://test-instance.salesforce.com/services/data/v56.0/sobjects').reply(401, {
            error: 'invalid_session_id',
            error_description: 'Session expired or invalid'
        });

        const input = {
            action: 'create_object',
            access_token: 'invalid-token',
            instance_url: 'https://test-instance.salesforce.com',
            object_name: 'Account',
            data: {
                Name: 'Test Account',
                Industry: 'Technology'
            }
        };

        // Pass the axiosInstance in the context
        await expect(executeSalesforce(input, { axiosInstance })).rejects.toThrow('Invalid Salesforce authentication');
    });

    it('should throw an error for invalid action', async () => {
        // Mock the objects endpoint for auth validation
        mock.onGet('https://test-instance.salesforce.com/services/data/v56.0/sobjects').reply(200, {
            sobjects: [{ name: 'Account', label: 'Account' }]
        });

        const input = {
            action: 'invalid_action',
            access_token: 'test-token',
            instance_url: 'https://test-instance.salesforce.com'
        };

        // Pass the axiosInstance in the context
        await expect(executeSalesforce(input, { axiosInstance })).rejects.toThrow('Unsupported action: invalid_action');
    });

    it('should throw an error for missing required parameters', async () => {
        // Mock the objects endpoint for auth validation
        mock.onGet('https://test-instance.salesforce.com/services/data/v56.0/sobjects').reply(200, {
            sobjects: [{ name: 'Account', label: 'Account' }]
        });

        const input = {
            action: 'create_object',
            access_token: 'test-token',
            instance_url: 'https://test-instance.salesforce.com'
            // Missing object_name and data
        };

        // Pass the axiosInstance in the context
        await expect(executeSalesforce(input, { axiosInstance })).rejects.toThrow('Missing required parameters: object_name, data');
    });
});
