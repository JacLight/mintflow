import { createClient } from '../../common/index.js';

export const deleteCollectionItemAction = {
    name: 'delete_collection_item',
    description: 'Deletes a collection item from Webflow',
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
                description: 'The ID of the collection item to delete',
            },
        },
        required: ['accessToken', 'collectionId', 'itemId'],
    },
    outputSchema: {
        type: 'object',
        properties: {
            success: {
                type: 'boolean',
                description: 'Whether the deletion was successful',
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
        success: true
    },
    execute: async (input: any) => {
        const {
            accessToken,
            collectionId,
            itemId
        } = input;

        const client = createClient(accessToken);

        try {
            const response = await client.deleteCollectionItem(collectionId, itemId);

            if (response.error) {
                return { success: false, error: response.error };
            }

            if (!response.data) {
                return { success: false, error: 'No data returned from API' };
            }

            return { success: response.data.deleted || false };
        } catch (error) {
            if (error instanceof Error) {
                return { success: false, error: error.message };
            }
            return { success: false, error: 'An unknown error occurred' };
        }
    },
};
