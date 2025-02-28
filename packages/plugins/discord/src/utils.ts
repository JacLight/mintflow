import { Client, GatewayIntentBits, REST, Routes } from 'discord.js';
import FormData from 'form-data';
import {
    DiscordSendMessageParams,
    DiscordCreateChannelParams,
    DiscordAddRoleParams,
    DiscordBanMemberParams
} from './models';

/**
 * Send a message to a Discord channel
 */
export const discordSendMessage = async (params: DiscordSendMessageParams) => {
    const rest = new REST({ version: '10' }).setToken(params.token);

    const messagePayload: any = {
        content: params.content,
        tts: params.tts || false,
    };

    if (params.embeds && params.embeds.length > 0) {
        messagePayload.embeds = params.embeds;
    }

    if (params.components && params.components.length > 0) {
        messagePayload.components = params.components;
    }

    // If files are included, we need to use FormData
    if (params.files && params.files.length > 0) {
        const formData = new FormData();
        formData.append('payload_json', JSON.stringify(messagePayload));

        params.files.forEach((file, index) => {
            formData.append(`files[${index}]`, file.data, {
                filename: file.filename,
                contentType: 'application/octet-stream',
            });
        });

        return await rest.post(
            Routes.channelMessages(params.channelId),
            { body: formData }
        );
    } else {
        return await rest.post(
            Routes.channelMessages(params.channelId),
            { body: messagePayload }
        );
    }
};

/**
 * Get a list of guilds the bot is a member of
 */
export const getGuilds = async (token: string) => {
    const rest = new REST({ version: '10' }).setToken(token);
    return await rest.get(Routes.userGuilds());
};

/**
 * Get a list of channels in a guild
 */
export const getChannels = async (token: string, guildId: string) => {
    const rest = new REST({ version: '10' }).setToken(token);
    return await rest.get(Routes.guildChannels(guildId));
};

/**
 * Get a list of roles in a guild
 */
export const getRoles = async (token: string, guildId: string) => {
    const rest = new REST({ version: '10' }).setToken(token);
    return await rest.get(Routes.guildRoles(guildId));
};

/**
 * Create a new channel in a guild
 */
export const createChannel = async (params: DiscordCreateChannelParams) => {
    const rest = new REST({ version: '10' }).setToken(params.token);

    const channelData: any = {
        name: params.name,
        type: params.type || 0, // Default to text channel
    };

    if (params.topic) channelData.topic = params.topic;
    if (params.position !== undefined) channelData.position = params.position;
    if (params.nsfw !== undefined) channelData.nsfw = params.nsfw;
    if (params.bitrate) channelData.bitrate = params.bitrate;
    if (params.userLimit) channelData.user_limit = params.userLimit;
    if (params.parentId) channelData.parent_id = params.parentId;
    if (params.permissionOverwrites) channelData.permission_overwrites = params.permissionOverwrites;

    return await rest.post(
        Routes.guildChannels(params.guildId),
        { body: channelData }
    );
};

/**
 * Delete a channel
 */
export const deleteChannel = async (token: string, channelId: string) => {
    const rest = new REST({ version: '10' }).setToken(token);
    return await rest.delete(Routes.channel(channelId));
};

/**
 * Add a role to a guild member
 */
export const addRoleToMember = async (params: DiscordAddRoleParams) => {
    const rest = new REST({ version: '10' }).setToken(params.token);
    return await rest.put(
        Routes.guildMemberRole(params.guildId, params.userId, params.roleId)
    );
};

/**
 * Remove a role from a guild member
 */
export const removeRoleFromMember = async (params: DiscordAddRoleParams) => {
    const rest = new REST({ version: '10' }).setToken(params.token);
    return await rest.delete(
        Routes.guildMemberRole(params.guildId, params.userId, params.roleId)
    );
};

/**
 * Ban a member from a guild
 */
export const banMember = async (params: DiscordBanMemberParams) => {
    const rest = new REST({ version: '10' }).setToken(params.token);

    const banOptions: any = {};
    if (params.reason) banOptions.reason = params.reason;
    if (params.deleteMessageDays) banOptions.delete_message_days = params.deleteMessageDays;

    return await rest.put(
        Routes.guildBan(params.guildId, params.userId),
        { body: banOptions }
    );
};

/**
 * Remove a ban from a user
 */
export const removeBan = async (token: string, guildId: string, userId: string) => {
    const rest = new REST({ version: '10' }).setToken(token);
    return await rest.delete(Routes.guildBan(guildId, userId));
};

/**
 * Find a guild member by username
 */
export const findMemberByUsername = async (token: string, guildId: string, username: string) => {
    const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers] });
    await client.login(token);

    try {
        const guild = await client.guilds.fetch(guildId);
        const members = await guild.members.fetch();

        const member = members.find(m =>
            m.user.username === username ||
            m.nickname === username
        );

        await client.destroy();
        return member ? member.toJSON() : null;
    } catch (error) {
        await client.destroy();
        throw error;
    }
};

/**
 * Create a new role in a guild
 */
export const createRole = async (token: string, guildId: string, options: {
    name: string;
    color?: number;
    hoist?: boolean;
    position?: number;
    permissions?: string;
    mentionable?: boolean;
}) => {
    const rest = new REST({ version: '10' }).setToken(token);
    return await rest.post(
        Routes.guildRoles(guildId),
        { body: options }
    );
};

/**
 * Delete a role from a guild
 */
export const deleteRole = async (token: string, guildId: string, roleId: string) => {
    const rest = new REST({ version: '10' }).setToken(token);
    return await rest.delete(Routes.guildRole(guildId, roleId));
};
