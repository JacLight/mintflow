import { smsSchema } from './sms.js';
import { voiceSchema } from './voice.js';
import { configSchema } from './config.js';

export const twilioSchemas = {
    sms: smsSchema,
    voice: voiceSchema,
    config: configSchema,

    // Combined input schema for the plugin
    inputSchema: {
        type: "object",
        properties: {
            action: {
                type: "string",
                enum: ["sendSms", "makeCall", "setup"]
            },
            ...smsSchema.input.properties,
            ...voiceSchema.input.properties,
            ...configSchema.input.properties
        },
        required: ["action"]
    }
};

export default twilioSchemas;