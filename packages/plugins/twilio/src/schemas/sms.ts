import { z } from 'zod';

export const smsSchema = {
    message: z.object({
        to: z.string().regex(/^\+[1-9]\d{1,14}$/, 'Invalid phone number format'),
        from: z.string().regex(/^\+[1-9]\d{1,14}$/, 'Invalid phone number format').optional(),
        body: z.string().min(1).max(1600),
        mediaUrl: z.array(z.string().url()).optional(),
        priority: z.enum(['high', 'normal', 'low']).optional(),
        tags: z.array(z.string()).optional()
    }),

    input: {
        type: "object",
        properties: {
            to: {
                type: "string",
                pattern: "^\\+[1-9]\\d{1,14}$",
                description: "Recipient phone number (E.164 format)"
            },
            body: {
                type: "string",
                maxLength: 1600,
                description: "Message content"
            },
            mediaUrl: {
                type: "array",
                items: {
                    type: "string",
                    format: "uri"
                }
            },
            priority: {
                type: "string",
                enum: ["high", "normal", "low"],
                default: "normal"
            }
        },
        required: ["to", "body"]
    }
};


