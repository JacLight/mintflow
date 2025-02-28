import axios from 'axios';
import { telegramCommons } from '../common.js';

export const getChatMember = {
    name: 'get_chat_member',
    description: 'Get information about a member of a chat',
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
                description: 'The chat ID to get member information from',
            },
            user_id: {
                type: 'string',
                description: 'Unique identifier of the target user',
            },
        },
        required: ['bot_token', 'chat_id', 'user_id'],
    },
    outputSchema: {
        type: 'object',
        properties: {
            ok: { type: 'boolean' },
            result: {
                type: 'object',
                properties: {
                    status: { type: 'string' },
                    user: { type: 'object' },
                    is_anonymous: { type: 'boolean' },
                    custom_title: { type: 'string' },
                    can_be_edited: { type: 'boolean' },
                    can_manage_chat: { type: 'boolean' },
                    can_change_info: { type: 'boolean' },
                    can_delete_messages: { type: 'boolean' },
                    can_invite_users: { type: 'boolean' },
                    can_restrict_members: { type: 'boolean' },
                    can_pin_messages: { type: 'boolean' },
                    can_promote_members: { type: 'boolean' },
                    can_manage_voice_chats: { type: 'boolean' },
                    is_member: { type: 'boolean' },
                    can_send_messages: { type: 'boolean' },
                    can_send_media_messages: { type: 'boolean' },
                    can_send_polls: { type: 'boolean' },
                    can_send_other_messages: { type: 'boolean' },
                    can_add_web_page_previews: { type: 'boolean' },
                    until_date: { type: 'number' },
                }
            },
        },
    },
    exampleInput: {
        bot_token: '123456789:ABCdefGhIJKlmnOPQRstUVwxYZ',
        chat_id: '-100123456789',
        user_id: '987654321',
    },
    exampleOutput: {
        ok: true,
        result: {
            status: 'administrator',
            user: {
                id: 987654321,
                is_bot: false,
                first_name: 'John',
                last_name: 'Doe',
                username: 'johndoe',
                language_code: 'en',
            },
            is_anonymous: false,
            can_be_edited: false,
            can_manage_chat: true,
            can_change_info: true,
            can_delete_messages: true,
            can_invite_users: true,
            can_restrict_members: true,
            can_pin_messages: true,
            can_promote_members: false,
            can_manage_voice_chats: true,
        },
    },
    execute: async (input: any, config: any): Promise<any> => {
        try {
            const response = await axios.post(
                telegramCommons.getApiUrl(input.bot_token, 'getChatMember'),
                {
                    chat_id: input.chat_id,
                    user_id: input.user_id,
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
                // If the user is not a member of the chat, return a structured response
                if (error.response?.status === 400 && error.response?.data?.description?.includes('not found')) {
                    return {
                        ok: false,
                        error_code: 400,
                        description: 'User not found in chat',
                    };
                }
                throw new Error(`Telegram API error: ${error.message}`);
            } else if (error instanceof Error) {
                throw new Error(`Unexpected error: ${error.message}`);
            } else {
                throw new Error('Unknown error occurred');
            }
        }
    },
};

export default getChatMember;
