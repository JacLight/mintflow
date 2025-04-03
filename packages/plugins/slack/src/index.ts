import { WebClient } from '@slack/web-api';
import {
    slackSendMessage,
    processMessageTimestamp,
    searchMessages,
    getChannelHistory,
    findUserByEmail,
    findUserByHandle,
    updateMessage,
    createChannel,
    updateUserProfile,
    setUserStatus,
    addReactionToMessage,
    getChannels,
    getUsers,
    markdownToSlackFormat
} from './utils.js';

const slackPlugin = {
    name: "Slack",
    icon: "MessageSquareText",
    description: "Channel-based messaging platform",
    groups: ["communication"],
    tags: ["communication", "messaging", "chat", "notification", "alert"],
    version: '1.0.0',
    id: "slack",
    runner: "node",
    inputSchema: {
        type: "object",
        properties: {
            action: {
                type: 'string',
                enum: [
                    'send_message',
                    'send_direct_message',
                    'search_messages',
                    'update_message',
                    'get_channel_history',
                    'find_user_by_email',
                    'find_user_by_handle',
                    'create_channel',
                    'update_profile',
                    'set_status',
                    'add_reaction',
                    'markdown_to_slack'
                ],
                description: 'Action to perform on Slack',
            },
            token: {
                type: 'string',
                description: 'Slack API token',
            },
            // Fields for send_message
            channel: {
                type: 'string',
                description: 'Channel ID to send message to',
                rules: [
                    { operation: 'notEqual', valueA: 'send_message', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'update_message', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'get_channel_history', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'add_reaction', valueB: '{{action}}', action: 'hide' },
                ],
            },
            text: {
                type: 'string',
                description: 'Message text',
                rules: [
                    { operation: 'notEqual', valueA: 'send_message', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'send_direct_message', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'update_message', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'markdown_to_slack', valueB: '{{action}}', action: 'hide' },
                ],
            },
            username: {
                type: 'string',
                description: 'Username to display',
                rules: [
                    { operation: 'notEqual', valueA: 'send_message', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'send_direct_message', valueB: '{{action}}', action: 'hide' },
                ],
            },
            profilePicture: {
                type: 'string',
                description: 'Profile picture URL',
                rules: [
                    { operation: 'notEqual', valueA: 'send_message', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'send_direct_message', valueB: '{{action}}', action: 'hide' },
                ],
            },
            threadTs: {
                type: 'string',
                description: 'Thread timestamp to reply to',
                rules: [
                    { operation: 'notEqual', valueA: 'send_message', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'send_direct_message', valueB: '{{action}}', action: 'hide' },
                ],
            },
            blocks: {
                type: 'array',
                description: 'Slack Block Kit blocks',
                rules: [
                    { operation: 'notEqual', valueA: 'send_message', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'send_direct_message', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'update_message', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Fields for send_direct_message
            userId: {
                type: 'string',
                description: 'User ID to send direct message to',
                rules: [{ operation: 'notEqual', valueA: 'send_direct_message', valueB: '{{action}}', action: 'hide' }],
            },
            // Fields for search_messages
            query: {
                type: 'string',
                description: 'Search query',
                rules: [{ operation: 'notEqual', valueA: 'search_messages', valueB: '{{action}}', action: 'hide' }],
            },
            count: {
                type: 'number',
                description: 'Number of results to return',
                rules: [
                    { operation: 'notEqual', valueA: 'search_messages', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'get_channel_history', valueB: '{{action}}', action: 'hide' },
                ],
            },
            sort: {
                type: 'string',
                enum: ['score', 'timestamp'],
                description: 'Sort order',
                rules: [{ operation: 'notEqual', valueA: 'search_messages', valueB: '{{action}}', action: 'hide' }],
            },
            sortDir: {
                type: 'string',
                enum: ['asc', 'desc'],
                description: 'Sort direction',
                rules: [{ operation: 'notEqual', valueA: 'search_messages', valueB: '{{action}}', action: 'hide' }],
            },
            highlight: {
                type: 'boolean',
                description: 'Highlight matching terms',
                rules: [{ operation: 'notEqual', valueA: 'search_messages', valueB: '{{action}}', action: 'hide' }],
            },
            // Fields for update_message
            ts: {
                type: 'string',
                description: 'Timestamp of message to update',
                rules: [
                    { operation: 'notEqual', valueA: 'update_message', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'add_reaction', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Fields for get_channel_history
            latest: {
                type: 'string',
                description: 'End of time range',
                rules: [{ operation: 'notEqual', valueA: 'get_channel_history', valueB: '{{action}}', action: 'hide' }],
            },
            oldest: {
                type: 'string',
                description: 'Start of time range',
                rules: [{ operation: 'notEqual', valueA: 'get_channel_history', valueB: '{{action}}', action: 'hide' }],
            },
            inclusive: {
                type: 'boolean',
                description: 'Include messages with latest or oldest timestamp',
                rules: [{ operation: 'notEqual', valueA: 'get_channel_history', valueB: '{{action}}', action: 'hide' }],
            },
            // Fields for find_user_by_email
            email: {
                type: 'string',
                description: 'Email address to search for',
                rules: [{ operation: 'notEqual', valueA: 'find_user_by_email', valueB: '{{action}}', action: 'hide' }],
            },
            // Fields for find_user_by_handle
            handle: {
                type: 'string',
                description: 'Username to search for',
                rules: [{ operation: 'notEqual', valueA: 'find_user_by_handle', valueB: '{{action}}', action: 'hide' }],
            },
            // Fields for create_channel
            name: {
                type: 'string',
                description: 'Channel name',
                rules: [{ operation: 'notEqual', valueA: 'create_channel', valueB: '{{action}}', action: 'hide' }],
            },
            isPrivate: {
                type: 'boolean',
                description: 'Whether the channel is private',
                rules: [{ operation: 'notEqual', valueA: 'create_channel', valueB: '{{action}}', action: 'hide' }],
            },
            // Fields for update_profile
            profile: {
                type: 'object',
                description: 'Profile fields to update',
                rules: [{ operation: 'notEqual', valueA: 'update_profile', valueB: '{{action}}', action: 'hide' }],
            },
            // Fields for set_status
            statusText: {
                type: 'string',
                description: 'Status text',
                rules: [{ operation: 'notEqual', valueA: 'set_status', valueB: '{{action}}', action: 'hide' }],
            },
            statusEmoji: {
                type: 'string',
                description: 'Status emoji',
                rules: [{ operation: 'notEqual', valueA: 'set_status', valueB: '{{action}}', action: 'hide' }],
            },
            statusExpiration: {
                type: 'number',
                description: 'Status expiration time',
                rules: [{ operation: 'notEqual', valueA: 'set_status', valueB: '{{action}}', action: 'hide' }],
            },
            // Fields for add_reaction
            reaction: {
                type: 'string',
                description: 'Reaction emoji name',
                rules: [{ operation: 'notEqual', valueA: 'add_reaction', valueB: '{{action}}', action: 'hide' }],
            },
        },
        required: ['action', 'token'],
    },
    outputSchema: {
        type: "object",
    },
    exampleInput: {
        action: 'send_message',
        token: 'xoxb-your-token',
        channel: 'C1234567890',
        text: 'Hello from MintFlow!',
        username: 'MintFlow Bot',
        profilePicture: 'https://example.com/bot-avatar.png'
    },
    exampleOutput: {
        "ok": true,
        "channel": "C1234567890",
        "ts": "1503435956.000247",
        "message": {
            "text": "Hello from MintFlow!",
            "username": "MintFlow Bot",
            "bot_id": "B1234567890",
            "type": "message",
            "subtype": "bot_message",
            "ts": "1503435956.000247"
        }
    },
    documentation: "https://api.slack.com/",
    method: "exec",
    actions: [
        {
            name: 'slack',
            execute: async (input: any): Promise<any> => {
                const { action, token } = input;

                if (!action || !token) {
                    throw new Error('Missing required parameters: action, token');
                }

                // Validate the token by creating a client and making a simple API call
                try {
                    const client = new WebClient(token);
                    await client.auth.test();
                } catch (error: any) {
                    throw new Error(`Invalid Slack token: ${error?.message || 'Unknown error'}`);
                }

                switch (action) {
                    case 'send_message': {
                        const { channel, text, username, profilePicture, threadTs, blocks } = input;

                        if (!channel || !text) {
                            throw new Error('Missing required parameters: channel, text');
                        }

                        return await slackSendMessage({
                            token,
                            conversationId: channel,
                            text,
                            username,
                            profilePicture,
                            threadTs: threadTs ? processMessageTimestamp(threadTs) : undefined,
                            blocks,
                        });
                    }

                    case 'send_direct_message': {
                        const { userId, text, username, profilePicture, threadTs, blocks } = input;

                        if (!userId || !text) {
                            throw new Error('Missing required parameters: userId, text');
                        }

                        return await slackSendMessage({
                            token,
                            conversationId: userId,
                            text,
                            username,
                            profilePicture,
                            threadTs: threadTs ? processMessageTimestamp(threadTs) : undefined,
                            blocks,
                        });
                    }

                    case 'search_messages': {
                        const { query, count, sort, sortDir, highlight } = input;

                        if (!query) {
                            throw new Error('Missing required parameter: query');
                        }

                        return await searchMessages(token, query, {
                            count,
                            sort,
                            sort_dir: sortDir,
                            highlight,
                        });
                    }

                    case 'update_message': {
                        const { channel, ts, text, blocks } = input;

                        if (!channel || !ts || !text) {
                            throw new Error('Missing required parameters: channel, ts, text');
                        }

                        return await updateMessage(token, channel, ts, text, blocks);
                    }

                    case 'get_channel_history': {
                        const { channel, count, latest, oldest, inclusive } = input;

                        if (!channel) {
                            throw new Error('Missing required parameter: channel');
                        }

                        return await getChannelHistory(token, channel, {
                            count,
                            latest,
                            oldest,
                            inclusive,
                        });
                    }

                    case 'find_user_by_email': {
                        const { email } = input;

                        if (!email) {
                            throw new Error('Missing required parameter: email');
                        }

                        return await findUserByEmail(token, email);
                    }

                    case 'find_user_by_handle': {
                        const { handle } = input;

                        if (!handle) {
                            throw new Error('Missing required parameter: handle');
                        }

                        return await findUserByHandle(token, handle);
                    }

                    case 'create_channel': {
                        const { name, isPrivate } = input;

                        if (!name) {
                            throw new Error('Missing required parameter: name');
                        }

                        return await createChannel(token, name, isPrivate);
                    }

                    case 'update_profile': {
                        const { profile } = input;

                        if (!profile || typeof profile !== 'object') {
                            throw new Error('Missing or invalid parameter: profile');
                        }

                        return await updateUserProfile(token, profile);
                    }

                    case 'set_status': {
                        const { statusText, statusEmoji, statusExpiration } = input;

                        if (!statusText || !statusEmoji) {
                            throw new Error('Missing required parameters: statusText, statusEmoji');
                        }

                        return await setUserStatus(token, statusText, statusEmoji, statusExpiration);
                    }

                    case 'add_reaction': {
                        const { channel, ts, reaction } = input;

                        if (!channel || !ts || !reaction) {
                            throw new Error('Missing required parameters: channel, ts, reaction');
                        }

                        return await addReactionToMessage(token, channel, ts, reaction);
                    }

                    case 'markdown_to_slack': {
                        const { text } = input;

                        if (!text) {
                            throw new Error('Missing required parameter: text');
                        }

                        return {
                            original: text,
                            converted: markdownToSlackFormat(text)
                        };
                    }

                    default:
                        throw new Error(`Unsupported action: ${action}`);
                }
            }
        }
    ]
};

export default slackPlugin;
