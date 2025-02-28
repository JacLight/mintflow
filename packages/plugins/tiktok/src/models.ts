// TikTok data models

export interface TikTokVideo {
    id: string;
    title: string;
    description: string;
    createTime: string;
    coverUrl: string;
    shareUrl: string;
    videoUrl: string;
    duration: number;
    width: number;
    height: number;
    statistics: TikTokStatistics;
}

export interface TikTokStatistics {
    commentCount: number;
    likeCount: number;
    shareCount: number;
    viewCount: number;
}

export interface TikTokUser {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string;
    bio: string;
    followingCount: number;
    followerCount: number;
    likeCount: number;
    videoCount: number;
}

export interface TikTokVideoListParams {
    token: string;
    userId?: string;
    maxResults?: number;
}

export interface TikTokVideoDetailsParams {
    token: string;
    videoId: string;
}

export interface TikTokUserDetailsParams {
    token: string;
    userId?: string;
    username?: string;
}

export interface TikTokUploadVideoParams {
    token: string;
    videoUrl: string;
    description?: string;
    privacy?: 'public' | 'private' | 'friends';
    disableComments?: boolean;
    disableDuet?: boolean;
    disableStitch?: boolean;
}
