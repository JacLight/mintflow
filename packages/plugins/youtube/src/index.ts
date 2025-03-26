import {
    searchVideos,
    getChannelVideos,
    getVideoDetails,
    getChannelDetails,
    subscribeToChannel,
    checkSubscription
} from './utils';

const youtubePlugin = {
    name: "YouTube",
    icon: "",
    description: "Video sharing platform for watching, uploading, and sharing videos",
    groups: ["social"],
    tags: ["social","media","platform","network","sharing"],
    version: '1.0.0',
    id: "youtube",
    runner: "node",
    inputSchema: {
        type: "object",
        properties: {
            action: {
                type: 'string',
                enum: [
                    'search_videos',
                    'get_channel_videos',
                    'get_video_details',
                    'get_channel_details',
                    'subscribe_to_channel',
                    'check_subscription'
                ],
                description: 'Action to perform on YouTube',
            },
            token: {
                type: 'string',
                description: 'YouTube API OAuth token',
            },
            // Fields for search_videos
            query: {
                type: 'string',
                description: 'Search query',
                rules: [
                    { operation: 'notEqual', valueA: 'search_videos', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Fields for get_channel_videos
            channelId: {
                type: 'string',
                description: 'YouTube Channel ID',
                rules: [
                    { operation: 'notEqual', valueA: 'get_channel_videos', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'get_channel_details', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'subscribe_to_channel', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'check_subscription', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Fields for get_video_details
            videoId: {
                type: 'string',
                description: 'YouTube Video ID',
                rules: [
                    { operation: 'notEqual', valueA: 'get_video_details', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Fields for get_channel_details
            username: {
                type: 'string',
                description: 'YouTube Channel Username (alternative to channelId)',
                rules: [
                    { operation: 'notEqual', valueA: 'get_channel_details', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Common fields
            maxResults: {
                type: 'number',
                description: 'Maximum number of results to return (default: 10, max: 50)',
                rules: [
                    { operation: 'notEqual', valueA: 'search_videos', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'get_channel_videos', valueB: '{{action}}', action: 'hide' },
                ],
            },
            order: {
                type: 'string',
                enum: ['date', 'rating', 'relevance', 'title', 'videoCount', 'viewCount'],
                description: 'Order of results',
                rules: [
                    { operation: 'notEqual', valueA: 'search_videos', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'get_channel_videos', valueB: '{{action}}', action: 'hide' },
                ],
            },
        },
        required: ['action', 'token'],
    },
    outputSchema: {
        type: "object",
    },
    exampleInput: {
        action: 'search_videos',
        token: 'your-youtube-api-token',
        query: 'MintFlow tutorial',
        maxResults: 5,
        order: 'relevance'
    },
    exampleOutput: [
        {
            id: 'video-id-1',
            title: 'Getting Started with MintFlow',
            description: 'Learn how to use MintFlow for workflow automation',
            publishedAt: '2023-01-01T00:00:00Z',
            thumbnails: {
                default: { url: 'https://i.ytimg.com/vi/video-id-1/default.jpg', width: 120, height: 90 },
                medium: { url: 'https://i.ytimg.com/vi/video-id-1/mqdefault.jpg', width: 320, height: 180 },
                high: { url: 'https://i.ytimg.com/vi/video-id-1/hqdefault.jpg', width: 480, height: 360 }
            },
            channelId: 'channel-id',
            channelTitle: 'MintFlow Official'
        }
    ],
    documentation: "https://developers.google.com/youtube/v3/docs",
    method: "exec",
    actions: [
        {
            name: 'youtube',
            execute: async (input: any): Promise<any> => {
                const { action, token } = input;

                if (!action || !token) {
                    throw new Error('Missing required parameters: action, token');
                }

                switch (action) {
                    case 'search_videos': {
                        const { query, maxResults, order, channelId } = input;

                        if (!query) {
                            throw new Error('Missing required parameter: query');
                        }

                        return await searchVideos({
                            token,
                            query,
                            maxResults,
                            order,
                            channelId
                        });
                    }

                    case 'get_channel_videos': {
                        const { channelId, maxResults, order } = input;

                        if (!channelId) {
                            throw new Error('Missing required parameter: channelId');
                        }

                        return await getChannelVideos({
                            token,
                            channelId,
                            maxResults,
                            order
                        });
                    }

                    case 'get_video_details': {
                        const { videoId } = input;

                        if (!videoId) {
                            throw new Error('Missing required parameter: videoId');
                        }

                        return await getVideoDetails({
                            token,
                            videoId
                        });
                    }

                    case 'get_channel_details': {
                        const { channelId, username } = input;

                        if (!channelId && !username) {
                            throw new Error('Missing required parameter: either channelId or username must be provided');
                        }

                        return await getChannelDetails({
                            token,
                            channelId,
                            username
                        });
                    }

                    case 'subscribe_to_channel': {
                        const { channelId } = input;

                        if (!channelId) {
                            throw new Error('Missing required parameter: channelId');
                        }

                        return await subscribeToChannel(token, channelId);
                    }

                    case 'check_subscription': {
                        const { channelId } = input;

                        if (!channelId) {
                            throw new Error('Missing required parameter: channelId');
                        }

                        return await checkSubscription(token, channelId);
                    }

                    default:
                        throw new Error(`Unsupported action: ${action}`);
                }
            }
        }
    ]
};

export default youtubePlugin;
