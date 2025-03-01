import axios from 'axios';
import { customApiCall } from '../src/actions/custom-api-call';

// Mock axios
jest.mock('axios');

describe('custom_api_call action', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should make a GET request to the Mattermost API', async () => {
        // Mock response
        const mockResponse = {
            data: [
                { id: 'user1', username: 'user1', email: 'user1@example.com' },
                { id: 'user2', username: 'user2', email: 'user2@example.com' }
            ]
        };
        
        // @ts-ignore
        axios.mockImplementationOnce(() => Promise.resolve(mockResponse));

        // Test input
        const input = {
            workspace_url: 'https://example.mattermost.com',
            token: 'your-bot-token',
            method: 'GET',
            path: '/api/v4/users',
            queryParams: {
                per_page: 100,
                page: 0
            }
        };

        // Execute the action
        const result = await customApiCall.execute!(input, {});

        // Verify the result
        expect(result).toEqual(mockResponse.data);

        // Verify that axios was called with the correct parameters
        expect(axios).toHaveBeenCalledWith({
            method: 'GET',
            url: 'https://example.mattermost.com/api/v4/users',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer your-bot-token',
            },
            data: undefined,
            params: {
                per_page: 100,
                page: 0
            }
        });
    });

    it('should make a POST request to the Mattermost API', async () => {
        // Mock response
        const mockResponse = {
            data: {
                id: 'channel-id',
                name: 'channel-name',
                display_name: 'Channel Display Name',
                type: 'O'
            }
        };
        
        // @ts-ignore
        axios.mockImplementationOnce(() => Promise.resolve(mockResponse));

        // Test input
        const input = {
            workspace_url: 'https://example.mattermost.com',
            token: 'your-bot-token',
            method: 'POST',
            path: '/api/v4/channels',
            body: {
                team_id: 'team-id',
                name: 'channel-name',
                display_name: 'Channel Display Name',
                type: 'O'
            }
        };

        // Execute the action
        const result = await customApiCall.execute!(input, {});

        // Verify the result
        expect(result).toEqual(mockResponse.data);

        // Verify that axios was called with the correct parameters
        expect(axios).toHaveBeenCalledWith({
            method: 'POST',
            url: 'https://example.mattermost.com/api/v4/channels',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer your-bot-token',
            },
            data: {
                team_id: 'team-id',
                name: 'channel-name',
                display_name: 'Channel Display Name',
                type: 'O'
            },
            params: undefined
        });
    });

    it('should handle path with or without leading slash', async () => {
        // Mock response
        const mockResponse = {
            data: { success: true }
        };
        
        // @ts-ignore
        axios.mockImplementationOnce(() => Promise.resolve(mockResponse));
        // @ts-ignore
        axios.mockImplementationOnce(() => Promise.resolve(mockResponse));

        // Test input with leading slash
        const inputWithSlash = {
            workspace_url: 'https://example.mattermost.com',
            token: 'your-bot-token',
            method: 'GET',
            path: '/api/v4/users'
        };

        // Execute the action
        await customApiCall.execute!(inputWithSlash, {});

        // Verify that axios was called with the correct URL
        expect(axios).toHaveBeenCalledWith(expect.objectContaining({
            url: 'https://example.mattermost.com/api/v4/users'
        }));

        // Test input without leading slash
        const inputWithoutSlash = {
            workspace_url: 'https://example.mattermost.com',
            token: 'your-bot-token',
            method: 'GET',
            path: 'api/v4/users'
        };

        // Execute the action
        await customApiCall.execute!(inputWithoutSlash, {});

        // Verify that axios was called with the correct URL
        expect(axios).toHaveBeenCalledWith(expect.objectContaining({
            url: 'https://example.mattermost.com/api/v4/users'
        }));
    });

    it('should handle API errors', async () => {
        // Mock error response
        const errorResponse = {
            response: {
                status: 404,
                data: {
                    message: 'Resource not found',
                },
                statusText: 'Not Found'
            },
        };
        
        // @ts-ignore
        axios.mockImplementationOnce(() => Promise.reject(errorResponse));

        // Test input
        const input = {
            workspace_url: 'https://example.mattermost.com',
            token: 'your-bot-token',
            method: 'GET',
            path: '/api/v4/nonexistent'
        };

        // Execute the action and expect it to throw an error
        try {
            await customApiCall.execute!(input, {});
            fail('Expected an error to be thrown');
        } catch (error: any) {
            expect(error.message).toContain('Resource not found');
        }
    });

    it('should handle generic errors', async () => {
        // Mock network error
        // @ts-ignore
        axios.mockImplementationOnce(() => Promise.reject(new Error('Network error')));

        // Test input
        const input = {
            workspace_url: 'https://example.mattermost.com',
            token: 'your-bot-token',
            method: 'GET',
            path: '/api/v4/users'
        };

        // Execute the action and expect it to throw an error
        try {
            await customApiCall.execute!(input, {});
            fail('Expected an error to be thrown');
        } catch (error: any) {
            expect(error.message).toContain('Network error');
        }
    });
});
