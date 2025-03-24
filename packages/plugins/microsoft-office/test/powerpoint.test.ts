import { jest } from '@jest/globals';
import * as powerPointActions from '../src/lib/actions/powerpoint.js';
import { initGraphClient } from '../src/lib/common/index.js';

// Mock the Microsoft Graph client
jest.mock('../src/lib/common/index.js', () => ({
    initGraphClient: jest.fn(),
    handleGraphError: jest.fn((error) => error)
}));

describe('PowerPoint Actions', () => {
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

    describe('createPresentation', () => {
        it('should create a PowerPoint presentation', async () => {
            // Mock responses
            const mockFileResponse = {
                id: 'presentation-1',
                name: 'Test Presentation.pptx',
                webUrl: 'https://example.com/presentation-1'
            };
            mockApiMethod.post.mockResolvedValue(mockFileResponse);

            // Call the function
            const result = await powerPointActions.createPresentation({
                token: 'test-token',
                name: 'Test Presentation.pptx',
                slides: [
                    { title: 'Slide 1', content: 'Content 1' },
                    { title: 'Slide 2', content: 'Content 2' }
                ]
            });

            // Verify the client was initialized with the token
            expect(initGraphClient).toHaveBeenCalledWith('test-token');

            // Verify the API was called with the correct path for file creation
            expect(mockClient.api).toHaveBeenCalledWith('/me/drive/root/children');
            expect(mockApiMethod.post).toHaveBeenCalledWith({
                name: 'Test Presentation.pptx',
                file: {},
                '@microsoft.graph.conflictBehavior': 'rename'
            });

            // Verify the result
            expect(result).toEqual({
                id: 'presentation-1',
                name: 'Test Presentation.pptx',
                webUrl: 'https://example.com/presentation-1',
                slideCount: 2
            });
        });

        it('should handle errors', async () => {
            // Mock error
            const mockError = new Error('API error');
            mockApiMethod.post.mockRejectedValue(mockError);

            // Call the function and expect it to throw
            await expect(powerPointActions.createPresentation({
                token: 'test-token',
                name: 'Test Presentation.pptx',
                slides: [
                    { title: 'Slide 1', content: 'Content 1' }
                ]
            })).rejects.toThrow();
        });
    });

    describe('addSlide', () => {
        it('should add a slide to a presentation', async () => {
            // Mock responses
            const mockFileResponse = {
                id: 'presentation-1',
                name: 'Test Presentation.pptx',
                webUrl: 'https://example.com/presentation-1'
            };
            mockApiMethod.get.mockResolvedValue(mockFileResponse);

            // Call the function
            const result = await powerPointActions.addSlide({
                token: 'test-token',
                presentationId: 'presentation-1',
                title: 'New Slide',
                content: 'New Content'
            });

            // Verify the client was initialized with the token
            expect(initGraphClient).toHaveBeenCalledWith('test-token');

            // Verify the API was called with the correct path
            expect(mockClient.api).toHaveBeenCalledWith('/me/drive/items/presentation-1');
            expect(mockApiMethod.select).toHaveBeenCalledWith('id,name,webUrl');
            expect(mockApiMethod.get).toHaveBeenCalled();

            // Verify the result
            expect(result).toEqual({
                id: 'presentation-1',
                name: 'Test Presentation.pptx',
                webUrl: 'https://example.com/presentation-1',
                slideCount: 0
            });
        });
    });

    describe('exportPresentation', () => {
        it('should export a presentation to PDF', async () => {
            // Mock responses
            const mockFileResponse = {
                id: 'presentation-1',
                name: 'Test Presentation.pptx'
            };
            mockApiMethod.get.mockResolvedValue(mockFileResponse);

            // Call the function
            const result = await powerPointActions.exportPresentation({
                token: 'test-token',
                presentationId: 'presentation-1',
                format: 'pdf'
            });

            // Verify the client was initialized with the token
            expect(initGraphClient).toHaveBeenCalledWith('test-token');

            // Verify the API was called with the correct path
            expect(mockClient.api).toHaveBeenCalledWith('/me/drive/items/presentation-1');
            expect(mockApiMethod.select).toHaveBeenCalledWith('id,name');
            expect(mockApiMethod.get).toHaveBeenCalled();

            // Verify the result
            expect(result).toEqual({
                id: 'presentation-1',
                name: 'Test Presentation.pdf',
                contentType: 'application/pdf',
                content: 'base64-encoded-content'
            });
        });

        it('should export a presentation to PNG', async () => {
            // Mock responses
            const mockFileResponse = {
                id: 'presentation-1',
                name: 'Test Presentation.pptx'
            };
            mockApiMethod.get.mockResolvedValue(mockFileResponse);

            // Call the function
            const result = await powerPointActions.exportPresentation({
                token: 'test-token',
                presentationId: 'presentation-1',
                format: 'png'
            });

            // Verify the result has the correct content type
            expect(result.contentType).toBe('image/png');
            expect(result.name).toBe('Test Presentation.png');
        });

        it('should export a presentation to JPG', async () => {
            // Mock responses
            const mockFileResponse = {
                id: 'presentation-1',
                name: 'Test Presentation.pptx'
            };
            mockApiMethod.get.mockResolvedValue(mockFileResponse);

            // Call the function
            const result = await powerPointActions.exportPresentation({
                token: 'test-token',
                presentationId: 'presentation-1',
                format: 'jpg'
            });

            // Verify the result has the correct content type
            expect(result.contentType).toBe('image/jpg');
            expect(result.name).toBe('Test Presentation.jpg');
        });
    });
});
