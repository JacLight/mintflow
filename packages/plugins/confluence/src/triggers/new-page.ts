import { confluenceApiCall, confluencePaginatedApiCall } from '../common/index.js';

export const newPage = {
    name: 'new_page',
    description: 'Triggers when a new page is created',
    type: 'polling',
    inputSchema: {
        type: 'object',
        properties: {
            username: {
                type: 'string',
                description: 'Account email for basic auth',
                displayStyle: 'password',
            },
            password: {
                type: 'string',
                description: 'API token for basic auth',
                displayStyle: 'password',
            },
            confluenceDomain: {
                type: 'string',
                description: 'Example value - https://your-domain.atlassian.net',
            },
            spaceId: {
                type: 'string',
                description: 'The ID of the space to monitor for new pages',
            },
            pollingInterval: {
                type: 'number',
                description: 'Polling interval in seconds',
                default: 300,
            },
        },
        required: ['username', 'password', 'confluenceDomain', 'spaceId'],
    },
    outputSchema: {
        type: 'object',
        properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            status: { type: 'string' },
            spaceId: { type: 'string' },
            createdAt: { type: 'string' },
            version: { type: 'object' },
            _links: { type: 'object' },
        },
    },
    exampleOutput: {
        parentType: 'page',
        parentId: '123456',
        spaceId: 'SAMPLE123',
        ownerId: '12345678abcd',
        lastOwnerId: null,
        createdAt: '2024-01-01T12:00:00.000Z',
        authorId: '12345678abcd',
        position: 1000,
        version: {
            number: 1,
            message: 'Initial version',
            minorEdit: false,
            authorId: '12345678abcd',
            createdAt: '2024-01-01T12:00:00.000Z',
        },
        body: {},
        status: 'current',
        title: 'Sample Confluence Page',
        id: '987654321',
        _links: {
            editui: '/pages/resumedraft.action?draftId=987654321',
            webui: '/spaces/SAMPLE/pages/987654321/Sample+Confluence+Page',
            edituiv2: '/spaces/SAMPLE/pages/edit-v2/987654321',
            tinyui: '/x/abcd123',
        },
    },
    async onEnable(context: any) {
        // Store the last check time
        const now = new Date();
        context.store.lastCheckTime = now.toISOString();
    },
    async onDisable(context: any) {
        // Clean up any resources
    },
    async run(context: any) {
        const auth = {
            username: context.input.username,
            password: context.input.password,
            confluenceDomain: context.input.confluenceDomain,
        };

        const lastCheckTime = context.store.lastCheckTime
            ? new Date(context.store.lastCheckTime)
            : new Date(0);

        const now = new Date();
        context.store.lastCheckTime = now.toISOString();

        try {
            // Get pages created since last check
            const response = await confluenceApiCall<{ results: any[] }>({
                auth,
                version: 'v2',
                method: 'GET',
                resourceUri: `/spaces/${context.input.spaceId}/pages`,
                query: {
                    limit: '50',
                    sort: '-created-date',
                },
            });

            if (!response.results || response.results.length === 0) {
                return [];
            }

            // Filter pages created since last check
            const newPages = response.results.filter(page => {
                const pageCreatedAt = new Date(page.createdAt);
                return pageCreatedAt > lastCheckTime;
            });

            return newPages;
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Failed to fetch new pages: ${error.message}`);
            } else {
                throw new Error('Failed to fetch new pages: Unknown error');
            }
        }
    },
    async test(context: any) {
        const auth = {
            username: context.input.username,
            password: context.input.password,
            confluenceDomain: context.input.confluenceDomain,
        };

        try {
            // Get the most recent pages for testing
            const response = await confluenceApiCall<{ results: any[] }>({
                auth,
                version: 'v2',
                method: 'GET',
                resourceUri: `/spaces/${context.input.spaceId}/pages`,
                query: {
                    limit: '10',
                    sort: '-created-date',
                },
            });

            if (!response.results || response.results.length === 0) {
                // Return sample data if no pages found
                return [this.exampleOutput];
            }

            return response.results;
        } catch (error) {
            // Return sample data if there's an error
            return [this.exampleOutput];
        }
    },
};

export default newPage;
