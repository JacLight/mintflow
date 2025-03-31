import { createClient } from '../../common/index.js';

export const createCollectionItemAction = {
    name: 'create_collection_item',
    description: 'Creates a new collection item in Webflow',
    inputSchema: {
        type: 'object',
        properties: {
            accessToken: {
                type: 'string',
                description: 'Webflow API access token',
            },
            siteId: {
                type: 'string',
                description: 'The ID of the site containing the collection',
            },
            collectionId: {
                type: 'string',
                description: 'The ID of the collection to create an item in',
            },
            fields: {
                type: 'object',
                description: 'The fields to set on the collection item',
            },
            isDraft: {
                type: 'boolean',
                description: 'Whether the item should be created as a draft',
            },
            isArchived: {
                type: 'boolean',
                description: 'Whether the item should be created as archived',
            },
        },
        required: ['accessToken', 'collectionId', 'fields'],
    },
    outputSchema: {
        type: 'object',
        properties: {
            id: {
                type: 'string',
                description: 'The ID of the created collection item',
            },
            name: {
                type: 'string',
                description: 'The name of the created collection item',
            },
            slug: {
                type: 'string',
                description: 'The slug of the created collection item',
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
        fields: {
            name: 'New Collection Item',
            slug: 'new-collection-item',
            'custom-field': 'Custom value'
        },
        isDraft: false,
        isArchived: false
    },
    exampleOutput: {
        id: '5f74f169c917b42f5bdb8989',
        name: 'New Collection Item',
        slug: 'new-collection-item'
    },
    execute: async (input: any) => {
        const {
            accessToken,
            collectionId,
            fields,
            isDraft,
            isArchived
        } = input;

        const client = createClient(accessToken);

        try {
            // Get collection to understand field structure
            const collectionResponse = await client.getCollection(collectionId);

            if (collectionResponse.error) {
                return { error: collectionResponse.error };
            }

            if (!collectionResponse.data) {
                return { error: 'Failed to retrieve collection information' };
            }

            // Format fields according to their types
            const formattedFields: Record<string, any> = { ...fields };

            // Add system fields
            if (isDraft !== undefined) {
                formattedFields._draft = isDraft;
            }

            if (isArchived !== undefined) {
                formattedFields._archived = isArchived;
            }

            // Create the collection item
            const response = await client.createCollectionItem(collectionId, {
                fields: formattedFields
            });

            if (response.error) {
                return { error: response.error };
            }

            if (!response.data) {
                return { error: 'No data returned from API' };
            }

            const item = response.data;
            return {
                id: item._id,
                name: item.name,
                slug: item.slug
            };
        } catch (error) {
            if (error instanceof Error) {
                return { error: error.message };
            }
            return { error: 'An unknown error occurred' };
        }
    },
};
