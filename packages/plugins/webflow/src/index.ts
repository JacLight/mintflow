import * as actions from './actions/index.js';

const webflowPlugin = {
    name: "webflow",
    icon: "https://cdn.worldvectorlogo.com/logos/webflow.svg",
    description: "Design, build, and launch responsive websites visually",
    groups: ["ecommerce"],
    tags: ["ecommerce","shop","store","product","order"],
    version: '1.0.0',
    id: "webflow",
    runner: "node",
    inputSchema: {
        type: "object",
        properties: {
            accessToken: {
                type: "string",
                description: "Webflow API access token",
            },
        },
        required: ["accessToken"],
    },
    outputSchema: {
        type: "object",
    },
    exampleInput: {
        accessToken: "your-webflow-access-token",
    },
    exampleOutput: {},
    documentation: "https://developers.webflow.com/",
    method: "exec",
    actions: [
        actions.createCollectionItemAction,
        actions.getCollectionItemAction,
        actions.updateCollectionItemAction,
        actions.deleteCollectionItemAction,
    ]
};

export default webflowPlugin;
