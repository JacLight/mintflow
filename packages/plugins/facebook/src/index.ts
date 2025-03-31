import {
    createPost,
    createPhotoPost,
    createVideoPost,
    getPages
} from './utils.js';

const facebookPlugin = {
    name: "Facebook",
    icon: "",
    description: "Social media platform for connecting with friends and sharing content",
    groups: ["social"],
    tags: ["social","media","platform","network","sharing"],
    version: '1.0.0',
    id: "facebook",
    runner: "node",
    inputSchema: {
        type: "object",
        properties: {
            action: {
                type: 'string',
                enum: [
                    'create_post',
                    'create_photo_post',
                    'create_video_post',
                    'get_pages'
                ],
                description: 'Action to perform on Facebook',
            },
            token: {
                type: 'string',
                description: 'Facebook access token with page management permissions',
            },
            // Fields for page operations
            pageId: {
                type: 'string',
                description: 'Facebook Page ID',
                rules: [
                    { operation: 'notEqual', valueA: 'get_pages', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Fields for post operations
            message: {
                type: 'string',
                description: 'Post message content',
                rules: [
                    { operation: 'notEqual', valueA: 'create_post', valueB: '{{action}}', action: 'hide' },
                ],
            },
            link: {
                type: 'string',
                description: 'URL to include in the post',
                rules: [
                    { operation: 'notEqual', valueA: 'create_post', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Fields for photo post operations
            caption: {
                type: 'string',
                description: 'Caption for the photo',
                rules: [
                    { operation: 'notEqual', valueA: 'create_photo_post', valueB: '{{action}}', action: 'hide' },
                ],
            },
            photoUrl: {
                type: 'string',
                description: 'URL of the photo to post',
                rules: [
                    { operation: 'notEqual', valueA: 'create_photo_post', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Fields for video post operations
            title: {
                type: 'string',
                description: 'Title for the video',
                rules: [
                    { operation: 'notEqual', valueA: 'create_video_post', valueB: '{{action}}', action: 'hide' },
                ],
            },
            description: {
                type: 'string',
                description: 'Description for the video',
                rules: [
                    { operation: 'notEqual', valueA: 'create_video_post', valueB: '{{action}}', action: 'hide' },
                ],
            },
            videoUrl: {
                type: 'string',
                description: 'URL of the video to post',
                rules: [
                    { operation: 'notEqual', valueA: 'create_video_post', valueB: '{{action}}', action: 'hide' },
                ],
            },
        },
        required: ['action', 'token'],
    },
    outputSchema: {
        type: "object",
    },
    exampleInput: {
        action: 'create_post',
        token: 'your-facebook-access-token',
        pageId: '123456789012345',
        message: 'Hello from MintFlow!'
    },
    exampleOutput: {
        id: '123456789012345_987654321098765'
    },
    documentation: "https://developers.facebook.com/docs/",
    method: "exec",
    actions: [
        {
            name: 'facebook',
            execute: async (input: any): Promise<any> => {
                const { action, token } = input;

                if (!action || !token) {
                    throw new Error('Missing required parameters: action, token');
                }

                switch (action) {
                    case 'create_post': {
                        const { pageId, message, link } = input;

                        if (!pageId || !message) {
                            throw new Error('Missing required parameters: pageId, message');
                        }

                        return await createPost({
                            token,
                            pageId,
                            message,
                            link
                        });
                    }

                    case 'create_photo_post': {
                        const { pageId, caption, photoUrl } = input;

                        if (!pageId || !photoUrl) {
                            throw new Error('Missing required parameters: pageId, photoUrl');
                        }

                        return await createPhotoPost({
                            token,
                            pageId,
                            caption,
                            photoUrl
                        });
                    }

                    case 'create_video_post': {
                        const { pageId, title, description, videoUrl } = input;

                        if (!pageId || !videoUrl) {
                            throw new Error('Missing required parameters: pageId, videoUrl');
                        }

                        return await createVideoPost({
                            token,
                            pageId,
                            title,
                            description,
                            videoUrl
                        });
                    }

                    case 'get_pages': {
                        return await getPages(token);
                    }

                    default:
                        throw new Error(`Unsupported action: ${action}`);
                }
            }
        }
    ]
};

export default facebookPlugin;
