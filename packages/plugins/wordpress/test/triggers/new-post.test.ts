import { newPostTrigger } from '../../src/triggers/new-post.js';
import * as common from '../../src/common/index.js';
import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';

describe('newPostTrigger', () => {
    let mockClient: any;
    let createClientSpy: any;
    let mockStore: any;
    let mockContext: any;

    beforeEach(() => {
        // Setup mock client
        mockClient = {
            getPosts: jest.fn()
        };

        // Create spy on createClient
        createClientSpy = jest.spyOn(common, 'createClient').mockReturnValue(mockClient);

        // Setup mock store
        mockStore = {
            get: jest.fn(),
            put: jest.fn()
        };

        // Setup mock context
        mockContext = {
            store: mockStore,
            propsValue: {
                accessToken: {
                    username: 'test-user',
                    password: 'test-pass',
                    websiteUrl: 'https://example.com'
                }
            }
        };
    });

    afterEach(() => {
        // Restore original function
        createClientSpy.mockRestore();
    });

    it('should store lastCheckTime on enable', async () => {
        // Execute onEnable
        await newPostTrigger.onEnable(mockContext);

        // Verify store.put was called with lastCheckTime
        expect(mockStore.put).toHaveBeenCalledWith('lastCheckTime', expect.any(Number));
    });

    it('should return empty array when no new posts', async () => {
        // Mock store.get to return a timestamp
        mockStore.get.mockResolvedValue(Date.now());

        // Mock getPosts to return empty array
        mockClient.getPosts.mockResolvedValue({
            posts: [],
            totalPages: 0
        });

        // Execute run
        const result = await newPostTrigger.run(mockContext);

        // Verify result is empty array
        expect(result).toEqual([]);

        // Verify store.put was called with new lastCheckTime
        expect(mockStore.put).toHaveBeenCalledWith('lastCheckTime', expect.any(Number));
    });

    it('should return new posts when available', async () => {
        // Mock store.get to return a timestamp
        mockStore.get.mockResolvedValue(Date.now() - 3600000); // 1 hour ago

        // Mock getPosts to return posts
        mockClient.getPosts.mockResolvedValue({
            posts: [
                {
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
            ],
            totalPages: 1
        });

        // Execute run
        const result = await newPostTrigger.run(mockContext);

        // Verify result contains the post
        expect(result).toEqual([
            {
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
            }
        ]);

        // Verify store.put was called with new lastCheckTime
        expect(mockStore.put).toHaveBeenCalledWith('lastCheckTime', expect.any(Number));
    });

    it('should initialize lastCheckTime if not set', async () => {
        // Mock store.get to return null
        mockStore.get.mockResolvedValue(null);

        // Mock getPosts to return empty array
        mockClient.getPosts.mockResolvedValue({
            posts: [],
            totalPages: 0
        });

        // Execute run
        await newPostTrigger.run(mockContext);

        // Verify store.put was called twice (once to initialize, once to update)
        expect(mockStore.put).toHaveBeenCalledTimes(2);
        expect(mockStore.put).toHaveBeenCalledWith('lastCheckTime', expect.any(Number));
    });

    it('should filter posts by author if specified', async () => {
        // Add author to context
        mockContext.propsValue.authors = 'author123';

        // Mock store.get to return a timestamp
        mockStore.get.mockResolvedValue(Date.now());

        // Mock getPosts to return empty array
        mockClient.getPosts.mockResolvedValue({
            posts: [],
            totalPages: 0
        });

        // Execute run
        await newPostTrigger.run(mockContext);

        // Verify getPosts was called with the author parameter
        expect(mockClient.getPosts).toHaveBeenCalledWith({
            authors: 'author123',
            afterDate: expect.any(String),
            page: 1
        });
    });
});
