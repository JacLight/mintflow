import { smsActions, voiceActions, configActions } from './actions/index.js';
import { twilioSchemas } from './schemas/index.js';

const twilioPlugin = {
    name: "twilio",
    icon: "phone",
    description: "Complete Twilio integration for SMS and voice calls",
    id: "twilio",
    runner: "node",
    inputSchema: twilioSchemas.inputSchema,
    actions: {
        ...smsActions,
        ...voiceActions,
        ...configActions
    }
};

export default twilioPlugin;
