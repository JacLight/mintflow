import { ActionDescriptor } from "@mintflow/common";
import axios from 'axios';

export const sendMessage: ActionDescriptor = {
    name: 'send_message',
    description: 'Send a message to a Mattermost channel',
    inputSchema: {
        type: 'object',
        properties: {
            workspace_url: {
                type: 'string',
                description: 'The workspace URL of the Mattermost instance (e.g https://activepieces.mattermost.com)',
                required: true,
            },
            token: {
                type: 'string',
                description: 'The bot token to use to authenticate',
                required: true,
            },
            channel_id: {
                type: 'string',
                description: 'The channel to send the message to, get that ID by clicking on info near start call button',
                required: true,
            },
            text: {
                type: 'string',
                description: 'The text of the message to send',
                required: true,
            },
        },
    },
    outputSchema: {
        type: 'object',
        properties: {
            id: { type: 'string' },
            create_at: { type: 'number' },
            update_at: { type: 'number' },
            edit_at: { type: 'number' },
            delete_at: { type: 'number' },
            is_pinned: { type: 'boolean' },
            user_id: { type: 'string' },
            channel_id: { type: 'string' },
            root_id: { type: 'string' },
            parent_id: { type: 'string' },
            original_id: { type: 'string' },
            message: { type: 'string' },
            type: { type: 'string' },
            props: { type: 'object' },
            hashtags: { type: 'string' },
            pending_post_id: { type: 'string' },
            reply_count: { type: 'number' },
            last_reply_at: { type: 'number' },
            participants: { type: 'array', items: { type: 'string' } },
            metadata: { type: 'object' },
        },
    },
    exampleInput: {
        workspace_url: 'https://example.mattermost.com',
        token: 'your-bot-token',
        channel_id: 'channel-id',
        text: 'Hello from MintFlow!',
    },
    exampleOutput: {
        id: 'post-id',
        create_at: 1625097600000,
        update_at: 1625097600000,
        edit_at: 0,
        delete_at: 0,
        is_pinned: false,
        user_id: 'user-id',
        channel_id: 'channel-id',
        root_id: '',
        parent_id: '',
        original_id: '',
        message: 'Hello from MintFlow!',
        type: '',
        props: {},
        hashtags: '',
        pending_post_id: '',
        reply_count: 0,
        last_reply_at: 0,
        participants: [],
        metadata: {},
    },
    method: 'exec',
    execute: async (input: any, config: any): Promise<any> => {
        try {
            // Remove trailing slash from workspace URL
            const baseUrl = input.workspace_url.replace(/\/$/, '');
            
            try {
                const response = await axios.post(`${baseUrl}/api/v4/posts`, {
                    channel_id: input.channel_id,
                    message: input.text,
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${input.token}`,
                    },
                });
                
                return response.data;
            } catch (error: any) {
                if (error.response && error.response.status === 403) {
                    throw new Error('Please make sure you have the correct bot token and channel ID.');
                }
                throw new Error(`Mattermost API error: ${error.response?.data?.message || error.message}`);
            }
        } catch (error: any) {
            throw new Error(`Failed to send message to Mattermost: ${error.message}`);
        }
    },
};

export default sendMessage;
