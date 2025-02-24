import { z } from 'zod';

export const voiceSchema = {
    call: z.object({
        to: z.string().regex(/^\+[1-9]\d{1,14}$/, 'Invalid phone number format'),
        from: z.string().regex(/^\+[1-9]\d{1,14}$/, 'Invalid phone number format').optional(),
        twiml: z.string().optional(),
        record: z.boolean().optional(),
        timeout: z.number().min(5).max(600).optional(),
        machineDetection: z.enum(['Enable', 'DetectMessageEnd']).optional(),
        statusCallback: z.string().url().optional()
    }),

    input: {
        type: "object",
        properties: {
            to: {
                type: "string",
                pattern: "^\\+[1-9]\\d{1,14}$",
                description: "Recipient phone number"
            },
            record: {
                type: "boolean",
                description: "Enable call recording"
            },
            timeout: {
                type: "number",
                minimum: 5,
                maximum: 600,
                description: "Call timeout in seconds"
            }
        },
        required: ["to"]
    }
};
