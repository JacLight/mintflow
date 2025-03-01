import { createClient } from '../../common/index.js';

export const getCollectionItemAction = {
    name: 'get_collection_item',
    description: 'Retrieves a specific collection item from Webflow',
    inputSchema: {
        type: 'object',
        properties: {
            accessToken: {
                type: 'string',
                description: 'Webflow API access token',
            },
            collectionId: {
                type: 'string',
                description: 'The ID of the collection containing the item',
            },
            itemId: {
                type: 'string',
                description: 'The ID of the collection item to retrieve',
            },
        },
        required: ['accessToken', 'collectionId', 'itemId'],
    },
    outputSchema: {
        type: 'object',
        properties: {
            id: {
                type: 'string',
                description: 'The ID of the collection item',
            },
            name: {
                type: 'string',
                description: 'The name of the collection item',
            },
            slug: {
                type: 'string',
                description: 'The slug of the collection item',
            },
            fields: {
                type: 'object',
                description: 'The fields of the collection item',
            },
            error: {
                type: 'string',
                description: 'Error message if the operation failed',
            },
        },
    },
    exampleInput: {
        accessToken: 'your-webflow-access-token',
        collectionId: '5f74f169c917b42f5bdb8988',
        itemId: '5f74f169c917b42f5bdb8989'
    },
    exampleOutput: {
        id: '5f74f169c917b42f5bdb8989',
        name: 'Collection Item',
        slug: 'collection-item',
        fields: {
            name: 'Collection Item',
            slug: 'collection-item',
            'custom-field': 'Custom value'
        }
    },
    execute: async (input: any) => {
        const {
            accessToken,
            collectionId,
            itemId
        } = input;

        const client = createClient(accessToken);

        try {
            const response = await client.getCollectionItem(collectionId, itemId);

            if (response.error) {
                return { error: response.error };
            }

            if (!response.data) {
                return { error: 'No data returned from API' };
            }

            const item = response.data;

            // Extract fields excluding system fields
            const fields: Record<string, any> = {};
            Object.keys(item).forEach(key => {
                if (!['_id', 'name', 'slug', '_draft', '_archived', 'updated-on', 'created-on', 'published-on'].includes(key)) {
                    fields[key] = item[key];
                }
            });

            return {
                id: item._id,
                name: item.name,
                slug: item.slug,
                fields
            };
        } catch (error) {
            if (error instanceof Error) {
                return { error: error.message };
            }
            return { error: 'An unknown error occurred' };
        }
    },
};
