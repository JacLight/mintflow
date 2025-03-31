import { ActionDescriptor } from "@mintflow/common";
import axios from 'axios';

export const customApiCall: ActionDescriptor = {
    name: 'custom_api_call',
    description: 'Make a custom API call to the Mattermost API',
    inputSchema: {
        type: 'object',
        properties: {
            workspace_url: {
                type: 'string',
                description: 'The workspace URL of the Mattermost instance (e.g https://activepieces.mattermost.com)',
                required: true,
            },
            token: {
                type: 'string',
                description: 'The bot token to use to authenticate',
                required: true,
            },
            method: {
                type: 'string',
                description: 'HTTP method',
                enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
                required: true,
            },
            path: {
                type: 'string',
                description: 'The API path (e.g. /api/v4/users)',
                required: true,
            },
            body: {
                type: 'object',
                description: 'The request body (for POST, PUT, PATCH requests)',
                required: false,
            },
            queryParams: {
                type: 'object',
                description: 'Query parameters to include in the request',
                required: false,
            },
        },
    },
    outputSchema: {
        type: 'object',
    },
    exampleInput: {
        workspace_url: 'https://example.mattermost.com',
        token: 'your-bot-token',
        method: 'GET',
        path: '/api/v4/users',
        queryParams: {
            per_page: 100,
            page: 0,
        },
    },
    exampleOutput: {
        // Response will vary based on the API endpoint
    },
    method: 'exec',
    execute: async (input: any, config: any): Promise<any> => {
        try {
            // Remove trailing slash from workspace URL and leading slash from path
            const baseUrl = input.workspace_url.replace(/\/$/, '');
            const path = input.path.startsWith('/') ? input.path : `/${input.path}`;
            
            const response = await axios({
                method: input.method,
                url: `${baseUrl}${path}`,
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${input.token}`,
                },
                data: input.body,
                params: input.queryParams,
            });
            
            return response.data;
        } catch (error: any) {
            if (error.response) {
                throw new Error(`Mattermost API error: ${error.response.status} - ${error.response.data?.message || error.response.statusText}`);
            }
            throw new Error(`Failed to make custom API call to Mattermost: ${error.message}`);
        }
    },
};

export default customApiCall;
