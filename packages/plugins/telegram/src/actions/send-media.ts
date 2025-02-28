import axios from 'axios';
import FormData from 'form-data';
import { telegramCommons } from '../common.js';

export const sendMedia = {
    name: 'send_media',
    description: 'Send a media message through a Telegram bot',
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
            media_type: {
                type: 'string',
                enum: ['photo', 'video', 'sticker', 'animation'],
                description: 'The type of media to send',
            },
            media_url: {
                type: 'string',
                description: 'URL of the media to send',
            },
            media_id: {
                type: 'string',
                description: 'File ID of previously uploaded media',
            },
            format: {
                type: 'string',
                enum: ['MarkdownV2', 'HTML'],
                description: 'The format of the caption',
                default: 'MarkdownV2',
            },
            caption: {
                type: 'string',
                description: 'Caption for the media',
            },
            reply_markup: {
                type: 'object',
                description: 'Additional interface options. A JSON object for an inline keyboard, custom reply keyboard, instructions to remove reply keyboard or to force a reply from the user.',
            },
        },
        required: ['bot_token', 'chat_id', 'media_type'],
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
        media_type: 'photo',
        media_url: 'https://example.com/image.jpg',
        caption: 'Check out this image!',
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
            photo: [
                {
                    file_id: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
                    file_unique_id: '123456789',
                    file_size: 1234,
                    width: 100,
                    height: 100,
                },
                {
                    file_id: 'ZYXWVUTSRQPONMLKJIHGFEDCBA',
                    file_unique_id: '987654321',
                    file_size: 5678,
                    width: 800,
                    height: 600,
                },
            ],
            caption: 'Check out this image!',
        },
    },
    execute: async (input: any, config: any): Promise<any> => {
        try {
            const mediaType = input.media_type;
            const methods: Record<string, string> = {
                photo: 'sendPhoto',
                video: 'sendVideo',
                sticker: 'sendSticker',
                animation: 'sendAnimation',
            };

            const mediaMethod = methods[mediaType];
            if (!mediaMethod) {
                throw new Error(`Unsupported media type: ${mediaType}`);
            }

            // If media_url is provided, send it as a URL
            if (input.media_url) {
                const response = await axios.post(
                    telegramCommons.getApiUrl(input.bot_token, mediaMethod),
                    {
                        chat_id: input.chat_id,
                        [mediaType]: input.media_url,
                        caption: input.caption,
                        message_thread_id: input.message_thread_id || undefined,
                        parse_mode: input.format || 'MarkdownV2',
                        reply_markup: input.reply_markup || undefined,
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    }
                );
                return response.data;
            }
            // If media_id is provided, send it as a file ID
            else if (input.media_id) {
                const response = await axios.post(
                    telegramCommons.getApiUrl(input.bot_token, mediaMethod),
                    {
                        chat_id: input.chat_id,
                        [mediaType]: input.media_id,
                        caption: input.caption,
                        message_thread_id: input.message_thread_id || undefined,
                        parse_mode: input.format || 'MarkdownV2',
                        reply_markup: input.reply_markup || undefined,
                    },
                    {
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    }
                );
                return response.data;
            }
            // If neither media_url nor media_id is provided, throw an error
            else {
                throw new Error('Either media_url or media_id must be provided');
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

export default sendMedia;
