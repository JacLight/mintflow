import { createPageAction } from '../../src/actions/create-page.js';
import * as common from '../../src/common/index.js';
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

describe('createPageAction', () => {
    let mockClient: any;
    let createClientSpy: any;

    beforeEach(() => {
        // Setup mock client
        mockClient = {
            urlExists: jest.fn(),
            createPage: jest.fn(),
            uploadMedia: jest.fn()
        };

        // Create spy on createClient
        createClientSpy = jest.spyOn(common, 'createClient').mockReturnValue(mockClient);
    });

    afterEach(() => {
        // Restore original function
        createClientSpy.mockRestore();
    });

    it('should create a page successfully', async () => {
        // Mock successful responses
        mockClient.urlExists.mockResolvedValue(true);
        mockClient.createPage.mockResolvedValue({
            data: {
                id: 'page123',
                title: { rendered: 'Test Page' },
                slug: 'test-page',
                link: 'https://example.com/test-page'
            }
        });

        // Execute the action
        const result = await createPageAction.execute({
            accessToken: {
                username: 'test-user',
                password: 'test-pass',
                websiteUrl: 'https://example.com'
            },
            title: 'Test Page',
            content: 'This is a test page content'
        });

        // Verify the client was created with the correct credentials
        expect(common.createClient).toHaveBeenCalledWith({
            username: 'test-user',
            password: 'test-pass',
            websiteUrl: 'https://example.com'
        });

        // Verify urlExists was called with the correct URL
        expect(mockClient.urlExists).toHaveBeenCalledWith('https://example.com');

        // Verify createPage was called with the correct parameters
        expect(mockClient.createPage).toHaveBeenCalledWith({
            title: 'Test Page',
            content: 'This is a test page content'
        });

        // Verify the result
        expect(result).toEqual({
            id: 'page123',
            title: 'Test Page',
            slug: 'test-page',
            link: 'https://example.com/test-page'
        });
    });

    it('should handle invalid website URL', async () => {
        // Mock invalid website URL
        mockClient.urlExists.mockResolvedValue(false);

        // Execute the action
        const result = await createPageAction.execute({
            accessToken: {
                username: 'test-user',
                password: 'test-pass',
                websiteUrl: 'https://invalid-site.com'
            },
            title: 'Test Page',
            content: 'This is a test page content'
        });

        // Verify the error is returned
        expect(result).toEqual({
            error: 'Website URL is invalid: https://invalid-site.com'
        });
    });

    it('should handle API errors', async () => {
        // Mock successful URL check but API error
        mockClient.urlExists.mockResolvedValue(true);
        mockClient.createPage.mockResolvedValue({
            error: 'API error'
        });

        // Execute the action
        const result = await createPageAction.execute({
            accessToken: {
                username: 'test-user',
                password: 'test-pass',
                websiteUrl: 'https://example.com'
            },
            title: 'Test Page',
            content: 'This is a test page content'
        });

        // Verify the error is returned
        expect(result).toEqual({
            error: 'API error'
        });
    });

    it('should handle exceptions', async () => {
        // Mock successful URL check but exception
        mockClient.urlExists.mockResolvedValue(true);
        mockClient.createPage.mockRejectedValue(new Error('Network error'));

        // Execute the action
        const result = await createPageAction.execute({
            accessToken: {
                username: 'test-user',
                password: 'test-pass',
                websiteUrl: 'https://example.com'
            },
            title: 'Test Page',
            content: 'This is a test page content'
        });

        // Verify the error is returned
        expect(result).toEqual({
            error: 'Network error'
        });
    });

    it('should upload featured media if provided', async () => {
        // Mock successful responses
        mockClient.urlExists.mockResolvedValue(true);
        mockClient.uploadMedia.mockResolvedValue({
            data: {
                id: 'media123'
            }
        });
        mockClient.createPage.mockResolvedValue({
            data: {
                id: 'page123',
                title: { rendered: 'Test Page' },
                slug: 'test-page',
                link: 'https://example.com/test-page'
            }
        });

        // Execute the action
        const result = await createPageAction.execute({
            accessToken: {
                username: 'test-user',
                password: 'test-pass',
                websiteUrl: 'https://example.com'
            },
            title: 'Test Page',
            content: 'This is a test page content',
            featuredMediaFile: {
                filename: 'test.jpg',
                base64: 'base64-content'
            }
        });

        // Verify uploadMedia was called with the correct parameters
        expect(mockClient.uploadMedia).toHaveBeenCalledWith({
            filename: 'test.jpg',
            base64: 'base64-content'
        });

        // Verify createPage was called with the featured media ID
        expect(mockClient.createPage).toHaveBeenCalledWith({
            title: 'Test Page',
            content: 'This is a test page content',
            featured_media: 'media123'
        });

        // Verify the result
        expect(result).toEqual({
            id: 'page123',
            title: 'Test Page',
            slug: 'test-page',
            link: 'https://example.com/test-page'
        });
    });

    it('should handle media upload errors', async () => {
        // Mock successful URL check but media upload error
        mockClient.urlExists.mockResolvedValue(true);
        mockClient.uploadMedia.mockResolvedValue({
            error: 'Media upload failed'
        });

        // Execute the action
        const result = await createPageAction.execute({
            accessToken: {
                username: 'test-user',
                password: 'test-pass',
                websiteUrl: 'https://example.com'
            },
            title: 'Test Page',
            content: 'This is a test page content',
            featuredMediaFile: {
                filename: 'test.jpg',
                base64: 'base64-content'
            }
        });

        // Verify the error is returned
        expect(result).toEqual({
            error: 'Failed to upload media: Media upload failed'
        });
    });

    it('should include parent page ID if provided', async () => {
        // Mock successful responses
        mockClient.urlExists.mockResolvedValue(true);
        mockClient.createPage.mockResolvedValue({
            data: {
                id: 'page123',
                title: { rendered: 'Test Page' },
                slug: 'test-page',
                link: 'https://example.com/test-page'
            }
        });

        // Execute the action
        const result = await createPageAction.execute({
            accessToken: {
                username: 'test-user',
                password: 'test-pass',
                websiteUrl: 'https://example.com'
            },
            title: 'Test Page',
            content: 'This is a test page content',
            parent: 'parent123'
        });

        // Verify createPage was called with the parent ID
        expect(mockClient.createPage).toHaveBeenCalledWith({
            title: 'Test Page',
            content: 'This is a test page content',
            parent: 'parent123'
        });

        // Verify the result
        expect(result).toEqual({
            id: 'page123',
            title: 'Test Page',
            slug: 'test-page',
            link: 'https://example.com/test-page'
        });
    });
});
