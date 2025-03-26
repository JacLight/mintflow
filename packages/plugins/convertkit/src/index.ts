import * as actions from './actions/index.js';

const convertkitPlugin = {
    name: "convertkit",
    icon: "https://app.convertkit.com/favicon.ico",
    description: "Email marketing for creators",
    groups: ["communication"],
    tags: ["email","messaging","communication","notification"],
    version: '1.0.0',
    id: "convertkit",
    runner: "node",
    inputSchema: {
        type: "object",
        properties: {
            apiSecret: {
                type: "string",
                description: "ConvertKit API Secret",
            },
        },
        required: ["apiSecret"],
    },
    outputSchema: {
        type: "object",
    },
    exampleInput: {
        apiSecret: "your-api-secret",
    },
    exampleOutput: {},
    documentation: "https://developers.convertkit.com/",
    method: "exec",
    actions: [
        // Subscriber actions
        actions.getSubscriberByIdAction,
        actions.getSubscriberByEmailAction,
        actions.listSubscribersAction,
        actions.updateSubscriberAction,
        actions.unsubscribeSubscriberAction,
        actions.listTagsBySubscriberIdAction,
        actions.listTagsByEmailAction,

        // Tag actions
        actions.listTagsAction,
        actions.createTagAction,
        actions.tagSubscriberAction,
        actions.removeTagFromSubscriberByEmailAction,
        actions.removeTagFromSubscriberByIdAction,
        actions.listSubscriptionsToTagAction,

        // Form actions
        actions.listFormsAction,
        actions.addSubscriberToFormAction,
        actions.listFormSubscriptionsAction,

        // Sequence actions
        actions.listSequencesAction,
        actions.addSubscriberToSequenceAction,
        actions.listSubscriptionsToSequenceAction,

        // Custom field actions
        actions.listFieldsAction,
        actions.createFieldAction,
        actions.updateFieldAction,
        actions.deleteFieldAction,

        // Webhook actions
        actions.createWebhookAction,
        actions.deleteWebhookAction,
    ]
};

export default convertkitPlugin;
