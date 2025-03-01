import * as actions from './actions/index.js';

const clickupPlugin = {
    name: "clickup",
    icon: "https://app.clickup.com/favicon.ico",
    description: "All-in-one productivity platform for tasks, docs, goals, and projects",
    id: "clickup",
    runner: "node",
    inputSchema: {
        type: "object",
        properties: {
            apiKey: {
                type: "string",
                description: "ClickUp API Key",
            },
        },
        required: ["apiKey"],
    },
    outputSchema: {
        type: "object",
    },
    exampleInput: {
        apiKey: "pk_12345678_ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    },
    exampleOutput: {},
    documentation: "https://clickup.com/api",
    method: "exec",
    actions: [
        actions.createTaskAction,
        actions.getTaskAction,
        actions.updateTaskAction,
        actions.deleteTaskAction,
    ]
};

export default clickupPlugin;
