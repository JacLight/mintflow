import { actions } from './actions/index.js';

const perplexityAiPlugin = {
    name: "Perplexity AI",
    icon: "https://cdn.activepieces.com/pieces/perplexity-ai.png",
    description: "AI powered search engine",
    groups: ["ai"],
    tags: ["ai","nlp","ml","gpt","chatbot","image","text","embedding"],
    version: '1.0.0',
    id: "perplexity-ai",
    runner: "node",
    type: "node",
    inputSchema: {
        type: "object",
        properties: {
            apiKey: {
                type: "string",
                description: "Perplexity AI API Key"
            }
        },
        required: ["apiKey"]
    },
    outputSchema: {
        type: "object",
        properties: {
            apiKey: {
                type: "string",
                description: "Perplexity AI API Key"
            }
        }
    },
    exampleInput: {
        apiKey: "your-api-key"
    },
    exampleOutput: {
        apiKey: "your-api-key"
    },
    documentation: "https://docs.perplexity.ai/",
    method: "exec",
    actions: actions,
    triggers: []
};

export default perplexityAiPlugin;
