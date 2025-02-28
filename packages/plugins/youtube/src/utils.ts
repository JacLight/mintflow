import axios from 'axios';
import {
    YouTubeSearchParams,
    YouTubeChannelVideosParams,
    YouTubeVideoDetailsParams,
    YouTubeChannelDetailsParams,
    YouTubeVideo,
    YouTubeChannel
} from './models';

const BASE_URL = 'https://www.googleapis.com/youtube/v3';

/**
 * Search for YouTube videos
 */
export const searchVideos = async (params: YouTubeSearchParams): Promise<YouTubeVideo[]> => {
    try {
        const { token, query, maxResults = 10, channelId, order = 'relevance' } = params;

        const searchParams: any = {
            part: 'snippet',
            maxResults,
            q: query,
            type: 'video',
            order
        };

        if (channelId) {
            searchParams.channelId = channelId;
        }

        const response = await axios.get(`${BASE_URL}/search`, {
            params: searchParams,
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        return response.data.items.map((item: any) => ({
            id: item.id.videoId,
            title: item.snippet.title,
            description: item.snippet.description,
            publishedAt: item.snippet.publishedAt,
            thumbnails: item.snippet.thumbnails,
            channelId: item.snippet.channelId,
            channelTitle: item.snippet.channelTitle
        }));
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`YouTube API error: ${error.response?.data?.error?.message || error.message}`);
        }
        throw error;
    }
};

/**
 * Get videos from a specific channel
 */
export const getChannelVideos = async (params: YouTubeChannelVideosParams): Promise<YouTubeVideo[]> => {
    try {
        const { token, channelId, maxResults = 10, order = 'date' } = params;

        const response = await axios.get(`${BASE_URL}/search`, {
            params: {
                part: 'snippet',
                channelId,
                maxResults,
                order,
                type: 'video'
            },
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        return response.data.items.map((item: any) => ({
            id: item.id.videoId,
            title: item.snippet.title,
            description: item.snippet.description,
            publishedAt: item.snippet.publishedAt,
            thumbnails: item.snippet.thumbnails,
            channelId: item.snippet.channelId,
            channelTitle: item.snippet.channelTitle
        }));
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`YouTube API error: ${error.response?.data?.error?.message || error.message}`);
        }
        throw error;
    }
};

/**
 * Get detailed information about a specific video
 */
export const getVideoDetails = async (params: YouTubeVideoDetailsParams): Promise<any> => {
    try {
        const { token, videoId } = params;

        const response = await axios.get(`${BASE_URL}/videos`, {
            params: {
                part: 'snippet,contentDetails,statistics',
                id: videoId
            },
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (response.data.items.length === 0) {
            throw new Error(`Video with ID ${videoId} not found`);
        }

        const video = response.data.items[0];

        return {
            id: video.id,
            title: video.snippet.title,
            description: video.snippet.description,
            publishedAt: video.snippet.publishedAt,
            thumbnails: video.snippet.thumbnails,
            channelId: video.snippet.channelId,
            channelTitle: video.snippet.channelTitle,
            tags: video.snippet.tags || [],
            categoryId: video.snippet.categoryId,
            duration: video.contentDetails.duration,
            viewCount: video.statistics.viewCount,
            likeCount: video.statistics.likeCount,
            commentCount: video.statistics.commentCount
        };
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`YouTube API error: ${error.response?.data?.error?.message || error.message}`);
        }
        throw error;
    }
};

/**
 * Get channel details by ID or username
 */
export const getChannelDetails = async (params: YouTubeChannelDetailsParams): Promise<YouTubeChannel> => {
    try {
        const { token, channelId, username } = params;

        if (!channelId && !username) {
            throw new Error('Either channelId or username must be provided');
        }

        const searchParams: any = {
            part: 'snippet,contentDetails,statistics'
        };

        if (channelId) {
            searchParams.id = channelId;
        } else if (username) {
            searchParams.forUsername = username;
        }

        const response = await axios.get(`${BASE_URL}/channels`, {
            params: searchParams,
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (response.data.items.length === 0) {
            throw new Error('Channel not found');
        }

        const channel = response.data.items[0];

        return {
            id: channel.id,
            title: channel.snippet.title,
            description: channel.snippet.description,
            customUrl: channel.snippet.customUrl,
            thumbnails: channel.snippet.thumbnails
        };
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`YouTube API error: ${error.response?.data?.error?.message || error.message}`);
        }
        throw error;
    }
};

/**
 * Subscribe to a channel
 */
export const subscribeToChannel = async (token: string, channelId: string): Promise<any> => {
    try {
        const response = await axios.post(
            `${BASE_URL}/subscriptions`,
            {
                snippet: {
                    resourceId: {
                        kind: 'youtube#channel',
                        channelId
                    }
                }
            },
            {
                params: {
                    part: 'snippet'
                },
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        return response.data;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`YouTube API error: ${error.response?.data?.error?.message || error.message}`);
        }
        throw error;
    }
};

/**
 * Check if user is subscribed to a channel
 */
export const checkSubscription = async (token: string, channelId: string): Promise<boolean> => {
    try {
        const response = await axios.get(`${BASE_URL}/subscriptions`, {
            params: {
                part: 'snippet',
                mine: true,
                forChannelId: channelId
            },
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        return response.data.items.length > 0;
    } catch (error) {
        if (axios.isAxiosError(error)) {
            throw new Error(`YouTube API error: ${error.response?.data?.error?.message || error.message}`);
        }
        throw error;
    }
};
