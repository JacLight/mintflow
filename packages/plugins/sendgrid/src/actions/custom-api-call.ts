import axios from 'axios';
import { sendgridCommon } from '../common/index.js';

export const customApiCall = {
    name: "custom_api_call",
    displayName: "Custom API Call",
    description: "Make a custom API call to SendGrid",
    inputSchema: {
        type: "object",
        properties: {
            method: {
                type: "string",
                description: "HTTP method",
                enum: ["GET", "POST", "PUT", "DELETE", "PATCH"]
            },
            path: {
                type: "string",
                description: "API path (without the base URL)"
            },
            body: {
                type: "object",
                description: "Request body for POST, PUT, and PATCH requests"
            },
            queryParams: {
                type: "object",
                description: "Query parameters"
            }
        },
        required: ["method", "path"]
    },
    outputSchema: {
        type: "object",
        properties: {
            data: {
                type: "object",
                description: "Response data from the API"
            },
            status: {
                type: "number",
                description: "HTTP status code"
            }
        }
    },
    exampleInput: {
        method: "GET",
        path: "/marketing/contacts",
        queryParams: {
            "page_size": 100
        }
    },
    exampleOutput: {
        data: {
            "result": [
                {
                    "id": "00000000-0000-0000-0000-000000000000",
                    "email": "example@example.com",
                    "created_at": "2020-01-01T00:00:00Z",
                    "updated_at": "2020-01-01T00:00:00Z"
                }
            ]
        },
        status: 200
    },
    execute: async (input: any, auth: any) => {
        try {
            const { method, path, body, queryParams } = input.data || {};

            // Validate required fields
            if (!method) {
                return { error: "HTTP method is required" };
            }
            if (!path) {
                return { error: "API path is required" };
            }

            // Normalize path (remove leading slash if present)
            const normalizedPath = path.startsWith('/') ? path.substring(1) : path;

            // Send request to SendGrid API
            const response = await axios({
                method: method,
                url: `${sendgridCommon.baseUrl}/${normalizedPath}`,
                data: body,
                params: queryParams,
                headers: {
                    'Authorization': `Bearer ${auth.apiKey}`,
                    'Content-Type': 'application/json'
                }
            });

            return {
                data: response.data,
                status: response.status
            };
        } catch (error: any) {
            return {
                error: `Error making API call: ${error.message || 'Unknown error'}`,
                details: error.response?.data || {},
                status: error.response?.status
            };
        }
    }
};
