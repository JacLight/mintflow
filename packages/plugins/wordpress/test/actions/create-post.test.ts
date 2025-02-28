import { createPostAction } from '../../src/actions/create-post.js';
import * as common from '../../src/common/index.js';
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

describe('createPostAction', () => {
    let mockClient: any;
    let createClientSpy: any;

    beforeEach(() => {
        // Setup mock client
        mockClient = {
            urlExists: jest.fn(),
            createPost: jest.fn(),
            uploadMedia: jest.fn()
        };

        // Create spy on createClient
        createClientSpy = jest.spyOn(common, 'createClient').mockReturnValue(mockClient);
    });

    afterEach(() => {
        // Restore original function
        createClientSpy.mockRestore();
    });

    it('should create a post successfully', async () => {
        // Mock successful responses
        mockClient.urlExists.mockResolvedValue(true);
        mockClient.createPost.mockResolvedValue({
            data: {
                id: 'post123',
                title: { rendered: 'Test Post' },
                slug: 'test-post',
                link: 'https://example.com/test-post'
            }
        });

        // Execute the action
        const result = await createPostAction.execute({
            accessToken: {
                username: 'test-user',
                password: 'test-pass',
                websiteUrl: 'https://example.com'
            },
            title: 'Test Post',
            content: 'This is a test post content'
        });

        // Verify the client was created with the correct credentials
        expect(common.createClient).toHaveBeenCalledWith({
            username: 'test-user',
            password: 'test-pass',
            websiteUrl: 'https://example.com'
        });

        // Verify urlExists was called with the correct URL
        expect(mockClient.urlExists).toHaveBeenCalledWith('https://example.com');

        // Verify createPost was called with the correct parameters
        expect(mockClient.createPost).toHaveBeenCalledWith({
            title: 'Test Post',
            content: 'This is a test post content'
        });

        // Verify the result
        expect(result).toEqual({
            id: 'post123',
            title: 'Test Post',
            slug: 'test-post',
            link: 'https://example.com/test-post'
        });
    });

    it('should handle invalid website URL', async () => {
        // Mock invalid website URL
        mockClient.urlExists.mockResolvedValue(false);

        // Execute the action
        const result = await createPostAction.execute({
            accessToken: {
                username: 'test-user',
                password: 'test-pass',
                websiteUrl: 'https://invalid-site.com'
            },
            title: 'Test Post',
            content: 'This is a test post content'
        });

        // Verify the error is returned
        expect(result).toEqual({
            error: 'Website URL is invalid: https://invalid-site.com'
        });
    });

    it('should handle API errors', async () => {
        // Mock successful URL check but API error
        mockClient.urlExists.mockResolvedValue(true);
        mockClient.createPost.mockResolvedValue({
            error: 'API error'
        });

        // Execute the action
        const result = await createPostAction.execute({
            accessToken: {
                username: 'test-user',
                password: 'test-pass',
                websiteUrl: 'https://example.com'
            },
            title: 'Test Post',
            content: 'This is a test post content'
        });

        // Verify the error is returned
        expect(result).toEqual({
            error: 'API error'
        });
    });

    it('should handle exceptions', async () => {
        // Mock successful URL check but exception
        mockClient.urlExists.mockResolvedValue(true);
        mockClient.createPost.mockRejectedValue(new Error('Network error'));

        // Execute the action
        const result = await createPostAction.execute({
            accessToken: {
                username: 'test-user',
                password: 'test-pass',
                websiteUrl: 'https://example.com'
            },
            title: 'Test Post',
            content: 'This is a test post content'
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
        mockClient.createPost.mockResolvedValue({
            data: {
                id: 'post123',
                title: { rendered: 'Test Post' },
                slug: 'test-post',
                link: 'https://example.com/test-post'
            }
        });

        // Execute the action
        const result = await createPostAction.execute({
            accessToken: {
                username: 'test-user',
                password: 'test-pass',
                websiteUrl: 'https://example.com'
            },
            title: 'Test Post',
            content: 'This is a test post content',
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

        // Verify createPost was called with the featured media ID
        expect(mockClient.createPost).toHaveBeenCalledWith({
            title: 'Test Post',
            content: 'This is a test post content',
            featured_media: 'media123'
        });

        // Verify the result
        expect(result).toEqual({
            id: 'post123',
            title: 'Test Post',
            slug: 'test-post',
            link: 'https://example.com/test-post'
        });
    });

    it('should handle media upload errors', async () => {
        // Mock successful URL check but media upload error
        mockClient.urlExists.mockResolvedValue(true);
        mockClient.uploadMedia.mockResolvedValue({
            error: 'Media upload failed'
        });

        // Execute the action
        const result = await createPostAction.execute({
            accessToken: {
                username: 'test-user',
                password: 'test-pass',
                websiteUrl: 'https://example.com'
            },
            title: 'Test Post',
            content: 'This is a test post content',
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
});
