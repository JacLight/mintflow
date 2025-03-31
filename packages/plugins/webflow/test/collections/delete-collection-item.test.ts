import { deleteCollectionItemAction } from '../../src/actions/collections/delete-collection-item.js';
import * as common from '../../src/common/index.js';

describe('deleteCollectionItemAction', () => {
    let mockClient: any;
    let createClientSpy: any;

    beforeEach(() => {
        // Setup mock client
        mockClient = {
            deleteCollectionItem: jest.fn(),
        };

        // Create spy on createClient
        createClientSpy = jest.spyOn(common, 'createClient').mockReturnValue(mockClient);
    });

    afterEach(() => {
        // Restore original function
        createClientSpy.mockRestore();
    });

    it('should delete a collection item successfully', async () => {
        // Mock successful response
        mockClient.deleteCollectionItem.mockResolvedValue({
            data: {
                deleted: true,
            },
        });

        // Execute the action
        const result = await deleteCollectionItemAction.execute({
            accessToken: 'test-token',
            collectionId: 'collection123',
            itemId: 'item123',
        });

        // Verify the client was created with the correct token
        expect(common.createClient).toHaveBeenCalledWith('test-token');

        // Verify deleteCollectionItem was called with the correct parameters
        expect(mockClient.deleteCollectionItem).toHaveBeenCalledWith('collection123', 'item123');

        // Verify the result
        expect(result).toEqual({
            success: true,
        });
    });

    it('should handle unsuccessful deletion', async () => {
        // Mock unsuccessful response
        mockClient.deleteCollectionItem.mockResolvedValue({
            data: {
                deleted: false,
            },
        });

        // Execute the action
        const result = await deleteCollectionItemAction.execute({
            accessToken: 'test-token',
            collectionId: 'collection123',
            itemId: 'item123',
        });

        // Verify the result
        expect(result).toEqual({
            success: false,
        });
    });

    it('should handle API errors', async () => {
        // Mock error response
        mockClient.deleteCollectionItem.mockResolvedValue({
            error: 'Item not found',
        });

        // Execute the action
        const result = await deleteCollectionItemAction.execute({
            accessToken: 'test-token',
            collectionId: 'collection123',
            itemId: 'invalid-item',
        });

        // Verify the error is returned
        expect(result).toEqual({
            success: false,
            error: 'Item not found',
        });
    });

    it('should handle exceptions', async () => {
        // Mock exception
        mockClient.deleteCollectionItem.mockRejectedValue(new Error('Network error'));

        // Execute the action
        const result = await deleteCollectionItemAction.execute({
            accessToken: 'test-token',
            collectionId: 'collection123',
            itemId: 'item123',
        });

        // Verify the error is returned
        expect(result).toEqual({
            success: false,
            error: 'Network error',
        });
    });
});
