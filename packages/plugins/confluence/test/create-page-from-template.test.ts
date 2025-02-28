import { describe, it, expect, jest, beforeEach } from '@jest/globals';
import { createPageFromTemplate } from '../src/actions/create-page-from-template.js';
import axios from 'axios';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('createPageFromTemplate action', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create a page from template successfully', async () => {
        // Mock successful responses
        // First call - get template content
        mockedAxios.mockResolvedValueOnce({
            data: {
                body: {
                    storage: {
                        value: '<at:declarations><at:string at:name="variable1"/></at:declarations><p>Content with <at:var at:name="variable1"/></p>',
                    },
                },
            },
        });

        // Second call - create page
        mockedAxios.mockResolvedValueOnce({
            data: {
                id: '123456789',
                title: 'New Page',
                status: 'draft',
                _links: {
                    webui: '/spaces/SPACE/pages/123456789/New+Page',
                },
            },
        });

        // Execute the action
        const result = await createPageFromTemplate.execute({
            username: 'test@example.com',
            password: 'api-token',
            confluenceDomain: 'https://example.atlassian.net',
            spaceId: 'SPACE123',
            templateId: 'TEMPLATE123',
            folderId: 'FOLDER123',
            title: 'New Page',
            status: 'draft',
            templateVariables: {
                variable1: 'Test Value',
            },
        }, {});

        // Verify axios was called with the correct parameters for template fetch
        expect(mockedAxios).toHaveBeenNthCalledWith(1, {
            method: 'GET',
            url: 'https://example.atlassian.net/wiki/rest/api/template/TEMPLATE123',
            headers: {
                'Authorization': expect.any(String),
                'Content-Type': 'application/json',
            },
            params: undefined,
            data: undefined,
        });

        // Verify axios was called with the correct parameters for page creation
        expect(mockedAxios).toHaveBeenNthCalledWith(2, {
            method: 'POST',
            url: 'https://example.atlassian.net/wiki/api/v2/pages',
            headers: {
                'Authorization': expect.any(String),
                'Content-Type': 'application/json',
            },
            params: undefined,
            data: {
                spaceId: 'SPACE123',
                title: 'New Page',
                parentId: 'FOLDER123',
                status: 'draft',
                body: {
                    representation: 'storage',
                    value: '<p>Content with Test Value</p>',
                },
            },
        });

        // Verify the result
        expect(result).toEqual({
            id: '123456789',
            title: 'New Page',
            status: 'draft',
            _links: {
                webui: '/spaces/SPACE/pages/123456789/New+Page',
            },
        });
    });

    it('should create a page with minimal parameters', async () => {
        // Mock successful responses
        // First call - get template content
        mockedAxios.mockResolvedValueOnce({
            data: {
                body: {
                    storage: {
                        value: '<p>Simple template content</p>',
                    },
                },
            },
        });

        // Second call - create page
        mockedAxios.mockResolvedValueOnce({
            data: {
                id: '123456789',
                title: 'New Page',
                status: 'current',
                _links: {
                    webui: '/spaces/SPACE/pages/123456789/New+Page',
                },
            },
        });

        // Execute the action with minimal parameters
        const result = await createPageFromTemplate.execute({
            username: 'test@example.com',
            password: 'api-token',
            confluenceDomain: 'https://example.atlassian.net',
            spaceId: 'SPACE123',
            templateId: 'TEMPLATE123',
            title: 'New Page',
            status: 'current',
        }, {});

        // Verify axios was called with the correct parameters for page creation
        expect(mockedAxios).toHaveBeenNthCalledWith(2, {
            method: 'POST',
            url: 'https://example.atlassian.net/wiki/api/v2/pages',
            headers: {
                'Authorization': expect.any(String),
                'Content-Type': 'application/json',
            },
            params: undefined,
            data: {
                spaceId: 'SPACE123',
                title: 'New Page',
                parentId: undefined,
                status: 'current',
                body: {
                    representation: 'storage',
                    value: '<p>Simple template content</p>',
                },
            },
        });
    });

    it('should handle API errors', async () => {
        // Mock axios.isAxiosError function
        jest.spyOn(axios, 'isAxiosError').mockImplementation(() => true);

        // Mock error
        const error = new Error('API error');
        mockedAxios.mockRejectedValueOnce(error);

        // Execute the action and expect it to throw an error
        await expect(createPageFromTemplate.execute({
            username: 'test@example.com',
            password: 'api-token',
            confluenceDomain: 'https://example.atlassian.net',
            spaceId: 'SPACE123',
            templateId: 'TEMPLATE123',
            title: 'New Page',
            status: 'draft',
        }, {})).rejects.toThrow('Failed to create page from template: Confluence API error: API error');
    });
});
