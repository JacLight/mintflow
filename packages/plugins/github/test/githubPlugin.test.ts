import githubPlugin, { GithubClient } from '../src/index';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

describe('githubPlugin', () => {
    let mock: MockAdapter;
    let axiosInstance: any;
    let executeGithub: any;

    beforeEach(() => {
        // Create a new axios instance for testing
        axiosInstance = axios.create();

        // Create a mock adapter for the axios instance
        mock = new MockAdapter(axiosInstance);

        // Get the execute function from the plugin
        executeGithub = githubPlugin.actions[0].execute;
    });

    afterEach(() => {
        // Reset and restore the mock
        mock.reset();
        mock.restore();
    });

    it('should create an issue successfully', async () => {
        const issueData = {
            id: 1,
            number: 1347,
            title: 'Found a bug',
            body: 'I\'m having a problem with this.',
            state: 'open',
            html_url: 'https://github.com/octocat/hello-world/issues/1347'
        };

        // Mock the POST request to create an issue
        mock.onPost('https://api.github.com/repos/octocat/hello-world/issues').reply(201, issueData);

        const input = {
            action: 'create_issue',
            token: 'test-token',
            owner: 'octocat',
            repo: 'hello-world',
            title: 'Found a bug',
            body: 'I\'m having a problem with this.',
            labels: 'bug,help wanted',
            assignees: 'octocat'
        };

        // Pass the axiosInstance in the context
        const result = await executeGithub(input, { axiosInstance });
        expect(result).toEqual(issueData);
    });

    it('should get issue information successfully', async () => {
        const issueData = {
            id: 1,
            number: 1347,
            title: 'Found a bug',
            body: 'I\'m having a problem with this.',
            state: 'open',
            html_url: 'https://github.com/octocat/hello-world/issues/1347'
        };

        // Mock the GET request to get issue information
        mock.onGet('https://api.github.com/repos/octocat/hello-world/issues/1347').reply(200, issueData);

        const input = {
            action: 'get_issue',
            token: 'test-token',
            owner: 'octocat',
            repo: 'hello-world',
            issue_number: 1347
        };

        // Pass the axiosInstance in the context
        const result = await executeGithub(input, { axiosInstance });
        expect(result).toEqual(issueData);
    });

    it('should create a comment on an issue successfully', async () => {
        const commentData = {
            id: 1,
            body: 'This is a comment',
            user: {
                login: 'octocat',
                id: 1
            }
        };

        // Mock the POST request to create a comment
        mock.onPost('https://api.github.com/repos/octocat/hello-world/issues/1347/comments').reply(201, commentData);

        const input = {
            action: 'create_comment',
            token: 'test-token',
            owner: 'octocat',
            repo: 'hello-world',
            issue_number: 1347,
            body: 'This is a comment'
        };

        // Pass the axiosInstance in the context
        const result = await executeGithub(input, { axiosInstance });
        expect(result).toEqual(commentData);
    });

    it('should lock an issue successfully', async () => {
        // Mock the PUT request to lock an issue
        mock.onPut('https://api.github.com/repos/octocat/hello-world/issues/1347/lock').reply(204);

        const input = {
            action: 'lock_issue',
            token: 'test-token',
            owner: 'octocat',
            repo: 'hello-world',
            issue_number: 1347
        };

        // Pass the axiosInstance in the context
        const result = await executeGithub(input, { axiosInstance });
        expect(result).toEqual(undefined);
    });

    it('should unlock an issue successfully', async () => {
        // Mock the DELETE request to unlock an issue
        mock.onDelete('https://api.github.com/repos/octocat/hello-world/issues/1347/lock').reply(204);

        const input = {
            action: 'unlock_issue',
            token: 'test-token',
            owner: 'octocat',
            repo: 'hello-world',
            issue_number: 1347
        };

        // Pass the axiosInstance in the context
        const result = await executeGithub(input, { axiosInstance });
        expect(result).toEqual(undefined);
    });

    it('should execute a GraphQL query successfully', async () => {
        const graphqlResponse = {
            data: {
                repository: {
                    issues: {
                        nodes: [
                            {
                                id: 'MDU6SXNzdWUx',
                                title: 'Found a bug',
                                body: 'I\'m having a problem with this.'
                            }
                        ]
                    }
                }
            }
        };

        // Mock the POST request to execute a GraphQL query
        mock.onPost('https://api.github.com/graphql').reply(200, graphqlResponse);

        const input = {
            action: 'raw_graphql',
            token: 'test-token',
            owner: 'octocat',
            repo: 'hello-world',
            query: `
                query {
                    repository(owner: "octocat", name: "hello-world") {
                        issues(first: 1) {
                            nodes {
                                id
                                title
                                body
                            }
                        }
                    }
                }
            `,
            variables: JSON.stringify({})
        };

        // Pass the axiosInstance in the context
        const result = await executeGithub(input, { axiosInstance });
        expect(result).toEqual(graphqlResponse);
    });

    it('should throw an error for invalid action', async () => {
        const input = {
            action: 'invalid_action',
            token: 'test-token',
            owner: 'octocat',
            repo: 'hello-world'
        };

        // Pass the axiosInstance in the context
        await expect(executeGithub(input, { axiosInstance })).rejects.toThrow('Unsupported action: invalid_action');
    });

    it('should throw an error for missing required parameters', async () => {
        const input = {
            action: 'create_issue',
            token: 'test-token',
            owner: 'octocat',
            repo: 'hello-world'
            // Missing title
        };

        // Pass the axiosInstance in the context
        await expect(executeGithub(input, { axiosInstance })).rejects.toThrow('Missing required parameter: title');
    });

    it('should handle API errors', async () => {
        // Mock the POST request to create an issue with an error response
        mock.onPost('https://api.github.com/repos/octocat/hello-world/issues').reply(422, {
            message: 'Validation Failed'
        });

        const input = {
            action: 'create_issue',
            token: 'test-token',
            owner: 'octocat',
            repo: 'hello-world',
            title: 'Found a bug'
            // Intentionally missing body to trigger the error
        };

        // Pass the axiosInstance in the context
        await expect(executeGithub(input, { axiosInstance })).rejects.toThrow('GitHub API error: Validation Failed');
    });
});
