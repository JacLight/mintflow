import axios, { AxiosInstance } from 'axios';

// GitHub API client
class GithubClient {
    baseUrl: string;
    axiosInstance: AxiosInstance;

    constructor(axiosInstance?: AxiosInstance) {
        this.baseUrl = 'https://api.github.com';
        this.axiosInstance = axiosInstance || axios;
    }

    async makeRequest(config: {
        method: string;
        endpoint: string;
        token: string;
        data?: any;
        params?: any;
    }) {
        try {
            const response = await this.axiosInstance({
                method: config.method,
                url: `${this.baseUrl}${config.endpoint}`,
                headers: {
                    'Authorization': `Bearer ${config.token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                data: config.data,
                params: config.params
            });
            return response.data;
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(`GitHub API error: ${error.response?.data?.message || error.message}`);
            }
            throw error;
        }
    }
}

// Create a default instance
const githubClient = new GithubClient();

const githubPlugin = {
    name: "GitHub",
    icon: "",
    description: "Interact with GitHub repositories, issues, and more",
    groups: ["development"],
    tags: ["development","code","programming","debugging","testing"],
    version: '1.0.0',
    id: "github",
    runner: "node",
    inputSchema: {
        type: "object",
        properties: {
            action: {
                type: 'string',
                enum: ['create_issue', 'get_issue', 'create_comment', 'lock_issue', 'unlock_issue', 'raw_graphql'],
                displayStyle: 'outlined',
                displaySize: 'small',
            },
            token: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'GitHub Personal Access Token with appropriate permissions',
            },
            owner: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Repository owner (username or organization)',
            },
            repo: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Repository name',
            },
            // Create Issue properties
            title: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Issue title',
                rules: [{ operation: 'notEqual', valueA: 'create_issue', valueB: '{{action}}', action: 'hide' }],
            },
            body: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Issue description',
                'x-control': 'Textarea',
                rules: [
                    { operation: 'notEqual', valueA: 'create_issue', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'create_comment', valueB: '{{action}}', action: 'hide' },
                ],
            },
            labels: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Comma-separated list of labels',
                rules: [{ operation: 'notEqual', valueA: 'create_issue', valueB: '{{action}}', action: 'hide' }],
            },
            assignees: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Comma-separated list of assignees',
                rules: [{ operation: 'notEqual', valueA: 'create_issue', valueB: '{{action}}', action: 'hide' }],
            },
            // Get Issue properties
            issue_number: {
                type: 'number',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Issue number',
                rules: [
                    { operation: 'notEqual', valueA: 'get_issue', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'create_comment', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'lock_issue', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'unlock_issue', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // GraphQL properties
            query: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'GraphQL query',
                'x-control': 'Code',
                'x-control-variant': 'graphql',
                rules: [{ operation: 'notEqual', valueA: 'raw_graphql', valueB: '{{action}}', action: 'hide' }],
            },
            variables: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'GraphQL variables (JSON)',
                'x-control': 'Code',
                'x-control-variant': 'json',
                rules: [{ operation: 'notEqual', valueA: 'raw_graphql', valueB: '{{action}}', action: 'hide' }],
            },
        },
        required: ['action', 'token', 'owner', 'repo'],
    },
    outputSchema: {
        type: "object",
    },
    exampleInput: {
        action: 'create_issue',
        token: 'ghp_xxxxxxxxxxxxxxxxxxxx',
        owner: 'octocat',
        repo: 'hello-world',
        title: 'Found a bug',
        body: 'I\'m having a problem with this.',
        labels: 'bug,help wanted',
        assignees: 'octocat'
    },
    exampleOutput: {
        "id": 1,
        "node_id": "MDU6SXNzdWUx",
        "url": "https://api.github.com/repos/octocat/hello-world/issues/1347",
        "repository_url": "https://api.github.com/repos/octocat/hello-world",
        "html_url": "https://github.com/octocat/hello-world/issues/1347",
        "number": 1347,
        "state": "open",
        "title": "Found a bug",
        "body": "I'm having a problem with this.",
        "user": {
            "login": "octocat",
            "id": 1
        }
    },
    documentation: "https://docs.github.com/en/rest",
    method: "exec",
    actions: [
        {
            name: 'github',
            execute: async (input: any, context?: any): Promise<any> => {
                const { action, token, owner, repo } = input;

                // Create a client instance, using the context's axios instance if provided
                const client = context?.axiosInstance ?
                    new GithubClient(context.axiosInstance) :
                    githubClient;

                if (!action || !token || !owner || !repo) {
                    throw new Error('Missing required parameters: action, token, owner, repo');
                }

                switch (action) {
                    case 'create_issue': {
                        const { title, body, labels, assignees } = input;

                        if (!title) {
                            throw new Error('Missing required parameter: title');
                        }

                        const issueData: any = {
                            title,
                            body
                        };

                        if (labels) {
                            issueData.labels = labels.split(',').map((label: string) => label.trim());
                        }

                        if (assignees) {
                            issueData.assignees = assignees.split(',').map((assignee: string) => assignee.trim());
                        }

                        return await client.makeRequest({
                            method: 'post',
                            endpoint: `/repos/${owner}/${repo}/issues`,
                            token,
                            data: issueData
                        });
                    }

                    case 'get_issue': {
                        const { issue_number } = input;

                        if (!issue_number) {
                            throw new Error('Missing required parameter: issue_number');
                        }

                        return await client.makeRequest({
                            method: 'get',
                            endpoint: `/repos/${owner}/${repo}/issues/${issue_number}`,
                            token
                        });
                    }

                    case 'create_comment': {
                        const { issue_number, body } = input;

                        if (!issue_number || !body) {
                            throw new Error('Missing required parameters: issue_number, body');
                        }

                        return await client.makeRequest({
                            method: 'post',
                            endpoint: `/repos/${owner}/${repo}/issues/${issue_number}/comments`,
                            token,
                            data: { body }
                        });
                    }

                    case 'lock_issue': {
                        const { issue_number } = input;

                        if (!issue_number) {
                            throw new Error('Missing required parameter: issue_number');
                        }

                        return await client.makeRequest({
                            method: 'put',
                            endpoint: `/repos/${owner}/${repo}/issues/${issue_number}/lock`,
                            token,
                            data: { lock_reason: 'resolved' }
                        });
                    }

                    case 'unlock_issue': {
                        const { issue_number } = input;

                        if (!issue_number) {
                            throw new Error('Missing required parameter: issue_number');
                        }

                        return await client.makeRequest({
                            method: 'delete',
                            endpoint: `/repos/${owner}/${repo}/issues/${issue_number}/lock`,
                            token
                        });
                    }

                    case 'raw_graphql': {
                        const { query, variables } = input;

                        if (!query) {
                            throw new Error('Missing required parameter: query');
                        }

                        let parsedVariables = {};
                        if (variables) {
                            try {
                                parsedVariables = JSON.parse(variables);
                            } catch (error) {
                                throw new Error('Invalid JSON in variables parameter');
                            }
                        }

                        return await client.makeRequest({
                            method: 'post',
                            endpoint: '/graphql',
                            token,
                            data: {
                                query,
                                variables: parsedVariables
                            }
                        });
                    }

                    default:
                        throw new Error(`Unsupported action: ${action}`);
                }
            }
        }
    ]
};

export { GithubClient, githubClient };
export default githubPlugin;
