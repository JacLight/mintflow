import axios from 'axios';
import { sendMessage } from '../src/actions/send-message';

// Mock axios
jest.mock('axios');

describe('send_message action', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should send a message to a Mattermost channel', async () => {
        // Mock response
        const mockResponse = {
            data: {
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
            }
        };
        
        // @ts-ignore
        axios.post.mockResolvedValueOnce(mockResponse);

        // Test input
        const input = {
            workspace_url: 'https://example.mattermost.com',
            token: 'your-bot-token',
            channel_id: 'channel-id',
            text: 'Hello from MintFlow!',
        };

        // Execute the action
        const result = await sendMessage.execute!(input, {});

        // Verify the result
        expect(result).toEqual(mockResponse.data);

        // Verify that axios was called with the correct parameters
        expect(axios.post).toHaveBeenCalledWith(
            'https://example.mattermost.com/api/v4/posts',
            {
                channel_id: 'channel-id',
                message: 'Hello from MintFlow!',
            },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer your-bot-token',
                },
            }
        );
    });

    it('should handle trailing slash in workspace URL', async () => {
        // Mock response
        const mockResponse = {
            data: {
                id: 'post-id',
                message: 'Hello from MintFlow!',
                // ... other fields
            }
        };
        
        // @ts-ignore
        axios.post.mockResolvedValueOnce(mockResponse);

        // Test input with trailing slash
        const input = {
            workspace_url: 'https://example.mattermost.com/',
            token: 'your-bot-token',
            channel_id: 'channel-id',
            text: 'Hello from MintFlow!',
        };

        // Execute the action
        await sendMessage.execute!(input, {});

        // Verify that axios was called with the correct URL (without trailing slash)
        expect(axios.post).toHaveBeenCalledWith(
            'https://example.mattermost.com/api/v4/posts',
            expect.any(Object),
            expect.any(Object)
        );
    });

    it('should handle API errors', async () => {
        // Mock error response
        const errorResponse = {
            response: {
                status: 403,
                data: {
                    message: 'Authentication failed',
                },
            },
        };
        
        // @ts-ignore
        axios.post.mockRejectedValueOnce(errorResponse);

        // Test input
        const input = {
            workspace_url: 'https://example.mattermost.com',
            token: 'invalid-token',
            channel_id: 'channel-id',
            text: 'Hello from MintFlow!',
        };

        // Execute the action and expect it to throw an error
        try {
            await sendMessage.execute!(input, {});
            fail('Expected an error to be thrown');
        } catch (error: any) {
            expect(error.message).toContain('Failed to send message to Mattermost: Please make sure you have the correct bot token and channel ID.');
        }
    });

    it('should handle generic errors', async () => {
        // Mock network error
        // @ts-ignore
        axios.post.mockRejectedValueOnce(new Error('Network error'));

        // Test input
        const input = {
            workspace_url: 'https://example.mattermost.com',
            token: 'your-bot-token',
            channel_id: 'channel-id',
            text: 'Hello from MintFlow!',
        };

        // Execute the action and expect it to throw an error
        try {
            await sendMessage.execute!(input, {});
            fail('Expected an error to be thrown');
        } catch (error: any) {
            expect(error.message).toContain('Network error');
        }
    });
});
