import * as actions from './actions/index.js';
import { PluginDescriptor } from '@mintflow/common';

const telegramPlugin: PluginDescriptor = {
    name: "Telegram",
    icon: "FaTelegram",
    description: "Integrate with Telegram Bot API to send messages, media, and receive updates",
    id: "telegram",
    runner: "node",
    type: 'node',
    documentation: "https://core.telegram.org/bots/api",
    actions: [
        actions.sendMessage,
        actions.sendMedia,
        actions.createInviteLink,
        actions.getChatMember,
    ]
};

export default telegramPlugin;
