import { createCollectionItemAction } from '../../src/actions/collections/create-collection-item.js';
import * as common from '../../src/common/index.js';

describe('createCollectionItemAction', () => {
    let mockClient: any;
    let createClientSpy: any;

    beforeEach(() => {
        // Setup mock client
        mockClient = {
            getCollection: jest.fn(),
            createCollectionItem: jest.fn(),
        };

        // Create spy on createClient
        createClientSpy = jest.spyOn(common, 'createClient').mockReturnValue(mockClient);
    });

    afterEach(() => {
        // Restore original function
        createClientSpy.mockRestore();
    });

    it('should create a collection item successfully', async () => {
        // Mock successful responses
        mockClient.getCollection.mockResolvedValue({
            data: {
                _id: 'collection123',
                name: 'Test Collection',
                fields: [
                    { slug: 'name', type: 'PlainText', required: true },
                    { slug: 'slug', type: 'PlainText', required: false },
                    { slug: 'custom-field', type: 'PlainText', required: false },
                ],
            },
        });

        mockClient.createCollectionItem.mockResolvedValue({
            data: {
                _id: 'item123',
                name: 'Test Item',
                slug: 'test-item',
                'custom-field': 'Custom value',
            },
        });

        // Execute the action
        const result = await createCollectionItemAction.execute({
            accessToken: 'test-token',
            collectionId: 'collection123',
            fields: {
                name: 'Test Item',
                slug: 'test-item',
                'custom-field': 'Custom value',
            },
            isDraft: false,
            isArchived: false,
        });

        // Verify the client was created with the correct token
        expect(common.createClient).toHaveBeenCalledWith('test-token');

        // Verify getCollection was called with the correct ID
        expect(mockClient.getCollection).toHaveBeenCalledWith('collection123');

        // Verify createCollectionItem was called with the correct parameters
        expect(mockClient.createCollectionItem).toHaveBeenCalledWith('collection123', {
            fields: {
                name: 'Test Item',
                slug: 'test-item',
                'custom-field': 'Custom value',
                _draft: false,
                _archived: false,
            },
        });

        // Verify the result
        expect(result).toEqual({
            id: 'item123',
            name: 'Test Item',
            slug: 'test-item',
        });
    });

    it('should handle API errors', async () => {
        // Mock error response
        mockClient.getCollection.mockResolvedValue({
            error: 'Collection not found',
        });

        // Execute the action
        const result = await createCollectionItemAction.execute({
            accessToken: 'test-token',
            collectionId: 'invalid-collection',
            fields: {
                name: 'Test Item',
            },
        });

        // Verify the error is returned
        expect(result).toEqual({
            error: 'Collection not found',
        });
    });

    it('should handle exceptions', async () => {
        // Mock exception
        mockClient.getCollection.mockRejectedValue(new Error('Network error'));

        // Execute the action
        const result = await createCollectionItemAction.execute({
            accessToken: 'test-token',
            collectionId: 'collection123',
            fields: {
                name: 'Test Item',
            },
        });

        // Verify the error is returned
        expect(result).toEqual({
            error: 'Network error',
        });
    });
});
