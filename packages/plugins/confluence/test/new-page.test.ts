import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { newPage } from '../src/triggers/new-page.js';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('newPage trigger', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should store last check time on enable', async () => {
        const context = {
            store: {} as { lastCheckTime?: string },
        };

        await newPage.onEnable(context);

        expect(context.store.lastCheckTime).toBeDefined();
        expect(new Date(context.store.lastCheckTime!).getTime()).toBeLessThanOrEqual(Date.now());
    });

    it('should fetch new pages since last check', async () => {
        // Mock successful response
        mockedAxios.mockResolvedValueOnce({
            data: {
                results: [
                    {
                        id: '123456789',
                        title: 'New Page 1',
                        status: 'current',
                        spaceId: 'SPACE123',
                        createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
                    },
                    {
                        id: '987654321',
                        title: 'New Page 2',
                        status: 'current',
                        spaceId: 'SPACE123',
                        createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(), // 10 minutes ago
                    },
                ],
            },
        });

        const context = {
            input: {
                username: 'test@example.com',
                password: 'api-token',
                confluenceDomain: 'https://example.atlassian.net',
                spaceId: 'SPACE123',
            },
            store: {
                lastCheckTime: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 minutes ago
            },
        };

        const result = await newPage.run(context);

        // Verify axios was called with the correct parameters
        expect(mockedAxios).toHaveBeenCalledWith({
            method: 'GET',
            url: 'https://example.atlassian.net/wiki/api/v2/spaces/SPACE123/pages',
            headers: {
                'Authorization': expect.any(String),
                'Content-Type': 'application/json',
            },
            params: {
                limit: '50',
                sort: '-created-date',
            },
            data: undefined,
        });

        // Verify the result contains both pages
        expect(result).toHaveLength(2);
        expect(result[0].id).toBe('123456789');
        expect(result[1].id).toBe('987654321');

        // Verify lastCheckTime was updated
        expect(context.store.lastCheckTime).toBeDefined();
        expect(new Date(context.store.lastCheckTime).getTime()).toBeLessThanOrEqual(Date.now());
    });

    it('should filter out pages created before last check', async () => {
        // Mock successful response
        mockedAxios.mockResolvedValueOnce({
            data: {
                results: [
                    {
                        id: '123456789',
                        title: 'New Page 1',
                        status: 'current',
                        spaceId: 'SPACE123',
                        createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(), // 5 minutes ago
                    },
                    {
                        id: '987654321',
                        title: 'Old Page',
                        status: 'current',
                        spaceId: 'SPACE123',
                        createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(), // 10 minutes ago
                    },
                ],
            },
        });

        const context = {
            input: {
                username: 'test@example.com',
                password: 'api-token',
                confluenceDomain: 'https://example.atlassian.net',
                spaceId: 'SPACE123',
            },
            store: {
                lastCheckTime: new Date(Date.now() - 1000 * 60 * 7).toISOString(), // 7 minutes ago
            },
        };

        const result = await newPage.run(context);

        // Verify the result contains only the new page
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('123456789');
    });

    it('should return sample data for test method', async () => {
        // Mock successful response
        mockedAxios.mockResolvedValueOnce({
            data: {
                results: [
                    {
                        id: '123456789',
                        title: 'Test Page',
                        status: 'current',
                        spaceId: 'SPACE123',
                        createdAt: new Date().toISOString(),
                    },
                ],
            },
        });

        const context = {
            input: {
                username: 'test@example.com',
                password: 'api-token',
                confluenceDomain: 'https://example.atlassian.net',
                spaceId: 'SPACE123',
            },
        };

        const result = await newPage.test(context);

        // Verify the result contains the test page
        expect(result).toHaveLength(1);
        expect(result[0].id).toBe('123456789');
    });

    it('should return sample data when no pages found', async () => {
        // Mock empty response
        mockedAxios.mockResolvedValueOnce({
            data: {
                results: [],
            },
        });

        const context = {
            input: {
                username: 'test@example.com',
                password: 'api-token',
                confluenceDomain: 'https://example.atlassian.net',
                spaceId: 'SPACE123',
            },
        };

        const result = await newPage.test(context);

        // Verify the result contains the example output
        expect(result).toHaveLength(1);
        expect(result[0]).toEqual(newPage.exampleOutput);
    });

    it('should handle API errors', async () => {
        // Mock axios.isAxiosError function
        jest.spyOn(axios, 'isAxiosError').mockImplementation(() => true);

        // Mock error
        const error = new Error('API error');
        mockedAxios.mockRejectedValueOnce(error);

        const context = {
            input: {
                username: 'test@example.com',
                password: 'api-token',
                confluenceDomain: 'https://example.atlassian.net',
                spaceId: 'SPACE123',
            },
            store: {
                lastCheckTime: new Date().toISOString(),
            },
        };

        // Execute the trigger and expect it to throw an error
        await expect(newPage.run(context)).rejects.toThrow('Failed to fetch new pages: Confluence API error: API error');
    });
});
