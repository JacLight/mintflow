import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { CLICKUP_API_URL } from './constants.js';
import {
    ClickupApiResponse,
    ClickupComment,
    ClickupCustomField,
    ClickupFolder,
    ClickupList,
    ClickupSpace,
    ClickupTask,
    ClickupTaskTemplate,
    ClickupWorkspace
} from './types.js';

export class ClickupClient {
    private axiosInstance: AxiosInstance;

    constructor(private apiKey: string) {
        this.axiosInstance = axios.create({
            baseURL: CLICKUP_API_URL,
            headers: {
                'Authorization': apiKey,
                'Content-Type': 'application/json'
            }
        });
    }

    /**
     * Make a request to the ClickUp API
     * @param method HTTP method
     * @param endpoint API endpoint
     * @param data Request data
     * @param params Query parameters
     * @returns Promise with the API response
     */
    private async makeRequest<T>(
        method: string,
        endpoint: string,
        data?: any,
        params?: Record<string, any>
    ): Promise<ClickupApiResponse<T>> {
        try {
            const config: AxiosRequestConfig = {
                method,
                url: endpoint,
                params
            };

            if (data) {
                config.data = data;
            }

            const response = await this.axiosInstance(config);
            return { data: response.data };
        } catch (error: any) {
            if (axios.isAxiosError(error)) {
                return {
                    error: error.response?.data?.err || error.message
                };
            }
            return { error: 'Unknown error occurred' };
        }
    }

    // Workspace endpoints
    async getWorkspaces(): Promise<ClickupApiResponse<{ teams: ClickupWorkspace[] }>> {
        return this.makeRequest<{ teams: ClickupWorkspace[] }>('GET', '/team');
    }

    // Space endpoints
    async getSpaces(workspaceId: string): Promise<ClickupApiResponse<{ spaces: ClickupSpace[] }>> {
        return this.makeRequest<{ spaces: ClickupSpace[] }>('GET', `/team/${workspaceId}/space`);
    }

    async getSpace(spaceId: string): Promise<ClickupApiResponse<ClickupSpace>> {
        return this.makeRequest<ClickupSpace>('GET', `/space/${spaceId}`);
    }

    // Folder endpoints
    async getFolders(spaceId: string): Promise<ClickupApiResponse<{ folders: ClickupFolder[] }>> {
        return this.makeRequest<{ folders: ClickupFolder[] }>('GET', `/space/${spaceId}/folder`);
    }

    // List endpoints
    async getFolderlessLists(spaceId: string): Promise<ClickupApiResponse<{ lists: ClickupList[] }>> {
        return this.makeRequest<{ lists: ClickupList[] }>('GET', `/space/${spaceId}/list`);
    }

    async getLists(folderId: string): Promise<ClickupApiResponse<{ lists: ClickupList[] }>> {
        return this.makeRequest<{ lists: ClickupList[] }>('GET', `/folder/${folderId}/list`);
    }

    async getList(listId: string): Promise<ClickupApiResponse<ClickupList>> {
        return this.makeRequest<ClickupList>('GET', `/list/${listId}`);
    }

    async createFolderlessList(spaceId: string, data: { name: string; content?: string }): Promise<ClickupApiResponse<ClickupList>> {
        return this.makeRequest<ClickupList>('POST', `/space/${spaceId}/list`, data);
    }

    // Task endpoints
    async getTasks(listId: string, params?: Record<string, any>): Promise<ClickupApiResponse<{ tasks: ClickupTask[] }>> {
        return this.makeRequest<{ tasks: ClickupTask[] }>('GET', `/list/${listId}/task`, undefined, params);
    }

    async getTask(taskId: string): Promise<ClickupApiResponse<ClickupTask>> {
        return this.makeRequest<ClickupTask>('GET', `/task/${taskId}`);
    }

