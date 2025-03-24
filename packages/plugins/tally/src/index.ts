import { triggers } from './triggers/index.js';

const tallyPlugin = {
    name: "Tally",
    icon: "https://cdn.activepieces.com/pieces/tally.png",
    description: "Receive form submissions from Tally forms",
    id: "tally",
    runner: "node",
    type: "node",
    inputSchema: {
        type: "object",
        properties: {},
    },
    outputSchema: {
        type: "object",
        properties: {},
    },
    exampleInput: {},
    exampleOutput: {},
    documentation: "https://tally.so/help/webhooks",
    method: "exec",
    actions: [],
    triggers: triggers
};

export default tallyPlugin;
