import { actions } from './actions/index.js';
import { triggers } from './triggers/index.js';

const invoiceninjaPlugin = {
    name: "InvoiceNinja",
    icon: "https://cdn.activepieces.com/pieces/invoiceninja.png",
    description: "Open-source invoicing, billing, and accounting platform",
    id: "invoiceninja",
    runner: "node",
    type: "node",
    inputSchema: {
        type: "object",
        properties: {
            apiToken: {
                type: "string",
                description: "InvoiceNinja API Token"
            },
            baseUrl: {
                type: "string",
                description: "InvoiceNinja Base URL (e.g., https://your-instance.invoiceninja.com or http://localhost:8000 for self-hosted)"
            }
        },
        required: ["apiToken", "baseUrl"]
    },
    outputSchema: {
        type: "object",
        properties: {
            apiToken: {
                type: "string",
                description: "InvoiceNinja API Token"
            },
            baseUrl: {
                type: "string",
                description: "InvoiceNinja Base URL"
            }
        }
    },
    exampleInput: {
        apiToken: "your-api-token",
        baseUrl: "https://your-instance.invoiceninja.com"
    },
    exampleOutput: {
        apiToken: "your-api-token",
        baseUrl: "https://your-instance.invoiceninja.com"
    },
    documentation: "https://invoice-ninja.readthedocs.io/en/latest/api.html",
    method: "exec",
    actions: actions,
    triggers: triggers
};

export default invoiceninjaPlugin;
