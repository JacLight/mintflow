import { sendEmail } from './actions/send-email.js';
import { sendDynamicTemplate } from './actions/send-dynamic-template.js';
import { customApiCall } from './actions/custom-api-call.js';

export const sendgridAuth = {
    apiKey: {
        type: "string",
        displayName: "API Key",
        required: true,
        description: "API key acquired from your SendGrid settings"
    }
};

const sendgridPlugin = {
    name: "sendgrid",
    displayName: "SendGrid",
    description: "Email delivery service for sending transactional and marketing emails",
    icon: "https://cdn.activepieces.com/pieces/sendgrid.png",
    id: "sendgrid",
    runner: "node",
    auth: sendgridAuth,
    actions: [
        sendEmail,
        sendDynamicTemplate,
        customApiCall
    ],
    triggers: []
};

export default sendgridPlugin;
