import {
    discordSendMessage,
    getGuilds,
    getChannels,
    getRoles,
    createChannel,
    deleteChannel,
    addRoleToMember,
    removeRoleFromMember,
    banMember,
    removeBan,
    findMemberByUsername,
    createRole,
    deleteRole
} from './utils';

const discordPlugin = {
    name: "Discord",
    icon: "",
    description: "Instant messaging and VoIP social platform",
    groups: ["communication"],
    tags: ["communication","messaging","chat","notification","alert"],
    version: '1.0.0',
    id: "discord",
    runner: "node",
    inputSchema: {
        type: "object",
        properties: {
            action: {
                type: 'string',
                enum: [
                    'send_message',
                    'get_guilds',
                    'get_channels',
                    'get_roles',
                    'create_channel',
                    'delete_channel',
                    'add_role_to_member',
                    'remove_role_from_member',
                    'ban_member',
                    'remove_ban',
                    'find_member_by_username',
                    'create_role',
                    'delete_role'
                ],
                description: 'Action to perform on Discord',
            },
            token: {
                type: 'string',
                description: 'Discord Bot Token',
            },
            // Fields for send_message
            channelId: {
                type: 'string',
                description: 'Channel ID to send message to',
                rules: [
                    { operation: 'notEqual', valueA: 'send_message', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'create_channel', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'delete_channel', valueB: '{{action}}', action: 'hide' },
                ],
            },
            content: {
                type: 'string',
                description: 'Message content',
                rules: [{ operation: 'notEqual', valueA: 'send_message', valueB: '{{action}}', action: 'hide' }],
            },
            tts: {
                type: 'boolean',
                description: 'Text-to-speech',
                rules: [{ operation: 'notEqual', valueA: 'send_message', valueB: '{{action}}', action: 'hide' }],
            },
            embeds: {
                type: 'array',
                description: 'Message embeds',
                rules: [{ operation: 'notEqual', valueA: 'send_message', valueB: '{{action}}', action: 'hide' }],
            },
            // Fields for guild operations
            guildId: {
                type: 'string',
                description: 'Guild ID',
                rules: [
                    { operation: 'notEqual', valueA: 'get_channels', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'get_roles', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'create_channel', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'add_role_to_member', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'remove_role_from_member', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'ban_member', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'remove_ban', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'find_member_by_username', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'create_role', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'delete_role', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Fields for channel operations
            name: {
                type: 'string',
                description: 'Channel or role name',
                rules: [
                    { operation: 'notEqual', valueA: 'create_channel', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'create_role', valueB: '{{action}}', action: 'hide' },
                ],
            },
            type: {
                type: 'number',
                description: 'Channel type (0: text, 2: voice, 4: category, 5: announcement, 13: stage, 15: forum)',
                rules: [{ operation: 'notEqual', valueA: 'create_channel', valueB: '{{action}}', action: 'hide' }],
            },
            topic: {
                type: 'string',
                description: 'Channel topic',
                rules: [{ operation: 'notEqual', valueA: 'create_channel', valueB: '{{action}}', action: 'hide' }],
            },
            // Fields for member operations
            userId: {
                type: 'string',
                description: 'User ID',
                rules: [
                    { operation: 'notEqual', valueA: 'add_role_to_member', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'remove_role_from_member', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'ban_member', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'remove_ban', valueB: '{{action}}', action: 'hide' },
                ],
            },
            username: {
                type: 'string',
                description: 'Username to search for',
                rules: [{ operation: 'notEqual', valueA: 'find_member_by_username', valueB: '{{action}}', action: 'hide' }],
            },
            // Fields for role operations
            roleId: {
                type: 'string',
                description: 'Role ID',
                rules: [
                    { operation: 'notEqual', valueA: 'add_role_to_member', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'remove_role_from_member', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'delete_role', valueB: '{{action}}', action: 'hide' },
                ],
            },
            color: {
                type: 'number',
                description: 'Role color (decimal color value)',
                rules: [{ operation: 'notEqual', valueA: 'create_role', valueB: '{{action}}', action: 'hide' }],
            },
            hoist: {
                type: 'boolean',
                description: 'Whether to display role members separately',
                rules: [{ operation: 'notEqual', valueA: 'create_role', valueB: '{{action}}', action: 'hide' }],
            },
            mentionable: {
                type: 'boolean',
                description: 'Whether the role is mentionable',
                rules: [{ operation: 'notEqual', valueA: 'create_role', valueB: '{{action}}', action: 'hide' }],
            },
            // Fields for ban operations
            reason: {
                type: 'string',
                description: 'Reason for ban',
                rules: [{ operation: 'notEqual', valueA: 'ban_member', valueB: '{{action}}', action: 'hide' }],
            },
            deleteMessageDays: {
                type: 'number',
                description: 'Number of days of messages to delete (0-7)',
                rules: [{ operation: 'notEqual', valueA: 'ban_member', valueB: '{{action}}', action: 'hide' }],
            },
        },
        required: ['action', 'token'],
    },
    outputSchema: {
        type: "object",
    },
    exampleInput: {
        action: 'send_message',
        token: 'your-discord-bot-token',
        channelId: '1234567890123456789',
        content: 'Hello from MintFlow!'
    },
    exampleOutput: {
        id: '1234567890123456789',
        type: 0,
        content: 'Hello from MintFlow!',
        channel_id: '1234567890123456789',
        author: {
            id: '1234567890123456789',
            username: 'MintFlow Bot',
            discriminator: '0000',
            avatar: null,
            bot: true
        },
        attachments: [],
        embeds: [],
        mentions: [],
        mention_roles: [],
        pinned: false,
        mention_everyone: false,
        tts: false,
        timestamp: '2023-01-01T00:00:00.000Z',
        edited_timestamp: null,
        flags: 0,
        components: []
    },
    documentation: "https://discord.com/developers/docs/",
    method: "exec",
    actions: [
        {
            name: 'discord',
            execute: async (input: any): Promise<any> => {
                const { action, token } = input;

                if (!action || !token) {
                    throw new Error('Missing required parameters: action, token');
                }

                switch (action) {
                    case 'send_message': {
                        const { channelId, content, tts, embeds, components, files } = input;

                        if (!channelId || !content) {
                            throw new Error('Missing required parameters: channelId, content');
                        }

                        return await discordSendMessage({
                            token,
                            channelId,
                            content,
                            tts,
                            embeds,
                            components,
                            files
                        });
                    }

                    case 'get_guilds': {
                        return await getGuilds(token);
                    }

                    case 'get_channels': {
                        const { guildId } = input;

                        if (!guildId) {
                            throw new Error('Missing required parameter: guildId');
                        }

                        return await getChannels(token, guildId);
                    }

                    case 'get_roles': {
                        const { guildId } = input;

                        if (!guildId) {
                            throw new Error('Missing required parameter: guildId');
                        }

                        return await getRoles(token, guildId);
                    }

                    case 'create_channel': {
                        const { guildId, name, type, topic, position, nsfw, bitrate, userLimit, parentId, permissionOverwrites } = input;

                        if (!guildId || !name) {
                            throw new Error('Missing required parameters: guildId, name');
                        }

                        return await createChannel({
                            token,
                            guildId,
                            name,
                            type,
                            topic,
                            position,
                            nsfw,
                            bitrate,
                            userLimit,
                            parentId,
                            permissionOverwrites
                        });
                    }

                    case 'delete_channel': {
                        const { channelId } = input;

                        if (!channelId) {
                            throw new Error('Missing required parameter: channelId');
                        }

                        return await deleteChannel(token, channelId);
                    }

                    case 'add_role_to_member': {
                        const { guildId, userId, roleId } = input;

                        if (!guildId || !userId || !roleId) {
                            throw new Error('Missing required parameters: guildId, userId, roleId');
                        }

                        return await addRoleToMember({
                            token,
                            guildId,
                            userId,
                            roleId
                        });
                    }

                    case 'remove_role_from_member': {
                        const { guildId, userId, roleId } = input;

                        if (!guildId || !userId || !roleId) {
                            throw new Error('Missing required parameters: guildId, userId, roleId');
                        }

                        return await removeRoleFromMember({
                            token,
                            guildId,
                            userId,
                            roleId
                        });
                    }

                    case 'ban_member': {
                        const { guildId, userId, reason, deleteMessageDays } = input;

                        if (!guildId || !userId) {
                            throw new Error('Missing required parameters: guildId, userId');
                        }

                        return await banMember({
                            token,
                            guildId,
                            userId,
                            reason,
                            deleteMessageDays
                        });
                    }

                    case 'remove_ban': {
                        const { guildId, userId } = input;

                        if (!guildId || !userId) {
                            throw new Error('Missing required parameters: guildId, userId');
                        }

                        return await removeBan(token, guildId, userId);
                    }

                    case 'find_member_by_username': {
                        const { guildId, username } = input;

                        if (!guildId || !username) {
                            throw new Error('Missing required parameters: guildId, username');
                        }

                        return await findMemberByUsername(token, guildId, username);
                    }

                    case 'create_role': {
                        const { guildId, name, color, hoist, position, permissions, mentionable } = input;

                        if (!guildId || !name) {
                            throw new Error('Missing required parameters: guildId, name');
                        }

                        return await createRole(token, guildId, {
                            name,
                            color,
                            hoist,
                            position,
                            permissions,
                            mentionable
                        });
                    }

                    case 'delete_role': {
                        const { guildId, roleId } = input;

                        if (!guildId || !roleId) {
                            throw new Error('Missing required parameters: guildId, roleId');
                        }

                        return await deleteRole(token, guildId, roleId);
                    }

                    default:
                        throw new Error(`Unsupported action: ${action}`);
                }
            }
        }
    ]
};

export default discordPlugin;
