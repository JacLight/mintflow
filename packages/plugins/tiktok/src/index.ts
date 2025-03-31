import {
    getUserVideos,
    getVideoDetails,
    getUserDetails,
    uploadVideo
} from './utils.js';

const tiktokPlugin = {
    name: "TikTok",
    icon: "",
    description: "Short-form video hosting service for creating and sharing videos",
    groups: ["social"],
    tags: ["social","media","platform","network","sharing"],
    version: '1.0.0',
    id: "tiktok",
    runner: "node",
    inputSchema: {
        type: "object",
        properties: {
            action: {
                type: 'string',
                enum: [
                    'get_user_videos',
                    'get_video_details',
                    'get_user_details',
                    'upload_video'
                ],
                description: 'Action to perform on TikTok',
            },
            token: {
                type: 'string',
                description: 'TikTok API OAuth token',
            },
            // Fields for user operations
            userId: {
                type: 'string',
                description: 'TikTok User ID',
                rules: [
                    { operation: 'notEqual', valueA: 'get_user_videos', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'get_user_details', valueB: '{{action}}', action: 'hide' },
                ],
            },
            username: {
                type: 'string',
                description: 'TikTok Username (alternative to userId)',
                rules: [
                    { operation: 'notEqual', valueA: 'get_user_details', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Fields for video operations
            videoId: {
                type: 'string',
                description: 'TikTok Video ID',
                rules: [
                    { operation: 'notEqual', valueA: 'get_video_details', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Fields for upload operations
            videoUrl: {
                type: 'string',
                description: 'URL of the video to upload',
                rules: [
                    { operation: 'notEqual', valueA: 'upload_video', valueB: '{{action}}', action: 'hide' },
                ],
            },
            description: {
                type: 'string',
                description: 'Description for the video',
                rules: [
                    { operation: 'notEqual', valueA: 'upload_video', valueB: '{{action}}', action: 'hide' },
                ],
            },
            privacy: {
                type: 'string',
                enum: ['public', 'private', 'friends'],
                description: 'Privacy setting for the video',
                rules: [
                    { operation: 'notEqual', valueA: 'upload_video', valueB: '{{action}}', action: 'hide' },
                ],
            },
            disableComments: {
                type: 'boolean',
                description: 'Disable comments on the video',
                rules: [
                    { operation: 'notEqual', valueA: 'upload_video', valueB: '{{action}}', action: 'hide' },
                ],
            },
            disableDuet: {
                type: 'boolean',
                description: 'Disable duet feature for the video',
                rules: [
                    { operation: 'notEqual', valueA: 'upload_video', valueB: '{{action}}', action: 'hide' },
                ],
            },
            disableStitch: {
                type: 'boolean',
                description: 'Disable stitch feature for the video',
                rules: [
                    { operation: 'notEqual', valueA: 'upload_video', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Common fields
            maxResults: {
                type: 'number',
                description: 'Maximum number of results to return (default: 10)',
                rules: [
                    { operation: 'notEqual', valueA: 'get_user_videos', valueB: '{{action}}', action: 'hide' },
                ],
            },
        },
        required: ['action', 'token'],
    },
    outputSchema: {
        type: "object",
    },
    exampleInput: {
        action: 'get_user_videos',
        token: 'your-tiktok-api-token',
        userId: 'user-id',
        maxResults: 5
    },
    exampleOutput: [
        {
            id: 'video-id-1',
            title: 'My TikTok Video',
            description: 'Check out this cool video!',
            createTime: '2023-01-01T00:00:00Z',
            coverUrl: 'https://p16-sign.tiktokcdn-us.com/obj/tos-useast5-p-0068-tx/cover-image.jpeg',
            shareUrl: 'https://www.tiktok.com/@username/video/video-id-1',
            videoUrl: 'https://v16-webapp.tiktok.com/video.mp4',
            duration: 15,
            width: 1080,
            height: 1920,
            statistics: {
                commentCount: 100,
                likeCount: 1000,
                shareCount: 50,
                viewCount: 10000
            }
        }
    ],
    documentation: "https://developers.tiktok.com/doc/",
    method: "exec",
    actions: [
        {
            name: 'tiktok',
            execute: async (input: any): Promise<any> => {
                const { action, token } = input;

                if (!action || !token) {
                    throw new Error('Missing required parameters: action, token');
                }

                switch (action) {
                    case 'get_user_videos': {
                        const { userId, maxResults } = input;

                        return await getUserVideos({
                            token,
                            userId,
                            maxResults
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

                    case 'get_user_details': {
                        const { userId, username } = input;

                        if (!userId && !username) {
                            throw new Error('Missing required parameter: either userId or username must be provided');
                        }

                        return await getUserDetails({
                            token,
                            userId,
                            username
                        });
                    }

                    case 'upload_video': {
                        const { videoUrl, description, privacy, disableComments, disableDuet, disableStitch } = input;

                        if (!videoUrl) {
                            throw new Error('Missing required parameter: videoUrl');
                        }

                        return await uploadVideo({
                            token,
                            videoUrl,
                            description,
                            privacy,
                            disableComments,
                            disableDuet,
                            disableStitch
                        });
                    }

                    default:
                        throw new Error(`Unsupported action: ${action}`);
                }
            }
        }
    ]
};

export default tiktokPlugin;
