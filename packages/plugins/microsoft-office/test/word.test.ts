import { jest } from '@jest/globals';
import * as wordActions from '../src/lib/actions/word.js';
import { initGraphClient } from '../src/lib/common/index.js';

// Mock the Microsoft Graph client
jest.mock('../src/lib/common/index.js', () => ({
    initGraphClient: jest.fn(),
    handleGraphError: jest.fn((error) => error)
}));

describe('Word Actions', () => {
    let mockClient: any;
    let mockApiMethod: any;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Create mock API method with chainable methods
        mockApiMethod = {
            select: jest.fn().mockReturnThis(),
            get: jest.fn(),
            post: jest.fn(),
            put: jest.fn()
        };

        // Create mock client
        mockClient = {
            api: jest.fn().mockReturnValue(mockApiMethod)
        };

        // Set up the mock to return our mock client
        (initGraphClient as jest.Mock).mockReturnValue(mockClient);
    });

    describe('createDocument', () => {
        it('should create a Word document', async () => {
            // Mock responses
            const mockFileResponse = {
                id: 'document-1',
                name: 'Test Document.docx',
                webUrl: 'https://example.com/document-1'
            };
            mockApiMethod.post.mockResolvedValue(mockFileResponse);
            mockApiMethod.put.mockResolvedValue({});

            // Call the function
            const result = await wordActions.createDocument({
                token: 'test-token',
                name: 'Test Document.docx',
                content: 'Test content',
                contentType: 'text'
            });

            // Verify the client was initialized with the token
            expect(initGraphClient).toHaveBeenCalledWith('test-token');

            // Verify the API was called with the correct path for file creation
            expect(mockClient.api).toHaveBeenCalledWith('/me/drive/root/children');
            expect(mockApiMethod.post).toHaveBeenCalledWith({
                name: 'Test Document.docx',
                file: {},
                '@microsoft.graph.conflictBehavior': 'rename'
            });

            // Verify the API was called with the correct path for content upload
            expect(mockClient.api).toHaveBeenCalledWith('/me/drive/items/document-1/content');
            expect(mockApiMethod.put).toHaveBeenCalledWith('Test content');

            // Verify the result
            expect(result).toEqual({
                id: 'document-1',
                name: 'Test Document.docx',
                contentType: 'text'
            });
        });

        it('should handle HTML content type', async () => {
            // Mock responses
            const mockFileResponse = {
                id: 'document-1',
                name: 'Test Document.docx',
                webUrl: 'https://example.com/document-1'
            };
            mockApiMethod.post.mockResolvedValue(mockFileResponse);
            mockApiMethod.put.mockResolvedValue({});

            // Call the function
            const result = await wordActions.createDocument({
                token: 'test-token',
                name: 'Test Document.docx',
                content: '<p>Test content</p>',
                contentType: 'html'
            });

            // Verify content was processed correctly
            expect(mockApiMethod.put).toHaveBeenCalledWith('<p>Test content</p>');
            expect(result.contentType).toBe('html');
        });

        it('should handle errors', async () => {
            // Mock error
            const mockError = new Error('API error');
            mockApiMethod.post.mockRejectedValue(mockError);

            // Call the function and expect it to throw
            await expect(wordActions.createDocument({
                token: 'test-token',
                name: 'Test Document.docx',
                content: 'Test content',
                contentType: 'text'
            })).rejects.toThrow();
        });
    });

    describe('readDocument', () => {
        it('should read a Word document', async () => {
            // Mock responses
            const mockFileResponse = {
                id: 'document-1',
                name: 'Test Document.docx'
            };
            const mockContentResponse = 'Document content';

            // Set up the mock to return different responses for different API calls
            mockClient.api.mockImplementation((path: string) => {
                if (path.includes('/content')) {
                    mockApiMethod.get.mockResolvedValue(mockContentResponse);
                } else {
                    mockApiMethod.get.mockResolvedValue(mockFileResponse);
                }
                return mockApiMethod;
            });

            // Call the function
            const result = await wordActions.readDocument({
                token: 'test-token',
                documentId: 'document-1'
            });

            // Verify the client was initialized with the token
            expect(initGraphClient).toHaveBeenCalledWith('test-token');

            // Verify the API was called with the correct paths
            expect(mockClient.api).toHaveBeenCalledWith('/me/drive/items/document-1');
            expect(mockClient.api).toHaveBeenCalledWith('/me/drive/items/document-1/content');
            expect(mockApiMethod.select).toHaveBeenCalledWith('id,name');
            expect(mockApiMethod.get).toHaveBeenCalled();

            // Verify the result
            expect(result).toEqual({
                id: 'document-1',
                name: 'Test Document.docx',
                content: 'Document content',
                contentType: 'text'
            });
        });
    });

    describe('updateDocument', () => {
        it('should update a Word document', async () => {
            // Mock responses
            const mockFileResponse = {
                id: 'document-1',
                name: 'Test Document.docx'
            };
            mockApiMethod.get.mockResolvedValue(mockFileResponse);
            mockApiMethod.put.mockResolvedValue({});

            // Call the function
            const result = await wordActions.updateDocument({
                token: 'test-token',
                documentId: 'document-1',
                content: 'Updated content',
                contentType: 'text'
            });

            // Verify the client was initialized with the token
            expect(initGraphClient).toHaveBeenCalledWith('test-token');

            // Verify the API was called with the correct paths
            expect(mockClient.api).toHaveBeenCalledWith('/me/drive/items/document-1');
            expect(mockClient.api).toHaveBeenCalledWith('/me/drive/items/document-1/content');
            expect(mockApiMethod.select).toHaveBeenCalledWith('id,name');
            expect(mockApiMethod.get).toHaveBeenCalled();
            expect(mockApiMethod.put).toHaveBeenCalledWith('Updated content');

            // Verify the result
            expect(result).toEqual({
                id: 'document-1',
                name: 'Test Document.docx',
                contentType: 'text'
            });
        });

        it('should handle markdown content type', async () => {
            // Mock responses
            const mockFileResponse = {
                id: 'document-1',
                name: 'Test Document.docx'
            };
            mockApiMethod.get.mockResolvedValue(mockFileResponse);
            mockApiMethod.put.mockResolvedValue({});

            // Call the function
            const result = await wordActions.updateDocument({
                token: 'test-token',
                documentId: 'document-1',
                content: '# Heading\n\nContent',
                contentType: 'markdown'
            });

            // Verify content was processed correctly
            expect(mockApiMethod.put).toHaveBeenCalledWith('# Heading\n\nContent');
            expect(result.contentType).toBe('markdown');
        });
    });
});
