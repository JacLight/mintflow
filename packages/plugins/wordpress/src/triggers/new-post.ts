import { createClient, WordPressAuth, WordPressPost } from '../common/index.js';
import dayjs from 'dayjs';

export interface NewPostTriggerInput {
    accessToken: {
        username: string;
        password: string;
        websiteUrl: string;
    };
    authors?: string;
    pollingInterval?: number;
}

export interface NewPostTriggerOutput {
    id: string;
    title: string;
    content: string;
    excerpt: string;
    slug: string;
    date: string;
    status: string;
    link: string;
    author: string;
    featuredMedia: string;
    categories: string[];
    tags: string[];
}

export const newPostTrigger = {
    name: 'new_post',
    displayName: 'New Post',
    description: 'Triggers when a new post is published',

    props: {
        accessToken: {
            type: 'object',
            displayName: 'Authentication',
            required: true,
            properties: {
                username: {
                    type: 'string',
                    displayName: 'Username',
                    required: true
                },
                password: {
                    type: 'string',
                    displayName: 'Password',
                    required: true
                },
                websiteUrl: {
                    type: 'string',
                    displayName: 'Website URL',
                    required: true,
                    description: 'URL of the WordPress website (e.g., https://example.com)'
                }
            }
        },
        authors: {
            type: 'string',
            displayName: 'Authors',
            required: false,
            description: 'Filter posts by specific author IDs (comma-separated)'
        },
        pollingInterval: {
            type: 'number',
            displayName: 'Polling Interval',
            required: false,
            description: 'How often to check for new posts (in minutes)',
            default: 15
        }
    },

    async onEnable(context: { store: any; propsValue: NewPostTriggerInput }): Promise<void> {
        // Store the last check time when the trigger is enabled
        await context.store.put('lastCheckTime', Date.now());
    },

    async onDisable(): Promise<void> {
        // Nothing to do when the trigger is disabled
    },

    async run(context: { store: any; propsValue: NewPostTriggerInput }): Promise<NewPostTriggerOutput[]> {
        const auth: WordPressAuth = {
            username: context.propsValue.accessToken.username,
            password: context.propsValue.accessToken.password,
            websiteUrl: context.propsValue.accessToken.websiteUrl
        };

        const client = createClient(auth);

        // Get the last check time
        let lastCheckTime = await context.store.get('lastCheckTime');
        if (!lastCheckTime) {
            lastCheckTime = Date.now();
            await context.store.put('lastCheckTime', lastCheckTime);
        }

        // Convert to ISO string for WordPress API
        const afterDate = dayjs(lastCheckTime).toISOString();

        // Update the last check time for the next run
        await context.store.put('lastCheckTime', Date.now());

        // Get posts published after the last check time
        const postsResponse = await client.getPosts({
            authors: context.propsValue.authors,
            afterDate: afterDate,
            page: 1
        });

        // Map the posts to the output format
        return postsResponse.posts.map((post: WordPressPost) => ({
            id: post.id,
            title: post.title?.rendered || '',
            content: post.content?.rendered || '',
            excerpt: post.excerpt?.rendered || '',
            slug: post.slug || '',
            date: post.date || '',
            status: post.status || '',
            link: post.link || '',
            author: post.author || '',
            featuredMedia: post.featured_media || '',
            categories: post.categories || [],
            tags: post.tags || []
        }));
    }
};
