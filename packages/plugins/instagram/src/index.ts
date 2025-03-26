import {
    getInstagramAccounts,
    uploadPhoto,
    uploadReel
} from './utils';

const instagramPlugin = {
    name: "Instagram",
    icon: "",
    description: "Social media platform for sharing photos and videos",
    groups: ["social"],
    tags: ["social","media","platform","network","sharing"],
    version: '1.0.0',
    id: "instagram",
    runner: "node",
    inputSchema: {
        type: "object",
        properties: {
            action: {
                type: 'string',
                enum: [
                    'get_accounts',
                    'upload_photo',
                    'upload_reel'
                ],
                description: 'Action to perform on Instagram',
            },
            token: {
                type: 'string',
                description: 'Facebook access token with Instagram permissions',
            },
            // Fields for account operations
            accountId: {
                type: 'string',
                description: 'Instagram Business Account ID',
                rules: [
                    { operation: 'notEqual', valueA: 'get_accounts', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Fields for photo operations
            photoUrl: {
                type: 'string',
                description: 'URL of the photo to upload (JPG only)',
                rules: [
                    { operation: 'notEqual', valueA: 'upload_photo', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Fields for video operations
            videoUrl: {
                type: 'string',
                description: 'URL of the video to upload (Limit: 1GB or 15 minutes)',
                rules: [
                    { operation: 'notEqual', valueA: 'upload_reel', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Fields for both photo and video
            caption: {
                type: 'string',
                description: 'Caption for the media',
                rules: [
                    { operation: 'notEqual', valueA: 'upload_photo', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'upload_reel', valueB: '{{action}}', action: 'hide' },
                ],
            },
        },
        required: ['action', 'token'],
    },
    outputSchema: {
        type: "object",
    },
    exampleInput: {
        action: 'upload_photo',
        token: 'your-facebook-access-token',
        accountId: '123456789012345',
        photoUrl: 'https://example.com/photo.jpg',
        caption: 'Hello from MintFlow!'
    },
    exampleOutput: {
        id: '123456789012345_987654321098765'
    },
    documentation: "https://developers.facebook.com/docs/instagram-api/",
    method: "exec",
    actions: [
        {
            name: 'instagram',
            execute: async (input: any): Promise<any> => {
                const { action, token } = input;

                if (!action || !token) {
                    throw new Error('Missing required parameters: action, token');
                }

                switch (action) {
                    case 'get_accounts': {
                        return await getInstagramAccounts(token);
                    }

                    case 'upload_photo': {
                        const { accountId, photoUrl, caption } = input;

                        if (!accountId || !photoUrl) {
                            throw new Error('Missing required parameters: accountId, photoUrl');
                        }

                        return await uploadPhoto({
                            token,
                            accountId,
                            photoUrl,
                            caption
                        });
                    }

                    case 'upload_reel': {
                        const { accountId, videoUrl, caption } = input;

                        if (!accountId || !videoUrl) {
                            throw new Error('Missing required parameters: accountId, videoUrl');
                        }

                        return await uploadReel({
                            token,
                            accountId,
                            videoUrl,
                            caption
                        });
                    }

                    default:
                        throw new Error(`Unsupported action: ${action}`);
                }
            }
        }
    ]
};

export default instagramPlugin;
