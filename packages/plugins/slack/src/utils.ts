import { WebClient } from '@slack/web-api';
import { SlackSendMessageParams } from './models.js';

/**
 * Send a message to a Slack channel or user
 */
export const slackSendMessage = async (params: SlackSendMessageParams) => {
    const client = new WebClient(params.token);

    if (params.file) {
        return await client.files.uploadV2({
            channel_id: params.conversationId,
            initial_comment: params.text,
            thread_ts: params.threadTs,
            file_uploads: [
                {
                    file: params.file.data,
                    filename: params.file.filename,
                },
            ],
        });
    } else {
        return await client.chat.postMessage({
            text: params.text,
            channel: params.conversationId,
            username: params.username,
            icon_url: params.profilePicture,
            blocks: params.blocks,
            thread_ts: params.threadTs,
        });
    }
};

/**
 * Process a message timestamp from various formats
 */
export function processMessageTimestamp(input: string): string | undefined {
    // Regular expression to match a URL containing the timestamp
    const urlRegex = /\/p(\d+)(\d{6})$/;
    // Check if the input is a URL
    const urlMatch = input.match(urlRegex);
    if (urlMatch) {
        const timestamp = `${urlMatch[1]}.${urlMatch[2]}`;
        return timestamp;
    }

    // Check if the input is already in the desired format
    const timestampRegex = /^(\d+)\.(\d{6})$/;
    const timestampMatch = input.match(timestampRegex);
    if (timestampMatch) {
        return input;
    }

    return undefined;
}

/**
 * Search for messages in Slack
 */
export const searchMessages = async (
    token: string,
    query: string,
    options: {
        count?: number;
        sort?: 'score' | 'timestamp';
        sort_dir?: 'asc' | 'desc';
        highlight?: boolean;
    } = {}
) => {
    const client = new WebClient(token);
    return await client.search.messages({
        query,
        count: options.count,
        sort: options.sort,
        sort_dir: options.sort_dir,
        highlight: options.highlight,
    });
};

/**
 * Get channel history
 */
export const getChannelHistory = async (
    token: string,
    channel: string,
    options: {
        count?: number;
        latest?: string;
        oldest?: string;
        inclusive?: boolean;
    } = {}
) => {
    const client = new WebClient(token);
    return await client.conversations.history({
        channel,
        limit: options.count,
        latest: options.latest,
        oldest: options.oldest,
        inclusive: options.inclusive,
    });
};

/**
 * Find a user by email
 */
export const findUserByEmail = async (token: string, email: string) => {
    const client = new WebClient(token);
    return await client.users.lookupByEmail({
        email,
    });
};

/**
 * Find a user by handle/username
 */
export const findUserByHandle = async (token: string, handle: string) => {
    const client = new WebClient(token);
    const response = await client.users.list({
        limit: 1000
    });
    if (response.members) {
        return response.members.find(
            (member) =>
                member.name === handle ||
                member.profile?.display_name === handle
        );
    }
    return null;
};

/**
 * Update a message
 */
export const updateMessage = async (
    token: string,
    channel: string,
    ts: string,
    text: string,
    blocks?: any[]
) => {
    const client = new WebClient(token);
    return await client.chat.update({
        channel,
        ts,
        text,
        blocks,
    });
};

/**
 * Create a channel
 */
export const createChannel = async (
    token: string,
    name: string,
    isPrivate: boolean = false
) => {
    const client = new WebClient(token);
    return await client.conversations.create({
        name,
        is_private: isPrivate,
    });
};

/**
 * Update user profile
 */
export const updateUserProfile = async (
    token: string,
    profile: Record<string, string>
) => {
    const client = new WebClient(token);
    return await client.users.profile.set({
        profile,
    });
};

/**
 * Set user status
 */
export const setUserStatus = async (
    token: string,
    statusText: string,
    statusEmoji: string,
    statusExpiration?: number
) => {
    const client = new WebClient(token);
    return await client.users.profile.set({
        profile: {
            status_text: statusText,
            status_emoji: statusEmoji,
            status_expiration: statusExpiration,
        },
    });
};

/**
 * Add a reaction to a message
 */
export const addReactionToMessage = async (
    token: string,
    channel: string,
    timestamp: string,
    name: string
) => {
    const client = new WebClient(token);
    return await client.reactions.add({
        channel,
        timestamp,
        name,
    });
};

/**
 * Get a list of channels
 */
export const getChannels = async (token: string, limit: number = 1000) => {
    const client = new WebClient(token);
    const channels: { label: string; value: string }[] = [];
    const CHANNELS_LIMIT = limit;

    let cursor;
    do {
        const response = await client.conversations.list({
            types: 'public_channel,private_channel',
            exclude_archived: true,
            limit: 1000,
            cursor,
        });

        if (response.channels) {
            channels.push(
                ...response.channels.map((channel) => {
                    return { label: channel.name || '', value: channel.id || '' };
                })
            );
        }

        cursor = response.response_metadata?.next_cursor;
    } while (cursor && channels.length < CHANNELS_LIMIT);

    return channels;
};

/**
 * Get a list of users
 */
export const getUsers = async (token: string) => {
    const client = new WebClient(token);
    const users: { label: string; value: string }[] = [];

    let cursor;
    do {
        const response = await client.users.list({
            limit: 1000,
            cursor,
        });

        if (response.members) {
            users.push(
                ...response.members
                    .filter((member) => !member.deleted && !member.is_bot)
                    .map((member) => {
                        return {
                            label: member.real_name || member.name || '',
                            value: member.id || ''
                        };
                    })
            );
        }

        cursor = response.response_metadata?.next_cursor;
    } while (cursor);

    return users;
};

/**
 * Convert markdown to Slack format
 */
export const markdownToSlackFormat = (markdown: string): string => {
    // Replace bold
    let slackText = markdown.replace(/\*\*(.*?)\*\*/g, '*$1*');

    // Replace italic
    slackText = slackText.replace(/_(.*?)_/g, '_$1_');

    // Replace strikethrough
    slackText = slackText.replace(/~~(.*?)~~/g, '~$1~');

    // Replace code blocks
    slackText = slackText.replace(/```(.*?)```/g, '```$1```');

    // Replace inline code
    slackText = slackText.replace(/`([^`]+)`/g, '`$1`');

    // Replace links
    slackText = slackText.replace(/\[(.*?)\]\((.*?)\)/g, '<$2|$1>');

    return slackText;
};
