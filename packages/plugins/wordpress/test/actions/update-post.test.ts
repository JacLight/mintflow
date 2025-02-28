import { updatePostAction } from '../../src/actions/update-post.js';
import * as common from '../../src/common/index.js';
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

describe('updatePostAction', () => {
    let mockClient: any;
    let createClientSpy: any;

    beforeEach(() => {
        // Setup mock client
        mockClient = {
            urlExists: jest.fn(),
            updatePost: jest.fn(),
            uploadMedia: jest.fn()
        };

        // Create spy on createClient
        createClientSpy = jest.spyOn(common, 'createClient').mockReturnValue(mockClient);
    });

    afterEach(() => {
        // Restore original function
        createClientSpy.mockRestore();
    });

    it('should update a post successfully', async () => {
        // Mock successful responses
        mockClient.urlExists.mockResolvedValue(true);
        mockClient.updatePost.mockResolvedValue({
            data: {
                id: 'post123',
                title: { rendered: 'Updated Post' },
                slug: 'updated-post',
                link: 'https://example.com/updated-post'
            }
        });

        // Execute the action
        const result = await updatePostAction.execute({
            accessToken: {
                username: 'test-user',
                password: 'test-pass',
                websiteUrl: 'https://example.com'
            },
            postId: 'post123',
            title: 'Updated Post',
            content: 'This is an updated post content'
        });

        // Verify the client was created with the correct credentials
        expect(common.createClient).toHaveBeenCalledWith({
            username: 'test-user',
            password: 'test-pass',
            websiteUrl: 'https://example.com'
        });

        // Verify urlExists was called with the correct URL
        expect(mockClient.urlExists).toHaveBeenCalledWith('https://example.com');

        // Verify updatePost was called with the correct parameters
        expect(mockClient.updatePost).toHaveBeenCalledWith('post123', {
            title: 'Updated Post',
            content: 'This is an updated post content'
        });

        // Verify the result
        expect(result).toEqual({
            id: 'post123',
            title: 'Updated Post',
            slug: 'updated-post',
            link: 'https://example.com/updated-post'
        });
    });

    it('should handle invalid website URL', async () => {
        // Mock invalid website URL
        mockClient.urlExists.mockResolvedValue(false);

        // Execute the action
        const result = await updatePostAction.execute({
            accessToken: {
                username: 'test-user',
                password: 'test-pass',
                websiteUrl: 'https://invalid-site.com'
            },
            postId: 'post123',
            title: 'Updated Post'
        });

        // Verify the error is returned
        expect(result).toEqual({
            error: 'Website URL is invalid: https://invalid-site.com'
        });
    });

    it('should handle API errors', async () => {
        // Mock successful URL check but API error
        mockClient.urlExists.mockResolvedValue(true);
        mockClient.updatePost.mockResolvedValue({
            error: 'Post not found'
        });

        // Execute the action
        const result = await updatePostAction.execute({
            accessToken: {
                username: 'test-user',
                password: 'test-pass',
                websiteUrl: 'https://example.com'
            },
            postId: 'invalid-post',
            title: 'Updated Post'
        });

        // Verify the error is returned
        expect(result).toEqual({
            error: 'Post not found'
        });
    });

    it('should handle exceptions', async () => {
        // Mock successful URL check but exception
        mockClient.urlExists.mockResolvedValue(true);
        mockClient.updatePost.mockRejectedValue(new Error('Network error'));

        // Execute the action
        const result = await updatePostAction.execute({
            accessToken: {
                username: 'test-user',
                password: 'test-pass',
                websiteUrl: 'https://example.com'
            },
            postId: 'post123',
            title: 'Updated Post'
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
        mockClient.updatePost.mockResolvedValue({
            data: {
                id: 'post123',
                title: { rendered: 'Updated Post' },
                slug: 'updated-post',
                link: 'https://example.com/updated-post'
            }
        });

        // Execute the action
        const result = await updatePostAction.execute({
            accessToken: {
                username: 'test-user',
                password: 'test-pass',
                websiteUrl: 'https://example.com'
            },
            postId: 'post123',
            title: 'Updated Post',
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

        // Verify updatePost was called with the featured media ID
        expect(mockClient.updatePost).toHaveBeenCalledWith('post123', {
            title: 'Updated Post',
            featured_media: 'media123'
        });

        // Verify the result
        expect(result).toEqual({
            id: 'post123',
            title: 'Updated Post',
            slug: 'updated-post',
            link: 'https://example.com/updated-post'
        });
    });

    it('should handle media upload errors', async () => {
        // Mock successful URL check but media upload error
        mockClient.urlExists.mockResolvedValue(true);
        mockClient.uploadMedia.mockResolvedValue({
            error: 'Media upload failed'
        });

        // Execute the action
        const result = await updatePostAction.execute({
            accessToken: {
                username: 'test-user',
                password: 'test-pass',
                websiteUrl: 'https://example.com'
            },
            postId: 'post123',
            title: 'Updated Post',
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
