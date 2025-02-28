import { JiraClient } from './client.js';
import { JiraAuth, JiraCreateIssueRequest, JiraUpdateIssueRequest } from './models.js';
import { Buffer } from 'buffer';

// Create a default client instance with empty auth
const defaultClient = new JiraClient({
    instanceUrl: '',
    email: '',
    apiToken: ''
});

const jiraCloudPlugin = {
    name: "Jira Cloud",
    icon: "",
    description: "Issue tracking and project management",
    id: "jira-cloud",
    runner: "node",
    inputSchema: {
        type: "object",
        properties: {
            action: {
                type: 'string',
                enum: [
                    'create_issue',
                    'update_issue',
                    'get_issue',
                    'search_issues',
                    'add_comment',
                    'update_comment',
                    'delete_comment',
                    'get_comments',
                    'assign_issue',
                    'add_watcher',
                    'find_user',
                    'link_issues',
                    'add_attachment'
                ],
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Action to perform on Jira Cloud',
            },
            instanceUrl: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Jira Cloud Instance URL (e.g., https://your-domain.atlassian.net)',
            },
            email: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Email address associated with your Atlassian account',
            },
            apiToken: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'API Token generated from your Atlassian account',
            },
            // Fields for create_issue
            projectId: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Project ID or key',
                rules: [
                    { operation: 'notEqual', valueA: 'create_issue', valueB: '{{action}}', action: 'hide' },
                ],
            },
            issueTypeId: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Issue Type ID',
                rules: [
                    { operation: 'notEqual', valueA: 'create_issue', valueB: '{{action}}', action: 'hide' },
                ],
            },
            summary: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Issue summary',
                rules: [
                    { operation: 'notEqual', valueA: 'create_issue', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'update_issue', valueB: '{{action}}', action: 'hide' },
                ],
            },
            description: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Issue description',
                rules: [
                    { operation: 'notEqual', valueA: 'create_issue', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'update_issue', valueB: '{{action}}', action: 'hide' },
                ],
            },
            assignee: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'User account ID to assign the issue to',
                rules: [
                    { operation: 'notEqual', valueA: 'create_issue', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'update_issue', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'assign_issue', valueB: '{{action}}', action: 'hide' },
                ],
            },
            priority: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Priority ID',
                rules: [
                    { operation: 'notEqual', valueA: 'create_issue', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'update_issue', valueB: '{{action}}', action: 'hide' },
                ],
            },
            parentKey: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Parent issue key (for subtasks)',
                rules: [
                    { operation: 'notEqual', valueA: 'create_issue', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Fields for update_issue, get_issue, add_comment, etc.
            issueIdOrKey: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Issue ID or key',
                rules: [
                    { operation: 'notEqual', valueA: 'update_issue', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'get_issue', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'add_comment', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'update_comment', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'delete_comment', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'get_comments', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'assign_issue', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'add_watcher', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'add_attachment', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Fields for search_issues
            jql: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'JQL query string',
                rules: [
                    { operation: 'notEqual', valueA: 'search_issues', valueB: '{{action}}', action: 'hide' },
                ],
            },
            maxResults: {
                type: 'number',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Maximum number of results to return',
                rules: [
                    { operation: 'notEqual', valueA: 'search_issues', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Fields for add_comment, update_comment
            comment: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Comment text',
                rules: [
                    { operation: 'notEqual', valueA: 'add_comment', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'update_comment', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'link_issues', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Fields for update_comment, delete_comment
            commentId: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Comment ID',
                rules: [
                    { operation: 'notEqual', valueA: 'update_comment', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'delete_comment', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Fields for add_watcher
            accountId: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'User account ID',
                rules: [
                    { operation: 'notEqual', valueA: 'add_watcher', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Fields for find_user
            query: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Search query for finding users',
                rules: [
                    { operation: 'notEqual', valueA: 'find_user', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Fields for link_issues
            inwardIssueKey: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Inward issue key',
                rules: [
                    { operation: 'notEqual', valueA: 'link_issues', valueB: '{{action}}', action: 'hide' },
                ],
            },
            outwardIssueKey: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Outward issue key',
                rules: [
                    { operation: 'notEqual', valueA: 'link_issues', valueB: '{{action}}', action: 'hide' },
                ],
            },
            linkTypeId: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Link type ID',
                rules: [
                    { operation: 'notEqual', valueA: 'link_issues', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Fields for add_attachment
            filename: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Filename for the attachment',
                rules: [
                    { operation: 'notEqual', valueA: 'add_attachment', valueB: '{{action}}', action: 'hide' },
                ],
            },
            content: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Content of the attachment',
                rules: [
                    { operation: 'notEqual', valueA: 'add_attachment', valueB: '{{action}}', action: 'hide' },
                ],
            },
        },
        required: ['action', 'instanceUrl', 'email', 'apiToken'],
    },
    outputSchema: {
        type: "object",
    },
    exampleInput: {
        action: 'create_issue',
        instanceUrl: 'https://your-domain.atlassian.net',
        email: 'your-email@example.com',
        apiToken: 'your-api-token',
        projectId: '10000',
        issueTypeId: '10001',
        summary: 'Bug: Application crashes on startup',
        description: 'The application crashes immediately after launching on Windows 10.'
    },
    exampleOutput: {
        "id": "10001",
        "key": "PROJ-123",
        "self": "https://your-domain.atlassian.net/rest/api/3/issue/10001"
    },
    documentation: "https://developer.atlassian.com/cloud/jira/platform/rest/v3/intro/",
    method: "exec",
    actions: [
        {
            name: 'jira-cloud',
            execute: async (input: any, context?: any): Promise<any> => {
                const { action, instanceUrl, email, apiToken } = input;

                if (!action || !instanceUrl || !email || !apiToken) {
                    throw new Error('Missing required parameters: action, instanceUrl, email, apiToken');
                }

                // Create a client instance, using the context's axios instance if provided
                const auth: JiraAuth = {
                    instanceUrl,
                    email,
                    apiToken
                };

                const client = context?.axiosInstance ?
                    new JiraClient(auth, context.axiosInstance) :
                    new JiraClient(auth);

                // Validate the authentication
                const isValid = await client.validateAuth();
                if (!isValid) {
                    throw new Error('Invalid Jira Cloud authentication');
                }

                switch (action) {
                    case 'create_issue': {
                        const { projectId, issueTypeId, summary, description, assignee, priority, parentKey, ...additionalFields } = input;

                        if (!projectId || !issueTypeId || !summary) {
                            throw new Error('Missing required parameters: projectId, issueTypeId, summary');
                        }

                        const issueData: JiraCreateIssueRequest = {
                            projectId,
                            issueTypeId,
                            summary,
                            description,
                            assignee,
                            priority,
                            parentKey,
                            ...additionalFields
                        };

                        return await client.createIssue(issueData);
                    }

                    case 'update_issue': {
                        const { issueIdOrKey, summary, description, assignee, priority, ...additionalFields } = input;

                        if (!issueIdOrKey) {
                            throw new Error('Missing required parameter: issueIdOrKey');
                        }

                        const issueData: JiraUpdateIssueRequest = {
                            summary,
                            description,
                            assignee,
                            priority,
                            ...additionalFields
                        };

                        return await client.updateIssue(issueIdOrKey, issueData);
                    }

                    case 'get_issue': {
                        const { issueIdOrKey } = input;

                        if (!issueIdOrKey) {
                            throw new Error('Missing required parameter: issueIdOrKey');
                        }

                        return await client.getIssue(issueIdOrKey);
                    }

                    case 'search_issues': {
                        const { jql, maxResults } = input;

                        if (!jql) {
                            throw new Error('Missing required parameter: jql');
                        }

                        return await client.searchIssues(jql, maxResults);
                    }

                    case 'add_comment': {
                        const { issueIdOrKey, comment } = input;

                        if (!issueIdOrKey || !comment) {
                            throw new Error('Missing required parameters: issueIdOrKey, comment');
                        }

                        return await client.addComment(issueIdOrKey, comment);
                    }

                    case 'update_comment': {
                        const { issueIdOrKey, commentId, comment } = input;

                        if (!issueIdOrKey || !commentId || !comment) {
                            throw new Error('Missing required parameters: issueIdOrKey, commentId, comment');
                        }

                        return await client.updateComment(issueIdOrKey, commentId, comment);
                    }

                    case 'delete_comment': {
                        const { issueIdOrKey, commentId } = input;

                        if (!issueIdOrKey || !commentId) {
                            throw new Error('Missing required parameters: issueIdOrKey, commentId');
                        }

                        await client.deleteComment(issueIdOrKey, commentId);
                        return { success: true, message: `Comment ${commentId} deleted successfully` };
                    }

                    case 'get_comments': {
                        const { issueIdOrKey } = input;

                        if (!issueIdOrKey) {
                            throw new Error('Missing required parameter: issueIdOrKey');
                        }

                        return await client.getComments(issueIdOrKey);
                    }

                    case 'assign_issue': {
                        const { issueIdOrKey, assignee } = input;

                        if (!issueIdOrKey || !assignee) {
                            throw new Error('Missing required parameters: issueIdOrKey, assignee');
                        }

                        await client.assignIssue(issueIdOrKey, assignee);
                        return { success: true, message: `Issue ${issueIdOrKey} assigned to user ${assignee}` };
                    }

                    case 'add_watcher': {
                        const { issueIdOrKey, accountId } = input;

                        if (!issueIdOrKey || !accountId) {
                            throw new Error('Missing required parameters: issueIdOrKey, accountId');
                        }

                        await client.addWatcher(issueIdOrKey, accountId);
                        return { success: true, message: `User ${accountId} added as watcher to issue ${issueIdOrKey}` };
                    }

                    case 'find_user': {
                        const { query } = input;

                        if (!query) {
                            throw new Error('Missing required parameter: query');
                        }

                        return await client.findUsers(query);
                    }

                    case 'link_issues': {
                        const { inwardIssueKey, outwardIssueKey, linkTypeId, comment } = input;

                        if (!inwardIssueKey || !outwardIssueKey || !linkTypeId) {
                            throw new Error('Missing required parameters: inwardIssueKey, outwardIssueKey, linkTypeId');
                        }

                        await client.linkIssues(inwardIssueKey, outwardIssueKey, linkTypeId, comment);
                        return { success: true, message: `Issues ${inwardIssueKey} and ${outwardIssueKey} linked successfully` };
                    }

                    case 'add_attachment': {
                        const { issueIdOrKey, filename, content } = input;

                        if (!issueIdOrKey || !filename || !content) {
                            throw new Error('Missing required parameters: issueIdOrKey, filename, content');
                        }

                        return await client.addAttachment(issueIdOrKey, filename, content);
                    }

                    default:
                        throw new Error(`Unsupported action: ${action}`);
                }
            }
        }
    ]
};

export { JiraClient };
export default jiraCloudPlugin;
