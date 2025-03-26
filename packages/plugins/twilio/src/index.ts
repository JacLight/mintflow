import { smsActions, voiceActions, configActions } from './actions/index.js';
import { twilioSchemas } from './schemas/index.js';

const twilioPlugin = {
    name: "twilio",
    icon: "phone",
    description: "Complete Twilio integration for SMS and voice calls",
    groups: ["communication"],
    tags: ["communication","messaging","chat","notification","alert"],
    version: '1.0.0',
    id: "twilio",
    runner: "node",
    inputSchema: twilioSchemas.inputSchema,
    actions: [
        ...smsActions,
        ...voiceActions,
        ...configActions
    ]
};

export default twilioPlugin;
