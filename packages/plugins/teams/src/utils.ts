import { Client } from '@microsoft/microsoft-graph-client';
import {
    TeamsCreateChannelParams,
    TeamsSendChannelMessageParams,
    TeamsSendChatMessageParams,
    TeamsListTeamsParams,
    TeamsListChannelsParams,
    TeamsListChatsParams,
    TeamsGetTeamParams,
    TeamsGetChannelParams,
    TeamsGetChatParams,
    TeamsListChannelMessagesParams,
    TeamsListChatMessagesParams,
    Team,
    Channel,
    Chat,
    ChatMessage
} from './models.js';

/**
 * Initialize Microsoft Graph client with the provided token
 */
const initGraphClient = (token: string): Client => {
    return Client.initWithMiddleware({
        authProvider: {
            getAccessToken: () => Promise.resolve(token),
        },
    });
};

/**
 * Create a channel in a team
 */
export const createChannel = async (params: TeamsCreateChannelParams): Promise<Channel> => {
    try {
        const { token, teamId, channelDisplayName, channelDescription } = params;

        const client = initGraphClient(token);

        const channel = {
            displayName: channelDisplayName,
            description: channelDescription,
        };

        return await client.api(`/teams/${teamId}/channels`).post(channel);
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Microsoft Teams API error: ${error.message}`);
        }
        throw error;
    }
};

/**
 * Send a message to a channel
 */
export const sendChannelMessage = async (params: TeamsSendChannelMessageParams): Promise<ChatMessage> => {
    try {
        const { token, teamId, channelId, contentType, content } = params;

        const client = initGraphClient(token);

        const chatMessage = {
            body: {
                content: content,
                contentType: contentType,
            },
        };

        return await client.api(`/teams/${teamId}/channels/${channelId}/messages`).post(chatMessage);
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Microsoft Teams API error: ${error.message}`);
        }
        throw error;
    }
};

/**
 * Send a message to a chat
 */
export const sendChatMessage = async (params: TeamsSendChatMessageParams): Promise<ChatMessage> => {
    try {
        const { token, chatId, contentType, content } = params;

        const client = initGraphClient(token);

        const chatMessage = {
            body: {
                content: content,
                contentType: contentType,
            },
        };

        return await client.api(`/chats/${chatId}/messages`).post(chatMessage);
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Microsoft Teams API error: ${error.message}`);
        }
        throw error;
    }
};

/**
 * List teams the user is a member of
 */
export const listTeams = async (params: TeamsListTeamsParams): Promise<Team[]> => {
    try {
        const { token } = params;

        const client = initGraphClient(token);

        const teams: Team[] = [];
        let response = await client.api('/me/joinedTeams').get();

        while (response.value.length > 0) {
            teams.push(...response.value);

            if (response['@odata.nextLink']) {
                response = await client.api(response['@odata.nextLink']).get();
            } else {
                break;
            }
        }

        return teams;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Microsoft Teams API error: ${error.message}`);
        }
        throw error;
    }
};

/**
 * List channels in a team
 */
export const listChannels = async (params: TeamsListChannelsParams): Promise<Channel[]> => {
    try {
        const { token, teamId } = params;

        const client = initGraphClient(token);

        const channels: Channel[] = [];
        let response = await client.api(`/teams/${teamId}/channels`).get();

        while (response.value.length > 0) {
            channels.push(...response.value);

            if (response['@odata.nextLink']) {
                response = await client.api(response['@odata.nextLink']).get();
            } else {
                break;
            }
        }

        return channels;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Microsoft Teams API error: ${error.message}`);
        }
        throw error;
    }
};

/**
 * List chats the user is a member of
 */
export const listChats = async (params: TeamsListChatsParams): Promise<Chat[]> => {
    try {
        const { token } = params;

        const client = initGraphClient(token);

        const chats: Chat[] = [];
        let response = await client.api('/chats').expand('members').get();

        while (response.value.length > 0) {
            chats.push(...response.value);

            if (response['@odata.nextLink']) {
                response = await client.api(response['@odata.nextLink']).get();
            } else {
                break;
            }
        }

        return chats;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Microsoft Teams API error: ${error.message}`);
        }
        throw error;
    }
};

/**
 * Get a team by ID
 */
export const getTeam = async (params: TeamsGetTeamParams): Promise<Team> => {
    try {
        const { token, teamId } = params;

        const client = initGraphClient(token);

        return await client.api(`/teams/${teamId}`).get();
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Microsoft Teams API error: ${error.message}`);
        }
        throw error;
    }
};

/**
 * Get a channel by ID
 */
export const getChannel = async (params: TeamsGetChannelParams): Promise<Channel> => {
    try {
        const { token, teamId, channelId } = params;

        const client = initGraphClient(token);

        return await client.api(`/teams/${teamId}/channels/${channelId}`).get();
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Microsoft Teams API error: ${error.message}`);
        }
        throw error;
    }
};

/**
 * Get a chat by ID
 */
export const getChat = async (params: TeamsGetChatParams): Promise<Chat> => {
    try {
        const { token, chatId } = params;

        const client = initGraphClient(token);

        return await client.api(`/chats/${chatId}`).expand('members').get();
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Microsoft Teams API error: ${error.message}`);
        }
        throw error;
    }
};

/**
 * List messages in a channel
 */
export const listChannelMessages = async (params: TeamsListChannelMessagesParams): Promise<ChatMessage[]> => {
    try {
        const { token, teamId, channelId } = params;

        const client = initGraphClient(token);

        const messages: ChatMessage[] = [];
        let response = await client.api(`/teams/${teamId}/channels/${channelId}/messages`).get();

        while (response.value.length > 0) {
            messages.push(...response.value);

            if (response['@odata.nextLink']) {
                response = await client.api(response['@odata.nextLink']).get();
            } else {
                break;
            }
        }

        return messages;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Microsoft Teams API error: ${error.message}`);
        }
        throw error;
    }
};

/**
 * List messages in a chat
 */
export const listChatMessages = async (params: TeamsListChatMessagesParams): Promise<ChatMessage[]> => {
    try {
        const { token, chatId } = params;

        const client = initGraphClient(token);

        const messages: ChatMessage[] = [];
        let response = await client.api(`/chats/${chatId}/messages`).get();

        while (response.value.length > 0) {
            messages.push(...response.value);

            if (response['@odata.nextLink']) {
                response = await client.api(response['@odata.nextLink']).get();
            } else {
                break;
            }
        }

        return messages;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Microsoft Teams API error: ${error.message}`);
        }
        throw error;
    }
};