    async createTask(listId: string, data: {
        name: string;
        description?: string;
        markdown_description?: string;
        assignees?: number[];
        tags?: string[];
        status?: string;
        priority?: number;
        due_date?: number;
        due_date_time?: boolean;
        time_estimate?: number;
        start_date?: number;
        start_date_time?: boolean;
        notify_all?: boolean;
        parent?: string;
        links_to?: string;
        custom_fields?: Record<string, any>[];
    }): Promise<ClickupApiResponse<ClickupTask>> {
        return this.makeRequest<ClickupTask>('POST', `/list/${listId}/task`, data);
    }

    async updateTask(taskId: string, data: {
        name?: string;
        description?: string;
        markdown_description?: string;
        assignees?: number[];
        status?: string;
        priority?: number;
        due_date?: number;
        due_date_time?: boolean;
        time_estimate?: number;
        start_date?: number;
        start_date_time?: boolean;
        notify_all?: boolean;
        parent?: string;
        links_to?: string;
        custom_fields?: Record<string, any>[];
    }): Promise<ClickupApiResponse<ClickupTask>> {
        return this.makeRequest<ClickupTask>('PUT', `/task/${taskId}`, data);
    }

    async deleteTask(taskId: string): Promise<ClickupApiResponse<{ success: boolean }>> {
        return this.makeRequest<{ success: boolean }>('DELETE', `/task/${taskId}`);
    }

    async createSubtask(parentTaskId: string, data: {
        name: string;
        description?: string;
        markdown_description?: string;
        assignees?: number[];
        tags?: string[];
        status?: string;
        priority?: number;
        due_date?: number;
        due_date_time?: boolean;
        time_estimate?: number;
        start_date?: number;
        start_date_time?: boolean;
        notify_all?: boolean;
        links_to?: string;
        custom_fields?: Record<string, any>[];
    }): Promise<ClickupApiResponse<ClickupTask>> {
        return this.makeRequest<ClickupTask>('POST', `/task/${parentTaskId}/subtask`, data);
    }

    // Comment endpoints
    async getTaskComments(taskId: string): Promise<ClickupApiResponse<{ comments: ClickupComment[] }>> {
        return this.makeRequest<{ comments: ClickupComment[] }>('GET', `/task/${taskId}/comment`);
    }

    async createTaskComment(taskId: string, data: { comment_text: string; assignee?: number; notify_all?: boolean }): Promise<ClickupApiResponse<ClickupComment>> {
        return this.makeRequest<ClickupComment>('POST', `/task/${taskId}/comment`, data);
    }

    // Custom field endpoints
    async getAccessibleCustomFields(listId: string): Promise<ClickupApiResponse<{ fields: ClickupCustomField[] }>> {
        return this.makeRequest<{ fields: ClickupCustomField[] }>('GET', `/list/${listId}/field`);
    }

    async setCustomFieldValue(taskId: string, fieldId: string, value: any): Promise<ClickupApiResponse<{ success: boolean }>> {
        return this.makeRequest<{ success: boolean }>('POST', `/task/${taskId}/field/${fieldId}`, { value });
    }

    // Template endpoints
    async getWorkspaceTemplates(workspaceId: string): Promise<ClickupApiResponse<{ templates: ClickupTaskTemplate[] }>> {
        return this.makeRequest<{ templates: ClickupTaskTemplate[] }>('GET', `/team/${workspaceId}/taskTemplate`);
    }

    async createTaskFromTemplate(listId: string, templateId: string, data?: {
        name?: string;
        custom_fields?: Record<string, any>[];
    }): Promise<ClickupApiResponse<ClickupTask>> {
        return this.makeRequest<ClickupTask>('POST', `/list/${listId}/taskTemplate/${templateId}`, data);
    }

    // Time tracking endpoints
    async getWorkspaceTimeEntries(workspaceId: string, params?: {
        start_date?: number;
        end_date?: number;
        assignee?: number;
        include_task_tags?: boolean;
        include_location_names?: boolean;
        space_id?: string;
        folder_id?: string;
        list_id?: string;
        task_id?: string;
        custom_task_ids?: boolean;
    }): Promise<ClickupApiResponse<{ data: any[] }>> {
        return this.makeRequest<{ data: any[] }>('GET', `/team/${workspaceId}/time_entries`, undefined, params);
    }
}
