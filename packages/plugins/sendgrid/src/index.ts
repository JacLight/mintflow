import * as actions from './actions/index.js';

const sendgridPlugin = {
    name: "sendgrid",
    icon: "https://sendgrid.com/favicon.ico",
    description: "Email delivery service for sending transactional and marketing emails",
    groups: ["communication"],
    tags: ["email","messaging","communication","notification"],
    version: '1.0.0',
    id: "sendgrid",
    runner: "node",
    inputSchema: {
        type: "object",
        properties: {
            apiKey: {
                type: "string",
                description: "SendGrid API Key",
            },
        },
        required: ["apiKey"],
    },
    outputSchema: {
        type: "object",
    },
    exampleInput: {
        apiKey: "SG.your-api-key",
    },
    exampleOutput: {},
    documentation: "https://docs.sendgrid.com/api-reference/how-to-use-the-sendgrid-v3-api",
    method: "exec",
    actions: [
        actions.sendEmailAction,
        actions.sendDynamicTemplateAction,
    ]
};

export default sendgridPlugin;
