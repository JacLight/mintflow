// YouTube data models

export interface YouTubeVideo {
    id: string;
    title: string;
    description: string;
    publishedAt: string;
    thumbnails: {
        default: YouTubeThumbnail;
        medium: YouTubeThumbnail;
        high: YouTubeThumbnail;
    };
    channelId: string;
    channelTitle: string;
}

export interface YouTubeThumbnail {
    url: string;
    width: number;
    height: number;
}

export interface YouTubeChannel {
    id: string;
    title: string;
    description: string;
    customUrl: string;
    thumbnails: {
        default: YouTubeThumbnail;
        medium: YouTubeThumbnail;
        high: YouTubeThumbnail;
    };
}

export interface YouTubeSearchParams {
    token: string;
    query: string;
    maxResults?: number;
    channelId?: string;
    order?: 'date' | 'rating' | 'relevance' | 'title' | 'videoCount' | 'viewCount';
}

export interface YouTubeChannelVideosParams {
    token: string;
    channelId: string;
    maxResults?: number;
    order?: 'date' | 'rating' | 'relevance' | 'title' | 'videoCount' | 'viewCount';
}

export interface YouTubeVideoDetailsParams {
    token: string;
    videoId: string;
}

export interface YouTubeChannelDetailsParams {
    token: string;
    channelId?: string;
    username?: string;
}
