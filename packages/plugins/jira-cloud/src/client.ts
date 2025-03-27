import axios, { AxiosInstance } from 'axios';
import { JiraAuth } from './models.js';
import FormData from 'form-data';

export class JiraClient {
    private axiosInstance: AxiosInstance;
    private baseUrl: string;
    private apiVersion = '3';

    constructor(private auth: JiraAuth, axiosInstance?: AxiosInstance) {
        this.axiosInstance = axiosInstance || axios;
        this.baseUrl = `${auth.instanceUrl}/rest/api/${this.apiVersion}`;
    }

    /**
     * Validate the authentication by fetching the current user
     */
    async validateAuth(): Promise<boolean> {
        try {
            await this.getCurrentUser();
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Get the current user
     */
    async getCurrentUser(): Promise<any> {
        const response = await this.sendRequest({
            method: 'get',
            url: '/myself'
        });
        return response.data;
    }

    /**
     * Get all projects
     */
    async getProjects(): Promise<any[]> {
        const response = await this.sendRequest({
            method: 'get',
            url: '/project/search'
        });
        return response.data.values;
    }

    /**
     * Get issue types for a project
     */
    async getIssueTypes(projectId: string): Promise<any[]> {
        const response = await this.sendRequest({
            method: 'get',
            url: '/issuetype/project',
            params: {
                projectId
            }
        });
        return response.data;
    }

    /**
     * Get priorities
     */
    async getPriorities(): Promise<any[]> {
        const response = await this.sendRequest({
            method: 'get',
            url: '/priority'
        });
        return response.data;
    }

    /**
     * Create a new issue
     */
    async createIssue(data: {
        projectId: string;
        issueTypeId: string;
        summary: string;
        description?: string;
        assignee?: string;
        priority?: string;
        parentKey?: string;
        [key: string]: any;
    }): Promise<any> {
        const fields: any = {
            project: {
                id: data.projectId
            },
            summary: data.summary,
            issuetype: {
                id: data.issueTypeId
            }
        };

        if (data.assignee) fields.assignee = { id: data.assignee };
        if (data.priority) fields.priority = { id: data.priority };
        if (data.description) {
            fields.description = {
                content: [
                    {
                        content: [
                            {
                                text: data.description,
                                type: 'text'
                            }
                        ],
                        type: 'paragraph'
                    }
                ],
                type: 'doc',
                version: 1
            };
        }

        if (data.parentKey) {
            fields.parent = { key: data.parentKey };
        }

        // Add any additional fields
        Object.keys(data).forEach(key => {
            if (!['projectId', 'issueTypeId', 'summary', 'description', 'assignee', 'priority', 'parentKey'].includes(key)) {
                fields[key] = data[key];
            }
        });

        const response = await this.sendRequest({
            method: 'post',
            url: '/issue',
            data: {
                fields
            }
        });

        return response.data;
    }

    /**
     * Update an issue
     */
    async updateIssue(issueIdOrKey: string, data: {
        summary?: string;
        description?: string;
        assignee?: string;
        priority?: string;
        [key: string]: any;
    }): Promise<any> {
        const fields: any = {};

        if (data.summary) fields.summary = data.summary;
        if (data.assignee) fields.assignee = { id: data.assignee };
        if (data.priority) fields.priority = { id: data.priority };
        if (data.description) {
            fields.description = {
                content: [
                    {
                        content: [
                            {
                                text: data.description,
                                type: 'text'
                            }
                        ],
                        type: 'paragraph'
                    }
                ],
                type: 'doc',
                version: 1
            };
        }

        // Add any additional fields
        Object.keys(data).forEach(key => {
            if (!['summary', 'description', 'assignee', 'priority'].includes(key)) {
                fields[key] = data[key];
            }
        });

        const response = await this.sendRequest({
            method: 'put',
            url: `/issue/${issueIdOrKey}`,
            data: {
                fields
            }
        });

        return response.data;
    }

    /**
     * Get an issue
     */
    async getIssue(issueIdOrKey: string): Promise<any> {
        const response = await this.sendRequest({
            method: 'get',
            url: `/issue/${issueIdOrKey}`
        });
        return response.data;
    }

    /**
     * Search issues
     */
    async searchIssues(jql: string, maxResults: number = 50): Promise<any[]> {
        const response = await this.sendRequest({
            method: 'post',
            url: '/search',
            data: {
                jql,
                maxResults
            }
        });
        return response.data.issues;
    }

    /**
     * Add a comment to an issue
     */
    async addComment(issueIdOrKey: string, comment: string): Promise<any> {
        const response = await this.sendRequest({
            method: 'post',
            url: `/issue/${issueIdOrKey}/comment`,
            data: {
                body: {
                    content: [
                        {
                            content: [
                                {
                                    text: comment,
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
        return response.data;
    }

    /**
     * Get comments for an issue
     */
    async getComments(issueIdOrKey: string): Promise<any[]> {
        const response = await this.sendRequest({
            method: 'get',
            url: `/issue/${issueIdOrKey}/comment`
        });
        return response.data.comments;
    }

    /**
     * Update a comment
     */
    async updateComment(issueIdOrKey: string, commentId: string, comment: string): Promise<any> {
        const response = await this.sendRequest({
            method: 'put',
            url: `/issue/${issueIdOrKey}/comment/${commentId}`,
            data: {
                body: {
                    content: [
                        {
                            content: [
                                {
                                    text: comment,
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
        return response.data;
    }

    /**
     * Delete a comment
     */
    async deleteComment(issueIdOrKey: string, commentId: string): Promise<void> {
        await this.sendRequest({
            method: 'delete',
            url: `/issue/${issueIdOrKey}/comment/${commentId}`
        });
    }

    /**
     * Assign an issue to a user
     */
    async assignIssue(issueIdOrKey: string, accountId: string): Promise<void> {
        await this.sendRequest({
            method: 'put',
            url: `/issue/${issueIdOrKey}/assignee`,
            data: {
                accountId
            }
        });
    }

    /**
     * Add a watcher to an issue
     */
    async addWatcher(issueIdOrKey: string, accountId: string): Promise<void> {
        await this.sendRequest({
            method: 'post',
            url: `/issue/${issueIdOrKey}/watchers`,
            data: accountId
        });
    }

    /**
     * Find users
     */
    async findUsers(query: string): Promise<any[]> {
        const response = await this.sendRequest({
            method: 'get',
            url: '/user/search',
            params: {
                query
            }
        });
        return response.data;
    }

    /**
     * Link issues
     */
    async linkIssues(inwardIssueKey: string, outwardIssueKey: string, linkTypeId: string, comment?: string): Promise<void> {
        const data: any = {
            inwardIssue: {
                key: inwardIssueKey
            },
            outwardIssue: {
                key: outwardIssueKey
            },
            type: {
                id: linkTypeId
            }
        };

        if (comment) {
            data.comment = {
                body: {
                    content: [
                        {
                            content: [
                                {
                                    text: comment,
                                    type: 'text'
                                }
                            ],
                            type: 'paragraph'
                        }
                    ],
                    type: 'doc',
                    version: 1
                }
            };
        }

        await this.sendRequest({
            method: 'post',
            url: '/issueLink',
            data
        });
    }

    /**
     * Add attachment to an issue
     */
    async addAttachment(issueIdOrKey: string, filename: string, content: string): Promise<any> {
        const formData = new FormData();
        const buffer = Buffer.from(content);
        formData.append('file', buffer, { filename });

        const response = await this.sendRequest({
            method: 'post',
            url: `/issue/${issueIdOrKey}/attachments`,
            headers: {
                'X-Atlassian-Token': 'no-check',
                'Content-Type': 'multipart/form-data'
            },
            data: formData
        });

        return response.data;
    }

    /**
     * Send a request to the Jira API
     */
    private async sendRequest(config: any): Promise<any> {
        const headers = {
            'Authorization': `Basic ${Buffer.from(`${this.auth.email}:${this.auth.apiToken}`).toString('base64')}`,
            'Content-Type': 'application/json'
        };

        return this.axiosInstance({
            ...config,
            url: `${this.baseUrl}${config.url}`,
            headers: {
                ...headers,
                ...config.headers
            }
        });
    }
}
