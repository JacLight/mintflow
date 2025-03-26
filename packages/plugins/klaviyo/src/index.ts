import * as actions from './actions/index.js';

const klaviyoPlugin = {
    name: "klaviyo",
    icon: "https://cdn.klaviyo.com/assets/favicon-32x32.png",
    description: "Email marketing and customer data platform",
    groups: ["crm"],
    tags: ["crm","marketing","customer","lead","sales"],
    version: '1.0.0',
    id: "klaviyo",
    runner: "node",
    inputSchema: {
        type: "object",
        properties: {
            apiKey: {
                type: "string",
                description: "Klaviyo API Key",
            },
        },
        required: ["apiKey"],
    },
    outputSchema: {
        type: "object",
    },
    exampleInput: {
        apiKey: "pk_1234567890",
    },
    exampleOutput: {},
    documentation: "https://developers.klaviyo.com/en/reference/api-overview",
    method: "exec",
    actions: [
        actions.trackEventAction,
        actions.identifyProfileAction,
        actions.getListsAction,
        actions.addProfilesToListAction,
        actions.removeProfileFromListAction,
        actions.getCampaignsAction,
    ]
};

export default klaviyoPlugin;
