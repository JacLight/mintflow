import axios from 'axios';
import { telegramCommons } from '../common.js';

export const sendMessage = {
    name: 'send_message',
    description: 'Send a message through a Telegram bot',
    inputSchema: {
        type: 'object',
        properties: {
            bot_token: {
                type: 'string',
                description: 'The Telegram Bot Token',
                displayStyle: 'password',
            },
            chat_id: {
                type: 'string',
                description: 'The chat ID to send the message to',
            },
            message_thread_id: {
                type: 'string',
                description: 'Unique identifier for the target message thread of the forums; for forums supergroups only',
            },
            format: {
                type: 'string',
                enum: ['MarkdownV2', 'HTML'],
                description: 'The format of the message',
                default: 'MarkdownV2',
            },
            web_page_preview: {
                type: 'boolean',
                description: 'Disable link previews for links in this message',
                default: false,
            },
            message: {
                type: 'string',
                description: 'The message to be sent',
            },
            reply_markup: {
                type: 'object',
                description: 'Additional interface options. A JSON object for an inline keyboard, custom reply keyboard, instructions to remove reply keyboard or to force a reply from the user.',
            },
        },
        required: ['bot_token', 'chat_id', 'message'],
    },
    outputSchema: {
        type: 'object',
        properties: {
            ok: { type: 'boolean' },
            result: { type: 'object' },
        },
    },
    exampleInput: {
        bot_token: '123456789:ABCdefGhIJKlmnOPQRstUVwxYZ',
        chat_id: '123456789',
        message: 'Hello from MintFlow!',
        format: 'MarkdownV2',
    },
    exampleOutput: {
        ok: true,
        result: {
            message_id: 123,
            from: {
                id: 123456789,
                is_bot: true,
                first_name: 'MintFlow Bot',
                username: 'mintflow_bot',
            },
            chat: {
                id: 123456789,
                first_name: 'John',
                last_name: 'Doe',
                username: 'johndoe',
                type: 'private',
            },
            date: 1613826000,
            text: 'Hello from MintFlow!',
        },
    },
    execute: async (input: any, config: any): Promise<any> => {
        try {
            const response = await axios.post(
                telegramCommons.getApiUrl(input.bot_token, 'sendMessage'),
                {
                    chat_id: input.chat_id,
                    text: input.message,
                    message_thread_id: input.message_thread_id || undefined,
                    parse_mode: input.format || 'MarkdownV2',
                    reply_markup: input.reply_markup || undefined,
                    disable_web_page_preview: input.web_page_preview || false,
                },
                {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                }
            );
            return response.data;
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

export default sendMessage;
