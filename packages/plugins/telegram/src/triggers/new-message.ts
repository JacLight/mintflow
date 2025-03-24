import axios from 'axios';
import { telegramCommons } from '../common.js';

export const newMessage = {
    name: 'new_message',
    description: 'Triggers when a new message is received in a Telegram chat',
    type: 'webhook',
    inputSchema: {
        type: 'object',
        properties: {
            bot_token: {
                type: 'string',
                description: 'The Telegram Bot Token',
                displayStyle: 'password',
            },
        },
        required: ['bot_token'],
    },
    outputSchema: {
        type: 'object',
        properties: {
            message: {
                type: 'object',
                properties: {
                    message_id: { type: 'number' },
                    from: { type: 'object' },
                    chat: { type: 'object' },
                    date: { type: 'number' },
                    text: { type: 'string' },
                },
            },
            update_id: { type: 'number' },
        },
    },
    exampleOutput: {
        message: {
            chat: {
                id: 123456789,
                type: 'private',
                username: 'johndoe',
                last_name: 'Doe',
                first_name: 'John',
            },
            date: 1613826000,
            from: {
                id: 123456789,
                is_bot: false,
                username: 'johndoe',
                last_name: 'Doe',
                first_name: 'John',
                language_code: 'en',
            },
            text: 'Hello, MintFlow!',
            message_id: 123,
        },
        update_id: 987654321,
    },
    async onEnable(context: any) {
        // When the trigger is enabled, set up a webhook to receive updates
        await telegramCommons.subscribeWebhook(
            context.input.bot_token,
            context.webhookUrl,
            {
                allowed_updates: ['message'],
            }
        );
    },
    async onDisable(context: any) {
        // When the trigger is disabled, remove the webhook
        await telegramCommons.unsubscribeWebhook(context.input.bot_token);
    },
    async run(context: any) {
        // Process the incoming webhook payload
        return [context.payload.body];
    },
    async test(context: any) {
        try {
            // Get the last 5 messages for testing
            const response = await axios.get(
                `https://api.telegram.org/bot${context.input.bot_token}/getUpdates?offset=-5&limit=5`
            );

            if (response.data.ok && response.data.result.length > 0) {
                return response.data.result;
            } else {
                return [{
                    message: {
                        chat: {
                            id: 123456789,
                            type: 'private',
                            username: 'johndoe',
                            first_name: 'John',
                        },
                        date: Math.floor(Date.now() / 1000),
                        from: {
                            id: 123456789,
                            is_bot: false,
                            username: 'johndoe',
                            first_name: 'John',
                        },
                        text: 'This is a test message',
                        message_id: 1,
                    },
                    update_id: 1,
                }];
            }
        } catch (error: unknown) {
            if (axios.isAxiosError(error)) {
                throw new Error(`Telegram API error: ${error.message}`);
            } else if (error instanceof Error) {
                throw new Error(`Unexpected error: ${error.message}`);
            } else {
                throw new Error('Unknown error occurred');
            }
        }
    },
};

export default newMessage;
