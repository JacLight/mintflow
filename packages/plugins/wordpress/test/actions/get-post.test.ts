import { getPostAction } from '../../src/actions/get-post.js';
import * as common from '../../src/common/index.js';
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

describe('getPostAction', () => {
    let mockClient: any;
    let createClientSpy: any;

    beforeEach(() => {
        // Setup mock client
        mockClient = {
            urlExists: jest.fn(),
            getPost: jest.fn()
        };

        // Create spy on createClient
        createClientSpy = jest.spyOn(common, 'createClient').mockReturnValue(mockClient);
    });

    afterEach(() => {
        // Restore original function
        createClientSpy.mockRestore();
    });

    it('should get a post successfully', async () => {
        // Mock successful responses
        mockClient.urlExists.mockResolvedValue(true);
        mockClient.getPost.mockResolvedValue({
            data: {
                id: 'post123',
                title: { rendered: 'Test Post' },
                content: { rendered: 'Test content' },
                excerpt: { rendered: 'Test excerpt' },
                slug: 'test-post',
                date: '2023-01-01T00:00:00Z',
                status: 'publish',
                link: 'https://example.com/test-post',
                author: 'author123',
                featured_media: 'media123',
                categories: ['cat1', 'cat2'],
                tags: ['tag1', 'tag2']
            }
        });

        // Execute the action
        const result = await getPostAction.execute({
            accessToken: {
                username: 'test-user',
                password: 'test-pass',
                websiteUrl: 'https://example.com'
            },
            postId: 'post123'
        });

        // Verify the client was created with the correct credentials
        expect(common.createClient).toHaveBeenCalledWith({
            username: 'test-user',
            password: 'test-pass',
            websiteUrl: 'https://example.com'
        });

        // Verify urlExists was called with the correct URL
        expect(mockClient.urlExists).toHaveBeenCalledWith('https://example.com');

        // Verify getPost was called with the correct parameters
        expect(mockClient.getPost).toHaveBeenCalledWith('post123');

        // Verify the result
        expect(result).toEqual({
            id: 'post123',
            title: 'Test Post',
            content: 'Test content',
            excerpt: 'Test excerpt',
            slug: 'test-post',
            date: '2023-01-01T00:00:00Z',
            status: 'publish',
            link: 'https://example.com/test-post',
            author: 'author123',
            featuredMedia: 'media123',
            categories: ['cat1', 'cat2'],
            tags: ['tag1', 'tag2']
        });
    });

    it('should handle invalid website URL', async () => {
        // Mock invalid website URL
        mockClient.urlExists.mockResolvedValue(false);

        // Execute the action
        const result = await getPostAction.execute({
            accessToken: {
                username: 'test-user',
                password: 'test-pass',
                websiteUrl: 'https://invalid-site.com'
            },
            postId: 'post123'
        });

        // Verify the error is returned
        expect(result).toEqual({
            error: 'Website URL is invalid: https://invalid-site.com'
        });
    });

    it('should handle API errors', async () => {
        // Mock successful URL check but API error
        mockClient.urlExists.mockResolvedValue(true);
        mockClient.getPost.mockResolvedValue({
            error: 'Post not found'
        });

        // Execute the action
        const result = await getPostAction.execute({
            accessToken: {
                username: 'test-user',
                password: 'test-pass',
                websiteUrl: 'https://example.com'
            },
            postId: 'invalid-post'
        });

        // Verify the error is returned
        expect(result).toEqual({
            error: 'Post not found'
        });
    });

    it('should handle exceptions', async () => {
        // Mock successful URL check but exception
        mockClient.urlExists.mockResolvedValue(true);
        mockClient.getPost.mockRejectedValue(new Error('Network error'));

        // Execute the action
        const result = await getPostAction.execute({
            accessToken: {
                username: 'test-user',
                password: 'test-pass',
                websiteUrl: 'https://example.com'
            },
            postId: 'post123'
        });

        // Verify the error is returned
        expect(result).toEqual({
            error: 'Network error'
        });
    });
});
