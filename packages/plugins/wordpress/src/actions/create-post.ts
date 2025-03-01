import { createClient, WordPressAuth } from '../common/index.js';

export interface CreatePostInput {
    accessToken: {
        username: string;
        password: string;
        websiteUrl: string;
    };
    title: string;
    content: string;
    slug?: string;
    date?: string;
    featuredMediaFile?: {
        filename: string;
        base64: string;
    };
    tags?: string[];
    acfFields?: Record<string, any>;
    categories?: string[];
    featuredMedia?: string;
    status?: 'publish' | 'future' | 'draft' | 'pending' | 'private' | 'trash';
    excerpt?: string;
    commentStatus?: boolean;
    pingStatus?: boolean;
}

export interface CreatePostOutput {
    id?: string;
    title?: string;
    slug?: string;
    link?: string;
    error?: string;
}

export const createPostAction = {
    name: 'create_post',
    displayName: 'Create Post',
    description: 'Create a new post on WordPress',

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
        title: {
            type: 'string',
            displayName: 'Title',
            required: true,
            description: 'Title of the post'
        },
        content: {
            type: 'string',
            displayName: 'Content',
            required: true,
            description: 'Content of the post (supports HTML)'
        },
        slug: {
            type: 'string',
            displayName: 'Slug',
            required: false,
            description: 'URL slug for the post'
        },
        date: {
            type: 'string',
            displayName: 'Date',
            required: false,
            description: 'Post publish date (ISO-8601 format)'
        },
        featuredMediaFile: {
            type: 'object',
            displayName: 'Featured Media (File)',
            required: false,
            properties: {
                filename: {
                    type: 'string',
                    displayName: 'Filename',
                    required: true
                },
                base64: {
                    type: 'string',
                    displayName: 'File Content (Base64)',
                    required: true
                }
            }
        },
        tags: {
            type: 'array',
            displayName: 'Tags',
            required: false,
            description: 'Post tags'
        },
        categories: {
            type: 'array',
            displayName: 'Categories',
            required: false,
            description: 'Post categories'
        },
        featuredMedia: {
            type: 'string',
            displayName: 'Featured Media (ID)',
            required: false,
            description: 'ID of an existing media to use as featured image'
        },
        status: {
            type: 'string',
            displayName: 'Status',
            required: false,
            description: 'Post status',
            enum: ['publish', 'future', 'draft', 'pending', 'private', 'trash']
        },
        excerpt: {
            type: 'string',
            displayName: 'Excerpt',
            required: false,
            description: 'Post excerpt (supports HTML)'
        },
        commentStatus: {
            type: 'boolean',
            displayName: 'Enable Comments',
            required: false,
            description: 'Whether to allow comments on the post'
        },
        pingStatus: {
            type: 'boolean',
            displayName: 'Open to Pinging',
            required: false,
            description: 'Whether to allow pingbacks and trackbacks'
        },
        acfFields: {
            type: 'object',
            displayName: 'Custom ACF Fields',
            required: false,
            description: 'Advanced Custom Fields values (field name with value)'
        }
    },

    async execute(input: CreatePostInput): Promise<CreatePostOutput> {
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

            // Prepare request body
            const requestBody: Record<string, any> = {
                title: input.title,
                content: input.content
            };

            // Add optional fields
            if (input.date) requestBody.date = input.date;
            if (input.commentStatus !== undefined) requestBody.comment_status = input.commentStatus ? 'open' : 'closed';
            if (input.categories) requestBody.categories = input.categories;
            if (input.slug) requestBody.slug = input.slug;
            if (input.excerpt) requestBody.excerpt = input.excerpt;
            if (input.tags) requestBody.tags = input.tags;
            if (input.pingStatus !== undefined) requestBody.ping_status = input.pingStatus ? 'open' : 'closed';
            if (input.status) requestBody.status = input.status;
            if (input.featuredMedia) requestBody.featured_media = input.featuredMedia;

            // Add ACF fields if provided
            if (input.acfFields && Object.keys(input.acfFields).length > 0) {
                requestBody.acf = input.acfFields;
            }

            // Upload featured media if provided
            if (input.featuredMediaFile) {
                const uploadResponse = await client.uploadMedia(input.featuredMediaFile);

                if ('error' in uploadResponse) {
                    return { error: `Failed to upload media: ${uploadResponse.error}` };
                }

                requestBody.featured_media = uploadResponse.data.id;
            }

            // Create the post
            const response = await client.createPost(requestBody);

            if ('error' in response) {
                return { error: response.error };
            }

            return {
                id: response.data.id,
                title: response.data.title?.rendered,
                slug: response.data.slug,
                link: response.data.link
            };
        } catch (error: any) {
            return { error: error.message || 'An unknown error occurred' };
        }
    }
};
