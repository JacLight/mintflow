import { createClient, WordPressAuth } from '../common/index.js';

export interface GetPostInput {
    accessToken: {
        username: string;
        password: string;
        websiteUrl: string;
    };
    postId: string;
}

export interface GetPostOutput {
    id?: string;
    title?: string;
    content?: string;
    excerpt?: string;
    slug?: string;
    date?: string;
    status?: string;
    link?: string;
    author?: string;
    featuredMedia?: string;
    categories?: string[];
    tags?: string[];
    error?: string;
}

export const getPostAction = {
    name: 'get_post',
    displayName: 'Get Post',
    description: 'Retrieve a post from WordPress by ID',

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
        postId: {
            type: 'string',
            displayName: 'Post ID',
            required: true,
            description: 'ID of the post to retrieve'
        }
    },

    async execute(input: GetPostInput): Promise<GetPostOutput> {
        try {
            const auth: WordPressAuth = {
                username: input.accessToken.username,
                password: input.accessToken.password,
                websiteUrl: input.accessToken.websiteUrl
            };

            const client = createClient(auth);

            // Validate website URL
            if (!(await client.urlExists(auth.websiteUrl.trim()))) {
                return { error: `Website URL is invalid: ${auth.websiteUrl}` };
            }

            // Get the post
            const response = await client.getPost(input.postId);

            if ('error' in response) {
                return { error: response.error };
            }

            const post = response.data;

            return {
                id: post.id,
                title: post.title?.rendered,
                content: post.content?.rendered,
                excerpt: post.excerpt?.rendered,
                slug: post.slug,
                date: post.date,
                status: post.status,
                link: post.link,
                author: post.author,
                featuredMedia: post.featured_media,
                categories: post.categories,
                tags: post.tags
            };
        } catch (error: any) {
            return { error: error.message || 'An unknown error occurred' };
        }
    }
};
