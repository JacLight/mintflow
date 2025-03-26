import { actions } from './actions/index.js';
import { triggers } from './triggers/index.js';

const freshdeskPlugin = {
    name: "Freshdesk",
    icon: "https://cdn.activepieces.com/pieces/freshdesk.png",
    description: "Customer support and helpdesk platform",
    groups: ["crm"],
    tags: ["crm","marketing","customer","lead","sales"],
    version: '1.0.0',
    id: "freshdesk",
    runner: "node",
    type: "node",
    inputSchema: {
        type: "object",
        properties: {
            apiKey: {
                type: "string",
                description: "Freshdesk API Key"
            },
            domain: {
                type: "string",
                description: "Freshdesk Domain (e.g., 'company' for company.freshdesk.com)"
            }
        },
        required: ["apiKey", "domain"]
    },
    outputSchema: {
        type: "object",
        properties: {
            apiKey: {
                type: "string",
                description: "Freshdesk API Key"
            },
            domain: {
                type: "string",
                description: "Freshdesk Domain"
            }
        }
    },
    exampleInput: {
        apiKey: "your-api-key",
        domain: "your-domain"
    },
    exampleOutput: {
        apiKey: "your-api-key",
        domain: "your-domain"
    },
    documentation: "https://developers.freshdesk.com/api/",
    method: "exec",
    actions: actions,
    triggers: triggers
};

export default freshdeskPlugin;
