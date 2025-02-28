// Microsoft Teams data models

import { Team, Channel, Chat, ChatMessage, ConversationMember } from '@microsoft/microsoft-graph-types';

// Re-export Microsoft Graph types for convenience
export { Team, Channel, Chat, ChatMessage, ConversationMember };

// Input parameters for Microsoft Teams actions
export interface TeamsCreateChannelParams {
    token: string;
    teamId: string;
    channelDisplayName: string;
    channelDescription?: string;
}

export interface TeamsSendChannelMessageParams {
    token: string;
    teamId: string;
    channelId: string;
    contentType: 'text' | 'html';
    content: string;
}

export interface TeamsSendChatMessageParams {
    token: string;
    chatId: string;
    contentType: 'text' | 'html';
    content: string;
}

export interface TeamsListTeamsParams {
    token: string;
}

export interface TeamsListChannelsParams {
    token: string;
    teamId: string;
}

export interface TeamsListChatsParams {
    token: string;
}

export interface TeamsGetTeamParams {
    token: string;
    teamId: string;
}

export interface TeamsGetChannelParams {
    token: string;
    teamId: string;
    channelId: string;
}

export interface TeamsGetChatParams {
    token: string;
    chatId: string;
}

export interface TeamsListChannelMessagesParams {
    token: string;
    teamId: string;
    channelId: string;
}

export interface TeamsListChatMessagesParams {
    token: string;
    chatId: string;
}

// Response types
export interface TeamsListTeamsResponse {
    value: Team[];
    '@odata.nextLink'?: string;
}

export interface TeamsListChannelsResponse {
    value: Channel[];
    '@odata.nextLink'?: string;
}

export interface TeamsListChatsResponse {
    value: Chat[];
    '@odata.nextLink'?: string;
}

export interface TeamsListChannelMessagesResponse {
    value: ChatMessage[];
    '@odata.nextLink'?: string;
}

export interface TeamsListChatMessagesResponse {
    value: ChatMessage[];
    '@odata.nextLink'?: string;
}

// Chat types mapping for display purposes
export const CHAT_TYPE = {
    oneOnOne: '1:1',
    group: 'Group',
    meeting: 'Meeting',
    unknownFutureValue: 'Unknown',
};
