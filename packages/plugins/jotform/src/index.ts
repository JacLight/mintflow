import { actions } from './actions/index.js';
import { triggers } from './triggers/index.js';
import { JotformAuth } from './utils/index.js';

const jotformPlugin = {
    name: "JotForm",
    icon: "https://cdn.activepieces.com/pieces/jotform.svg",
    description: "Create online forms and surveys",
    id: "jotform",
    runner: "node",
    type: "node",
    inputSchema: {
        type: "object",
        properties: {
            apiKey: {
                type: "string",
                description: "JotForm API Key"
            },
            region: {
                type: "string",
                description: "JotForm Region",
                enum: ["us", "eu", "hipaa"],
                default: "us"
            }
        },
        required: ["apiKey", "region"]
    },
    outputSchema: {
        type: "object",
        properties: {
            apiKey: {
                type: "string",
                description: "JotForm API Key"
            },
            region: {
                type: "string",
                description: "JotForm Region"
            }
        }
    },
    exampleInput: {
        apiKey: "your-api-key",
        region: "us"
    },
    exampleOutput: {
        apiKey: "your-api-key",
        region: "us"
    },
    documentation: "https://api.jotform.com/docs/",
    method: "exec",
    actions: actions,
    triggers: triggers
};

export default jotformPlugin;
