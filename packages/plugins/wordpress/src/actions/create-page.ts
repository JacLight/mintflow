import { createClient, WordPressAuth } from '../common/index.js';

export interface CreatePageInput {
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
    acfFields?: Record<string, any>;
    featuredMedia?: string;
    status?: 'publish' | 'future' | 'draft' | 'pending' | 'private' | 'trash';
    excerpt?: string;
    commentStatus?: boolean;
    pingStatus?: boolean;
    parent?: string;
    menuOrder?: number;
    template?: string;
}

export interface CreatePageOutput {
    id?: string;
    title?: string;
    slug?: string;
    link?: string;
    error?: string;
}

export const createPageAction = {
    name: 'create_page',
    displayName: 'Create Page',
    description: 'Create a new page on WordPress',

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
            description: 'Title of the page'
        },
        content: {
            type: 'string',
            displayName: 'Content',
            required: true,
            description: 'Content of the page (supports HTML)'
        },
        slug: {
            type: 'string',
            displayName: 'Slug',
            required: false,
            description: 'URL slug for the page'
        },
        date: {
            type: 'string',
            displayName: 'Date',
            required: false,
            description: 'Page publish date (ISO-8601 format)'
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
            description: 'Page status',
            enum: ['publish', 'future', 'draft', 'pending', 'private', 'trash']
        },
        excerpt: {
            type: 'string',
            displayName: 'Excerpt',
            required: false,
            description: 'Page excerpt (supports HTML)'
        },
        commentStatus: {
            type: 'boolean',
            displayName: 'Enable Comments',
            required: false,
            description: 'Whether to allow comments on the page'
        },
        pingStatus: {
            type: 'boolean',
            displayName: 'Open to Pinging',
            required: false,
            description: 'Whether to allow pingbacks and trackbacks'
        },
        parent: {
            type: 'string',
            displayName: 'Parent Page ID',
            required: false,
            description: 'ID of the parent page (for hierarchical pages)'
        },
        menuOrder: {
            type: 'number',
            displayName: 'Menu Order',
            required: false,
            description: 'Order in which the page should appear in menus'
        },
        template: {
            type: 'string',
            displayName: 'Template',
            required: false,
            description: 'Template file to use for the page'
        },
        acfFields: {
            type: 'object',
            displayName: 'Custom ACF Fields',
            required: false,
            description: 'Advanced Custom Fields values (field name with value)'
        }
    },

    async execute(input: CreatePageInput): Promise<CreatePageOutput> {
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
            if (input.slug) requestBody.slug = input.slug;
            if (input.excerpt) requestBody.excerpt = input.excerpt;
            if (input.pingStatus !== undefined) requestBody.ping_status = input.pingStatus ? 'open' : 'closed';
            if (input.status) requestBody.status = input.status;
            if (input.featuredMedia) requestBody.featured_media = input.featuredMedia;
            if (input.parent) requestBody.parent = input.parent;
            if (input.menuOrder !== undefined) requestBody.menu_order = input.menuOrder;
            if (input.template) requestBody.template = input.template;

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

            // Create the page
            const response = await client.createPage(requestBody);

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
