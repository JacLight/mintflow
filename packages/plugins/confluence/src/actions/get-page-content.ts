import { confluenceApiCall } from '../common/index.js';
import axios from 'axios';

export interface ConfluencePage {
    id: string;
    title: string;
    body: any;
    children?: ConfluencePage[];
}

async function getPageWithContent(
    auth: any,
    pageId: string,
): Promise<ConfluencePage> {
    try {
        const response = await confluenceApiCall<ConfluencePage>({
            auth,
            method: 'GET',
            version: 'v2',
            resourceUri: `/pages/${pageId}`,
            query: {
                'body-format': 'storage',
            },
        });
        return response;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to fetch page ${pageId}: ${error.message}`);
        } else {
            throw new Error(`Failed to fetch page ${pageId}: Unknown error`);
        }
    }
}

async function getChildPages(
    auth: any,
    parentId: string,
    currentDepth: number,
    maxDepth: number,
): Promise<ConfluencePage[]> {
    if (currentDepth >= maxDepth) {
        return [];
    }

    try {
        const childrenResponse = await confluenceApiCall<{ results: ConfluencePage[] }>({
            auth,
            method: 'GET',
            version: 'v2',
            resourceUri: `/pages/${parentId}/children`,
        });

        const childPages = await Promise.all(
            childrenResponse.results.map(async (childPage) => {
                const pageWithContent = await getPageWithContent(auth, childPage.id);
                const children = await getChildPages(auth, childPage.id, currentDepth + 1, maxDepth);
                return {
                    ...pageWithContent,
                    children,
                };
            }),
        );

        return childPages;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error(`Failed to fetch children for page ${parentId}: ${error.message}`);
        } else {
            throw new Error(`Failed to fetch children for page ${parentId}: Unknown error`);
        }
    }
}

export const getPageContent = {
    name: 'get_page_content',
    description: 'Get page content and optionally all its descendants',
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
            pageId: {
                type: 'string',
                description: 'Get this from the page URL of your Confluence Cloud',
            },
            includeDescendants: {
                type: 'boolean',
                description: 'If checked, will fetch all child pages recursively.',
                default: false,
            },
            maxDepth: {
                type: 'number',
                description: 'Maximum depth of child pages to fetch.',
                default: 5,
                rules: [
                    { operation: 'notEqual', valueA: true, valueB: '{{includeDescendants}}', action: 'hide' },
                ],
            },
        },
        required: ['username', 'password', 'confluenceDomain', 'pageId'],
    },
    outputSchema: {
        type: 'object',
        properties: {
            id: { type: 'string' },
            title: { type: 'string' },
            body: { type: 'object' },
            children: { type: 'array' },
        },
    },
    exampleInput: {
        username: 'user@example.com',
        password: 'api-token',
        confluenceDomain: 'https://your-domain.atlassian.net',
        pageId: '123456789',
        includeDescendants: true,
        maxDepth: 3,
    },
    exampleOutput: {
        id: '123456789',
        title: 'Example Page',
        body: {
            storage: {
                value: '<p>This is an example page content</p>',
                representation: 'storage',
            },
        },
        children: [
            {
                id: '987654321',
                title: 'Child Page',
                body: {
                    storage: {
                        value: '<p>This is a child page</p>',
                        representation: 'storage',
                    },
                },
                children: [],
            },
        ],
    },
    async execute(input: any, context: any) {
        try {
            const auth = {
                username: input.username,
                password: input.password,
                confluenceDomain: input.confluenceDomain,
            };

            const page = await getPageWithContent(auth, input.pageId);

            if (!input.includeDescendants) {
                return page;
            }

            const children = await getChildPages(
                auth,
                input.pageId,
                1,
                input.maxDepth || 5,
            );

            return {
                ...page,
                children,
            };
        } catch (error) {
            if (axios.isAxiosError(error)) {
                throw new Error(`Failed to fetch page ${input.pageId}: Confluence API error: ${error.message}`);
            } else if (error instanceof Error) {
                throw new Error(`Failed to fetch page ${input.pageId}: ${error.message}`);
            } else {
                throw new Error(`Failed to fetch page ${input.pageId}: Unknown error`);
            }
        }
    },
};

export default getPageContent;
