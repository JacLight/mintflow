import jiraCloudPlugin, { JiraClient } from '../src/index.js';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

describe('jiraCloudPlugin', () => {
    let mock: MockAdapter;
    let axiosInstance: any;
    let executeJiraCloud: any;

    beforeEach(() => {
        // Create a new axios instance for testing
        axiosInstance = axios.create();

        // Create a mock adapter for the axios instance
        mock = new MockAdapter(axiosInstance);

        // Get the execute function from the plugin
        executeJiraCloud = jiraCloudPlugin.actions[0].execute;
    });

    afterEach(() => {
        // Reset and restore the mock
        mock.reset();
        mock.restore();
    });

    it('should create an issue successfully', async () => {
        // Mock the authentication validation endpoint
        mock.onGet('https://test-instance.atlassian.net/rest/api/3/myself').reply(200, {
            accountId: 'test-account-id',
            displayName: 'Test User'
        });

        // Mock the create issue endpoint
        mock.onPost('https://test-instance.atlassian.net/rest/api/3/issue').reply(200, {
            id: '10001',
            key: 'TEST-123',
            self: 'https://test-instance.atlassian.net/rest/api/3/issue/10001'
        });

        const input = {
            action: 'create_issue',
            instanceUrl: 'https://test-instance.atlassian.net',
            email: 'test@example.com',
            apiToken: 'test-token',
            projectId: '10000',
            issueTypeId: '10001',
            summary: 'Test Issue',
            description: 'This is a test issue'
        };

        // Pass the axiosInstance in the context
        const result = await executeJiraCloud(input, { axiosInstance });

        expect(result).toEqual({
            id: '10001',
            key: 'TEST-123',
            self: 'https://test-instance.atlassian.net/rest/api/3/issue/10001'
        });
    });

    it('should update an issue successfully', async () => {
        // Mock the authentication validation endpoint
        mock.onGet('https://test-instance.atlassian.net/rest/api/3/myself').reply(200, {
            accountId: 'test-account-id',
            displayName: 'Test User'
        });

        // Mock the update issue endpoint
        mock.onPut('https://test-instance.atlassian.net/rest/api/3/issue/TEST-123').reply(200, {
            id: '10001',
            key: 'TEST-123',
            self: 'https://test-instance.atlassian.net/rest/api/3/issue/10001'
        });

        const input = {
            action: 'update_issue',
            instanceUrl: 'https://test-instance.atlassian.net',
            email: 'test@example.com',
            apiToken: 'test-token',
            issueIdOrKey: 'TEST-123',
            summary: 'Updated Test Issue',
            description: 'This is an updated test issue'
        };

        // Pass the axiosInstance in the context
        const result = await executeJiraCloud(input, { axiosInstance });

        expect(result).toEqual({
            id: '10001',
            key: 'TEST-123',
            self: 'https://test-instance.atlassian.net/rest/api/3/issue/10001'
        });
    });

    it('should get an issue successfully', async () => {
        // Mock the authentication validation endpoint
        mock.onGet('https://test-instance.atlassian.net/rest/api/3/myself').reply(200, {
            accountId: 'test-account-id',
            displayName: 'Test User'
        });

        // Mock the get issue endpoint
        mock.onGet('https://test-instance.atlassian.net/rest/api/3/issue/TEST-123').reply(200, {
            id: '10001',
            key: 'TEST-123',
            self: 'https://test-instance.atlassian.net/rest/api/3/issue/10001',
            fields: {
                summary: 'Test Issue',
                description: {
                    content: [
                        {
                            content: [
                                {
                                    text: 'This is a test issue',
                                    type: 'text'
                                }
                            ],
                            type: 'paragraph'
                        }
                    ],
                    type: 'doc',
                    version: 1
                }
            }
        });

        const input = {
            action: 'get_issue',
            instanceUrl: 'https://test-instance.atlassian.net',
            email: 'test@example.com',
            apiToken: 'test-token',
            issueIdOrKey: 'TEST-123'
        };

        // Pass the axiosInstance in the context
        const result = await executeJiraCloud(input, { axiosInstance });

        expect(result).toEqual({
            id: '10001',
            key: 'TEST-123',
            self: 'https://test-instance.atlassian.net/rest/api/3/issue/10001',
            fields: {
                summary: 'Test Issue',
                description: {
                    content: [
                        {
                            content: [
                                {
                                    text: 'This is a test issue',
                                    type: 'text'
                                }
                            ],
                            type: 'paragraph'
                        }
                    ],
                    type: 'doc',
                    version: 1
                }
            }
        });
    });

    it('should search issues successfully', async () => {
        // Mock the authentication validation endpoint
        mock.onGet('https://test-instance.atlassian.net/rest/api/3/myself').reply(200, {
            accountId: 'test-account-id',
            displayName: 'Test User'
        });

        // Mock the search issues endpoint
        mock.onPost('https://test-instance.atlassian.net/rest/api/3/search').reply(200, {
            issues: [
                {
                    id: '10001',
                    key: 'TEST-123',
                    self: 'https://test-instance.atlassian.net/rest/api/3/issue/10001',
                    fields: {
                        summary: 'Test Issue 1'
                    }
                },
                {
                    id: '10002',
                    key: 'TEST-124',
                    self: 'https://test-instance.atlassian.net/rest/api/3/issue/10002',
                    fields: {
                        summary: 'Test Issue 2'
                    }
                }
            ]
        });

        const input = {
            action: 'search_issues',
            instanceUrl: 'https://test-instance.atlassian.net',
            email: 'test@example.com',
            apiToken: 'test-token',
            jql: 'project = TEST',
            maxResults: 10
        };

        // Pass the axiosInstance in the context
        const result = await executeJiraCloud(input, { axiosInstance });

        expect(result).toEqual([
            {
                id: '10001',
                key: 'TEST-123',
                self: 'https://test-instance.atlassian.net/rest/api/3/issue/10001',
                fields: {
                    summary: 'Test Issue 1'
                }
            },
            {
                id: '10002',
                key: 'TEST-124',
                self: 'https://test-instance.atlassian.net/rest/api/3/issue/10002',
                fields: {
                    summary: 'Test Issue 2'
                }
            }
        ]);
    });

    it('should add a comment successfully', async () => {
        // Mock the authentication validation endpoint
        mock.onGet('https://test-instance.atlassian.net/rest/api/3/myself').reply(200, {
            accountId: 'test-account-id',
            displayName: 'Test User'
        });

        // Mock the add comment endpoint
        mock.onPost('https://test-instance.atlassian.net/rest/api/3/issue/TEST-123/comment').reply(200, {
            id: '10001',
            self: 'https://test-instance.atlassian.net/rest/api/3/issue/TEST-123/comment/10001',
            body: {
                content: [
                    {
                        content: [
                            {
                                text: 'This is a test comment',
                                type: 'text'
                            }
                        ],
                        type: 'paragraph'
                    }
                ],
                type: 'doc',
                version: 1
            },
            author: {
                accountId: 'test-account-id',
                displayName: 'Test User'
            },
            created: '2023-01-01T00:00:00.000Z',
            updated: '2023-01-01T00:00:00.000Z'
        });

        const input = {
            action: 'add_comment',
            instanceUrl: 'https://test-instance.atlassian.net',
            email: 'test@example.com',
            apiToken: 'test-token',
            issueIdOrKey: 'TEST-123',
            comment: 'This is a test comment'
        };

        // Pass the axiosInstance in the context
        const result = await executeJiraCloud(input, { axiosInstance });

        expect(result).toEqual({
            id: '10001',
            self: 'https://test-instance.atlassian.net/rest/api/3/issue/TEST-123/comment/10001',
            body: {
                content: [
                    {
                        content: [
                            {
                                text: 'This is a test comment',
                                type: 'text'
                            }
                        ],
                        type: 'paragraph'
                    }
                ],
                type: 'doc',
                version: 1
            },
            author: {
                accountId: 'test-account-id',
                displayName: 'Test User'
            },
            created: '2023-01-01T00:00:00.000Z',
            updated: '2023-01-01T00:00:00.000Z'
        });
    });

    it('should throw an error for invalid authentication', async () => {
        // Mock the authentication validation endpoint to return an error
        mock.onGet('https://test-instance.atlassian.net/rest/api/3/myself').reply(401, {
            errorMessages: ['Authentication failed'],
            errors: {}
        });

        const input = {
            action: 'create_issue',
            instanceUrl: 'https://test-instance.atlassian.net',
            email: 'test@example.com',
            apiToken: 'invalid-token',
            projectId: '10000',
            issueTypeId: '10001',
            summary: 'Test Issue',
            description: 'This is a test issue'
        };

        // Pass the axiosInstance in the context
        await expect(executeJiraCloud(input, { axiosInstance })).rejects.toThrow('Invalid Jira Cloud authentication');
    });

    it('should throw an error for invalid action', async () => {
        // Mock the authentication validation endpoint
        mock.onGet('https://test-instance.atlassian.net/rest/api/3/myself').reply(200, {
            accountId: 'test-account-id',
            displayName: 'Test User'
        });

        const input = {
            action: 'invalid_action',
            instanceUrl: 'https://test-instance.atlassian.net',
            email: 'test@example.com',
            apiToken: 'test-token'
        };

        // Pass the axiosInstance in the context
        await expect(executeJiraCloud(input, { axiosInstance })).rejects.toThrow('Unsupported action: invalid_action');
    });

    it('should throw an error for missing required parameters', async () => {
        // Mock the authentication validation endpoint
        mock.onGet('https://test-instance.atlassian.net/rest/api/3/myself').reply(200, {
            accountId: 'test-account-id',
            displayName: 'Test User'
        });

        const input = {
            action: 'create_issue',
            instanceUrl: 'https://test-instance.atlassian.net',
            email: 'test@example.com',
            apiToken: 'test-token'
            // Missing projectId, issueTypeId, summary
        };

        // Pass the axiosInstance in the context
        await expect(executeJiraCloud(input, { axiosInstance })).rejects.toThrow('Missing required parameters: projectId, issueTypeId, summary');
    });
});
