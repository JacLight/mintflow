import { actions } from './actions/index.js';

const groqPlugin = {
    name: "Groq",
    icon: "https://cdn.activepieces.com/pieces/groq.png",
    description: "Use Groq's fast language models and audio processing capabilities.",
    id: "groq",
    runner: "node",
    type: "node",
    inputSchema: {
        type: "object",
        properties: {
            apiKey: {
                type: "string",
                description: "Groq API Key"
            }
        },
        required: ["apiKey"]
    },
    outputSchema: {
        type: "object",
        properties: {
            apiKey: {
                type: "string",
                description: "Groq API Key"
            }
        }
    },
    exampleInput: {
        apiKey: "your-api-key"
    },
    exampleOutput: {
        apiKey: "your-api-key"
    },
    documentation: "https://console.groq.com/docs/quickstart",
    method: "exec",
    actions: actions,
    triggers: []
};

export default groqPlugin;
