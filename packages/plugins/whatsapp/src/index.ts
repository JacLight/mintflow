import { sendMessageAction } from './actions/send-message.js';
import { sendMediaAction } from './actions/send-media.js';
import { sendTemplateAction } from './actions/send-template.js';

const whatsappPlugin = {
    name: "whatsapp",
    icon: "https://cdn.activepieces.com/pieces/whatsapp.png",
    description: "Manage your WhatsApp business account",
    id: "whatsapp",
    runner: "node",
    documentation: "https://developers.facebook.com/docs/whatsapp/cloud-api/overview",
    method: "exec",
    actions: [
        sendMessageAction,
        sendMediaAction,
        sendTemplateAction
    ]
};

export default whatsappPlugin;
