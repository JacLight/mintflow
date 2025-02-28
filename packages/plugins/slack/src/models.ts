// Slack data models

export interface SlackMessage {
    ts: string;
    text: string;
    user: string;
    team: string;
    channel: string;
    thread_ts?: string;
}

export interface SlackChannel {
    id: string;
    name: string;
    is_channel: boolean;
    is_group: boolean;
    is_im: boolean;
    is_private: boolean;
    is_archived: boolean;
}

export interface SlackUser {
    id: string;
    name: string;
    real_name?: string;
    profile?: {
        email?: string;
        display_name?: string;
        image_72?: string;
        status_text?: string;
        status_emoji?: string;
    };
    is_bot: boolean;
    is_admin?: boolean;
    is_owner?: boolean;
}

export interface SlackReaction {
    name: string;
    count: number;
    users: string[];
}

export interface SlackFile {
    id: string;
    name: string;
    filetype: string;
    url_private: string;
    permalink: string;
    size: number;
    mimetype: string;
}

export interface SlackMessageBlock {
    type: string;
    text?: {
        type: string;
        text: string;
    };
    elements?: any[];
    accessory?: any;
}

export interface SlackSendMessageParams {
    token: string;
    conversationId: string;
    username?: string;
    profilePicture?: string;
    blocks?: any[];
    text: string;
    file?: {
        data: Buffer | string;
        filename: string;
    };
    threadTs?: string;
}

export interface SlackSearchParams {
    token: string;
    query: string;
    count?: number;
    sort?: 'score' | 'timestamp';
    sort_dir?: 'asc' | 'desc';
    highlight?: boolean;
}

export interface SlackChannelHistoryParams {
    token: string;
    channel: string;
    count?: number;
    latest?: string;
    oldest?: string;
    inclusive?: boolean;
}

export interface SlackUserProfileParams {
    token: string;
    user: string;
    name?: string;
    value?: string;
}

export interface SlackCreateChannelParams {
    token: string;
    name: string;
    is_private?: boolean;
    team_id?: string;
}
