import axios from 'axios';
import { telegramCommons } from '../common.js';

export const createInviteLink = {
    name: 'create_invite_link',
    description: 'Create an invite link for a chat',
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
                description: 'The chat ID to create an invite link for',
            },
            name: {
                type: 'string',
                description: 'Name of the invite link (max 32 chars)',
            },
            expire_date: {
                type: 'string',
                format: 'date-time',
                description: 'Point in time when the link will expire',
            },
            member_limit: {
                type: 'number',
                description: 'Maximum number of users that can be members of the chat simultaneously after joining the chat via this invite link; 1-99999',
                minimum: 1,
                maximum: 99999,
            },
        },
        required: ['bot_token', 'chat_id'],
    },
    outputSchema: {
        type: 'object',
        properties: {
            ok: { type: 'boolean' },
            result: {
                type: 'object',
                properties: {
                    invite_link: { type: 'string' },
                    creator: { type: 'object' },
                    creates_join_request: { type: 'boolean' },
                    is_primary: { type: 'boolean' },
                    is_revoked: { type: 'boolean' },
                    name: { type: 'string' },
                    expire_date: { type: 'number' },
                    member_limit: { type: 'number' },
                }
            },
        },
    },
    exampleInput: {
        bot_token: '123456789:ABCdefGhIJKlmnOPQRstUVwxYZ',
        chat_id: '-100123456789',
        name: 'MintFlow Invite',
        expire_date: '2023-12-31T23:59:59Z',
        member_limit: 10,
    },
    exampleOutput: {
        ok: true,
        result: {
            invite_link: 'https://t.me/joinchat/AAAAAAAAAAAAAAAAAAAA',
            creator: {
                id: 123456789,
                is_bot: true,
                first_name: 'MintFlow Bot',
                username: 'mintflow_bot',
            },
            creates_join_request: false,
            is_primary: false,
            is_revoked: false,
            name: 'MintFlow Invite',
            expire_date: 1672531199,
            member_limit: 10,
        },
    },
    execute: async (input: any, config: any): Promise<any> => {
        try {
            const response = await axios.post(
                telegramCommons.getApiUrl(input.bot_token, 'createChatInviteLink'),
                {
                    chat_id: input.chat_id,
                    name: input.name || undefined,
                    expire_date: input.expire_date
                        ? Math.floor(new Date(input.expire_date).getTime() / 1000)
                        : undefined,
                    member_limit: input.member_limit || undefined,
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

export default createInviteLink;
