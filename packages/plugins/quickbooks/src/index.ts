import { actions } from './actions/index.js';
import { triggers } from './triggers/index.js';

const quickbooksPlugin = {
    name: "QuickBooks",
    icon: "https://cdn.activepieces.com/pieces/quickbooks.png",
    description: "Accounting software for small and medium-sized businesses",
    groups: ["payment"],
    tags: ["payment","finance","money","transaction","billing"],
    version: '1.0.0',
    id: "quickbooks",
    runner: "node",
    type: "node",
    inputSchema: {
        type: "object",
        properties: {
            clientId: {
                type: "string",
                description: "QuickBooks API Client ID"
            },
            clientSecret: {
                type: "string",
                description: "QuickBooks API Client Secret"
            },
            refreshToken: {
                type: "string",
                description: "QuickBooks API Refresh Token"
            },
            realmId: {
                type: "string",
                description: "QuickBooks Company ID (Realm ID)"
            },
            environment: {
                type: "string",
                description: "QuickBooks Environment (sandbox or production)",
                enum: ["sandbox", "production"],
                default: "production"
            }
        },
        required: ["clientId", "clientSecret", "refreshToken", "realmId"]
    },
    outputSchema: {
        type: "object",
        properties: {
            clientId: {
                type: "string",
                description: "QuickBooks API Client ID"
            },
            clientSecret: {
                type: "string",
                description: "QuickBooks API Client Secret"
            },
            refreshToken: {
                type: "string",
                description: "QuickBooks API Refresh Token"
            },
            realmId: {
                type: "string",
                description: "QuickBooks Company ID (Realm ID)"
            },
            environment: {
                type: "string",
                description: "QuickBooks Environment (sandbox or production)"
            }
        }
    },
    exampleInput: {
        clientId: "your-client-id",
        clientSecret: "your-client-secret",
        refreshToken: "your-refresh-token",
        realmId: "your-realm-id",
        environment: "production"
    },
    exampleOutput: {
        clientId: "your-client-id",
        clientSecret: "your-client-secret",
        refreshToken: "your-refresh-token",
        realmId: "your-realm-id",
        environment: "production"
    },
    documentation: "https://developer.intuit.com/app/developer/qbo/docs/get-started",
    method: "exec",
    actions: actions,
    triggers: triggers
};

export default quickbooksPlugin;
