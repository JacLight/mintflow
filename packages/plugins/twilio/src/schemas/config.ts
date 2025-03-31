import { z } from 'zod';

export const configSchema = {
    setup: z.object({
        friendlyName: z.string(),
        baseUrl: z.string().url(),
        autoSetup: z.boolean(),
        phoneConfig: z.object({
            areaCode: z.string().length(3).optional(),
            capabilities: z.object({
                voice: z.boolean(),
                sms: z.boolean(),
                mms: z.boolean()
            })
        }).optional()
    }),

    input: {
        type: "object",
        properties: {
            friendlyName: {
                type: "string",
                description: "Name for the Twilio application"
            },
            baseUrl: {
                type: "string",
                format: "uri",
                description: "Base URL for webhooks"
            },
            autoSetup: {
                type: "boolean",
                description: "Automatically configure Twilio resources"
            }
        },
        required: ["friendlyName", "baseUrl"]
    }
};