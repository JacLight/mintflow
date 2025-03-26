import {
    createChannel,
    sendChannelMessage,
    sendChatMessage,
    listTeams,
    listChannels,
    listChats,
    getTeam,
    getChannel,
    getChat,
    listChannelMessages,
    listChatMessages
} from './utils.js';

import { CHAT_TYPE } from './models.js';

const teamsPlugin = {
    name: "Microsoft Teams",
    icon: "",
    description: "Team collaboration, messaging, and meetings",
    groups: ["communication"],
    tags: ["communication","messaging","chat","notification","alert"],
    version: '1.0.0',
    id: "teams",
    runner: "node",
    inputSchema: {
        type: "object",
        properties: {
            action: {
                type: 'string',
                enum: [
                    'create_channel',
                    'send_channel_message',
                    'send_chat_message',
                    'list_teams',
                    'list_channels',
                    'list_chats',
                    'get_team',
                    'get_channel',
                    'get_chat',
                    'list_channel_messages',
                    'list_chat_messages'
                ],
                description: 'Action to perform on Microsoft Teams',
            },
            token: {
                type: 'string',
                description: 'Microsoft Teams API OAuth token',
            },
            // Team parameters
            teamId: {
                type: 'string',
                description: 'Team ID',
                rules: [
                    { operation: 'notEqual', valueA: 'create_channel', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'send_channel_message', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'list_channels', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'get_team', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'get_channel', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'list_channel_messages', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Channel parameters
            channelId: {
                type: 'string',
                description: 'Channel ID',
                rules: [
                    { operation: 'notEqual', valueA: 'send_channel_message', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'get_channel', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'list_channel_messages', valueB: '{{action}}', action: 'hide' },
                ],
            },
            channelDisplayName: {
                type: 'string',
                description: 'Channel display name',
                rules: [
                    { operation: 'notEqual', valueA: 'create_channel', valueB: '{{action}}', action: 'hide' },
                ],
            },
            channelDescription: {
                type: 'string',
                description: 'Channel description',
                rules: [
                    { operation: 'notEqual', valueA: 'create_channel', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Chat parameters
            chatId: {
                type: 'string',
                description: 'Chat ID',
                rules: [
                    { operation: 'notEqual', valueA: 'send_chat_message', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'get_chat', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'list_chat_messages', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Message parameters
            contentType: {
                type: 'string',
                enum: ['text', 'html'],
                description: 'Content type for the message',
                rules: [
                    { operation: 'notEqual', valueA: 'send_channel_message', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'send_chat_message', valueB: '{{action}}', action: 'hide' },
                ],
            },
            content: {
                type: 'string',
                description: 'Message content',
                rules: [
                    { operation: 'notEqual', valueA: 'send_channel_message', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'send_chat_message', valueB: '{{action}}', action: 'hide' },
                ],
            },
        },
        required: ['action', 'token'],
    },
    outputSchema: {
        type: "object",
    },
    exampleInput: {
        action: 'send_channel_message',
        token: 'your-microsoft-teams-api-token',
        teamId: 'team-id',
        channelId: 'channel-id',
        contentType: 'text',
        content: 'Hello from MintFlow!'
    },
    exampleOutput: {
        id: "1234567890",
        etag: "1234567890",
        messageType: "message",
        createdDateTime: "2023-01-01T12:00:00Z",
        lastModifiedDateTime: "2023-01-01T12:00:00Z",
        importance: "normal",
        locale: "en-us",
        body: {
            contentType: "text",
            content: "Hello from MintFlow!"
        },
        from: {
            user: {
                id: "user-id",
                displayName: "User Name"
            }
        }
    },
    documentation: "https://learn.microsoft.com/en-us/graph/api/resources/teams-api-overview",
    method: "exec",
    actions: [
        {
            name: 'teams',
            execute: async (input: any): Promise<any> => {
                const { action, token } = input;

                if (!action || !token) {
                    throw new Error('Missing required parameters: action, token');
                }

                switch (action) {
                    case 'create_channel': {
                        const { teamId, channelDisplayName, channelDescription } = input;

                        if (!teamId || !channelDisplayName) {
                            throw new Error('Missing required parameters: teamId, channelDisplayName');
                        }

                        return await createChannel({
                            token,
                            teamId,
                            channelDisplayName,
                            channelDescription
                        });
                    }

                    case 'send_channel_message': {
                        const { teamId, channelId, contentType, content } = input;

                        if (!teamId || !channelId || !content) {
                            throw new Error('Missing required parameters: teamId, channelId, content');
                        }

                        return await sendChannelMessage({
                            token,
                            teamId,
                            channelId,
                            contentType: contentType || 'text',
                            content
                        });
                    }

                    case 'send_chat_message': {
                        const { chatId, contentType, content } = input;

                        if (!chatId || !content) {
                            throw new Error('Missing required parameters: chatId, content');
                        }

                        return await sendChatMessage({
                            token,
                            chatId,
                            contentType: contentType || 'text',
                            content
                        });
                    }

                    case 'list_teams': {
                        return await listTeams({
                            token
                        });
                    }

                    case 'list_channels': {
                        const { teamId } = input;

                        if (!teamId) {
                            throw new Error('Missing required parameter: teamId');
                        }

                        return await listChannels({
                            token,
                            teamId
                        });
                    }

                    case 'list_chats': {
                        const chats = await listChats({
                            token
                        });

                        // Format chat names for better readability
                        return chats.map(chat => {
                            const chatName = chat.topic ||
                                chat.members
                                    ?.filter((member) => member.displayName !== undefined && member.displayName !== null)
                                    .map((member) => member.displayName || '')
                                    .join(',');

                            const chatType = chat.chatType as keyof typeof CHAT_TYPE || 'unknownFutureValue';
                            return {
                                ...chat,
                                formattedName: `(${CHAT_TYPE[chatType]} Chat) ${chatName || '(no title)'}`
                            };
                        });
                    }

                    case 'get_team': {
                        const { teamId } = input;

                        if (!teamId) {
                            throw new Error('Missing required parameter: teamId');
                        }

                        return await getTeam({
                            token,
                            teamId
                        });
                    }

                    case 'get_channel': {
                        const { teamId, channelId } = input;

                        if (!teamId || !channelId) {
                            throw new Error('Missing required parameters: teamId, channelId');
                        }

                        return await getChannel({
                            token,
                            teamId,
                            channelId
                        });
                    }

                    case 'get_chat': {
                        const { chatId } = input;

                        if (!chatId) {
                            throw new Error('Missing required parameter: chatId');
                        }

                        return await getChat({
                            token,
                            chatId
                        });
                    }

                    case 'list_channel_messages': {
                        const { teamId, channelId } = input;

                        if (!teamId || !channelId) {
                            throw new Error('Missing required parameters: teamId, channelId');
                        }

                        return await listChannelMessages({
                            token,
                            teamId,
                            channelId
                        });
                    }

                    case 'list_chat_messages': {
                        const { chatId } = input;

                        if (!chatId) {
                            throw new Error('Missing required parameter: chatId');
                        }

                        return await listChatMessages({
                            token,
                            chatId
                        });
                    }

                    default:
                        throw new Error(`Unsupported action: ${action}`);
                }
            }
        }
    ]
};

export default teamsPlugin;
