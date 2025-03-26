import { actions } from './actions/index.js';
import { triggers } from './triggers/index.js';

const freshbooksPlugin = {
    name: "Freshbooks",
    icon: "https://cdn.activepieces.com/pieces/freshbooks.png",
    description: "Cloud-based accounting software for small businesses",
    groups: ["payment"],
    tags: ["payment","finance","money","transaction","billing"],
    version: '1.0.0',
    id: "freshbooks",
    runner: "node",
    type: "node",
    inputSchema: {
        type: "object",
        properties: {
            apiToken: {
                type: "string",
                description: "Freshbooks API Token"
            },
            accountId: {
                type: "string",
                description: "Freshbooks Account ID (Business ID)"
            }
        },
        required: ["apiToken", "accountId"]
    },
    outputSchema: {
        type: "object",
        properties: {
            apiToken: {
                type: "string",
                description: "Freshbooks API Token"
            },
            accountId: {
                type: "string",
                description: "Freshbooks Account ID (Business ID)"
            }
        }
    },
    exampleInput: {
        apiToken: "your-api-token",
        accountId: "your-account-id"
    },
    exampleOutput: {
        apiToken: "your-api-token",
        accountId: "your-account-id"
    },
    documentation: "https://www.freshbooks.com/api/start",
    method: "exec",
    actions: actions,
    triggers: triggers
};

export default freshbooksPlugin;
