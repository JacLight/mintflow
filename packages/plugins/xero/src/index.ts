import { actions } from './actions/index.js';
import { triggers } from './triggers/index.js';

const xeroPlugin = {
    name: "Xero",
    icon: "https://cdn.activepieces.com/pieces/xero.png",
    description: "Cloud-based accounting software for small and medium-sized businesses",
    groups: ["payment"],
    tags: ["payment","finance","money","transaction","billing"],
    version: '1.0.0',
    id: "xero",
    runner: "node",
    type: "node",
    inputSchema: {
        type: "object",
        properties: {
            clientId: {
                type: "string",
                description: "Xero API Client ID"
            },
            clientSecret: {
                type: "string",
                description: "Xero API Client Secret"
            },
            refreshToken: {
                type: "string",
                description: "Xero API Refresh Token"
            },
            tenantId: {
                type: "string",
                description: "Xero Tenant ID (Organization ID)"
            }
        },
        required: ["clientId", "clientSecret", "refreshToken", "tenantId"]
    },
    outputSchema: {
        type: "object",
        properties: {
            clientId: {
                type: "string",
                description: "Xero API Client ID"
            },
            clientSecret: {
                type: "string",
                description: "Xero API Client Secret"
            },
            refreshToken: {
                type: "string",
                description: "Xero API Refresh Token"
            },
            tenantId: {
                type: "string",
                description: "Xero Tenant ID (Organization ID)"
            }
        }
    },
    exampleInput: {
        clientId: "your-client-id",
        clientSecret: "your-client-secret",
        refreshToken: "your-refresh-token",
        tenantId: "your-tenant-id"
    },
    exampleOutput: {
        clientId: "your-client-id",
        clientSecret: "your-client-secret",
        refreshToken: "your-refresh-token",
        tenantId: "your-tenant-id"
    },
    documentation: "https://developer.xero.com/documentation/",
    method: "exec",
    actions: actions,
    triggers: triggers
};

export default xeroPlugin;
