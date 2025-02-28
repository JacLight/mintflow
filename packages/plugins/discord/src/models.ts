// Discord data models

export interface DiscordMessage {
    id: string;
    type: number;
    content: string;
    channel_id: string;
    author: {
        id: string;
        username: string;
    };
    attachments: any[];
    embeds: any[];
    mentions: any[];
    mention_roles: any[];
    pinned: boolean;
    mention_everyone: boolean;
    tts: boolean;
    timestamp: string;
    edited_timestamp: string | null;
    flags: number;
    components: any[];
}

export interface DiscordGuild {
    id: string;
    name: string;
    icon: string | null;
    owner: boolean;
    permissions: string;
    features: string[];
}

export interface DiscordChannel {
    id: string;
    name: string;
    type: number;
    guild_id?: string;
    position?: number;
    permission_overwrites?: any[];
    topic?: string | null;
    nsfw?: boolean;
    last_message_id?: string | null;
    bitrate?: number;
    user_limit?: number;
    rate_limit_per_user?: number;
    recipients?: any[];
    parent_id?: string | null;
}

export interface DiscordMember {
    user: {
        id: string;
        username: string;
        discriminator: string;
        avatar: string | null;
        bot?: boolean;
    };
    nick?: string | null;
    roles: string[];
    joined_at: string;
    premium_since?: string | null;
    deaf: boolean;
    mute: boolean;
    pending?: boolean;
}

export interface DiscordRole {
    id: string;
    name: string;
    color: number;
    hoist: boolean;
    position: number;
    permissions: string;
    managed: boolean;
    mentionable: boolean;
}

export interface DiscordSendMessageParams {
    token: string;
    channelId: string;
    content: string;
    username?: string;
    avatarUrl?: string;
    tts?: boolean;
    embeds?: any[];
    components?: any[];
    files?: {
        data: Buffer | string;
        filename: string;
    }[];
    threadId?: string;
}

export interface DiscordCreateChannelParams {
    token: string;
    guildId: string;
    name: string;
    type?: number;
    topic?: string;
    position?: number;
    nsfw?: boolean;
    bitrate?: number;
    userLimit?: number;
    parentId?: string;
    permissionOverwrites?: any[];
}

export interface DiscordAddRoleParams {
    token: string;
    guildId: string;
    userId: string;
    roleId: string;
}

export interface DiscordBanMemberParams {
    token: string;
    guildId: string;
    userId: string;
    reason?: string;
    deleteMessageDays?: number;
}
