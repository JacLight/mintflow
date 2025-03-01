import { getCollectionItemAction } from '../../src/actions/collections/get-collection-item.js';
import * as common from '../../src/common/index.js';

describe('getCollectionItemAction', () => {
    let mockClient: any;
    let createClientSpy: any;

    beforeEach(() => {
        // Setup mock client
        mockClient = {
            getCollectionItem: jest.fn(),
        };

        // Create spy on createClient
        createClientSpy = jest.spyOn(common, 'createClient').mockReturnValue(mockClient);
    });

    afterEach(() => {
        // Restore original function
        createClientSpy.mockRestore();
    });

    it('should get a collection item successfully', async () => {
        // Mock successful response
        mockClient.getCollectionItem.mockResolvedValue({
            data: {
                _id: 'item123',
                name: 'Test Item',
                slug: 'test-item',
                'custom-field': 'Custom value',
                _draft: false,
                _archived: false,
                'updated-on': '2023-01-01T00:00:00Z',
                'created-on': '2023-01-01T00:00:00Z',
            },
        });

        // Execute the action
        const result = await getCollectionItemAction.execute({
            accessToken: 'test-token',
            collectionId: 'collection123',
            itemId: 'item123',
        });

        // Verify the client was created with the correct token
        expect(common.createClient).toHaveBeenCalledWith('test-token');

        // Verify getCollectionItem was called with the correct parameters
        expect(mockClient.getCollectionItem).toHaveBeenCalledWith('collection123', 'item123');

        // Verify the result
        expect(result).toEqual({
            id: 'item123',
            name: 'Test Item',
            slug: 'test-item',
            fields: {
                'custom-field': 'Custom value',
            },
        });
    });

    it('should handle API errors', async () => {
        // Mock error response
        mockClient.getCollectionItem.mockResolvedValue({
            error: 'Item not found',
        });

        // Execute the action
        const result = await getCollectionItemAction.execute({
            accessToken: 'test-token',
            collectionId: 'collection123',
            itemId: 'invalid-item',
        });

        // Verify the error is returned
        expect(result).toEqual({
            error: 'Item not found',
        });
    });

    it('should handle exceptions', async () => {
        // Mock exception
        mockClient.getCollectionItem.mockRejectedValue(new Error('Network error'));

        // Execute the action
        const result = await getCollectionItemAction.execute({
            accessToken: 'test-token',
            collectionId: 'collection123',
            itemId: 'item123',
        });

        // Verify the error is returned
        expect(result).toEqual({
            error: 'Network error',
        });
    });
});
