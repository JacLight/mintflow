import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { getPageContent } from '../src/actions/get-page-content.js';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('getPageContent action', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should get page content successfully', async () => {
        // Mock successful response
        mockedAxios.mockResolvedValueOnce({
            data: {
                id: '123456789',
                title: 'Test Page',
                body: {
                    storage: {
                        value: '<p>This is a test page</p>',
                        representation: 'storage',
                    },
                },
            },
        });

        // Execute the action
        const result = await getPageContent.execute({
            username: 'test@example.com',
            password: 'api-token',
            confluenceDomain: 'https://example.atlassian.net',
            pageId: '123456789',
            includeDescendants: false,
        }, {});

        // Verify axios was called with the correct parameters
        expect(mockedAxios).toHaveBeenCalledWith({
            method: 'GET',
            url: 'https://example.atlassian.net/wiki/api/v2/pages/123456789',
            headers: {
                'Authorization': expect.any(String),
                'Content-Type': 'application/json',
            },
            params: {
                'body-format': 'storage',
            },
            data: undefined,
        });

        // Verify the result
        expect(result).toEqual({
            id: '123456789',
            title: 'Test Page',
            body: {
                storage: {
                    value: '<p>This is a test page</p>',
                    representation: 'storage',
                },
            },
        });
    });

    it('should get page content with descendants', async () => {
        // Mock successful responses
        // First call - get main page
        mockedAxios.mockResolvedValueOnce({
            data: {
                id: '123456789',
                title: 'Test Page',
                body: {
                    storage: {
                        value: '<p>This is a test page</p>',
                        representation: 'storage',
                    },
                },
            },
        });

        // Second call - get children
        mockedAxios.mockResolvedValueOnce({
            data: {
                results: [
                    {
                        id: '987654321',
                        title: 'Child Page',
                    },
                ],
            },
        });

        // Third call - get child page content
        mockedAxios.mockResolvedValueOnce({
            data: {
                id: '987654321',
                title: 'Child Page',
                body: {
                    storage: {
                        value: '<p>This is a child page</p>',
                        representation: 'storage',
                    },
                },
            },
        });

        // Fourth call - get grandchildren (empty)
        mockedAxios.mockResolvedValueOnce({
            data: {
                results: [],
            },
        });

        // Execute the action
        const result = await getPageContent.execute({
            username: 'test@example.com',
            password: 'api-token',
            confluenceDomain: 'https://example.atlassian.net',
            pageId: '123456789',
            includeDescendants: true,
            maxDepth: 2,
        }, {});

        // Verify axios was called the correct number of times
        expect(mockedAxios).toHaveBeenCalledTimes(3);

        // Verify the result
        expect(result).toEqual({
            id: '123456789',
            title: 'Test Page',
            body: {
                storage: {
                    value: '<p>This is a test page</p>',
                    representation: 'storage',
                },
            },
            children: [
                {
                    id: '987654321',
                    title: 'Child Page',
                    body: {
                        storage: {
                            value: '<p>This is a child page</p>',
                            representation: 'storage',
                        },
                    },
                    children: [],
                },
            ],
        });
    });

    it('should handle API errors', async () => {
        // Mock the confluenceApiCall function to throw an error
        jest.spyOn(axios, 'isAxiosError').mockImplementation(() => true);

        // Create a mock implementation of confluenceApiCall that throws an error
        jest.spyOn(require('../src/common/index.js'), 'confluenceApiCall').mockImplementation(() => {
            throw new Error('API error');
        });

        // Execute the action and expect it to throw an error
        await expect(getPageContent.execute({
            username: 'test@example.com',
            password: 'api-token',
            confluenceDomain: 'https://example.atlassian.net',
            pageId: '123456789',
            includeDescendants: false,
        }, {})).rejects.toThrow('Failed to fetch page 123456789: API error');
    });
});
