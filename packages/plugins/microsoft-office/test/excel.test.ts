import { jest } from '@jest/globals';
import * as excelActions from '../src/lib/actions/excel.js';
import { initGraphClient } from '../src/lib/common/index.js';

// Mock the Microsoft Graph client
jest.mock('../src/lib/common/index.js', () => ({
    initGraphClient: jest.fn(),
    handleGraphError: jest.fn((error) => error)
}));

describe('Excel Actions', () => {
    let mockClient: any;
    let mockApiMethod: any;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Create mock API method with chainable methods
        mockApiMethod = {
            select: jest.fn().mockReturnThis(),
            get: jest.fn(),
            post: jest.fn()
        };

        // Create mock client
        mockClient = {
            api: jest.fn().mockReturnValue(mockApiMethod)
        };

        // Set up the mock to return our mock client
        (initGraphClient as jest.Mock).mockReturnValue(mockClient);
    });

    describe('listWorkbooks', () => {
        it('should list Excel workbooks', async () => {
            // Mock response
            const mockResponse = {
                value: [
                    { id: 'workbook-1', name: 'Workbook 1.xlsx', webUrl: 'https://example.com/1' },
                    { id: 'workbook-2', name: 'Workbook 2.xlsx', webUrl: 'https://example.com/2' }
                ]
            };
            mockApiMethod.get.mockResolvedValue(mockResponse);

            // Call the function
            const result = await excelActions.listWorkbooks({ token: 'test-token' });

            // Verify the client was initialized with the token
            expect(initGraphClient).toHaveBeenCalledWith('test-token');

            // Verify the API was called with the correct path
            expect(mockClient.api).toHaveBeenCalledWith('/me/drive/root/search(q=\'.xlsx\')');
            expect(mockApiMethod.select).toHaveBeenCalledWith('id,name,webUrl');
            expect(mockApiMethod.get).toHaveBeenCalled();

            // Verify the result
            expect(result).toEqual([
                { id: 'workbook-1', name: 'Workbook 1.xlsx', webUrl: 'https://example.com/1' },
                { id: 'workbook-2', name: 'Workbook 2.xlsx', webUrl: 'https://example.com/2' }
            ]);
        });

        it('should handle errors', async () => {
            // Mock error
            const mockError = new Error('API error');
            mockApiMethod.get.mockRejectedValue(mockError);

            // Call the function and expect it to throw
            await expect(excelActions.listWorkbooks({ token: 'test-token' }))
                .rejects.toThrow();
        });
    });

    describe('getWorksheets', () => {
        it('should get worksheets from a workbook', async () => {
            // Mock response
            const mockResponse = {
                value: [
                    { id: 'sheet-1', name: 'Sheet 1', position: 0, visibility: 'Visible' },
                    { id: 'sheet-2', name: 'Sheet 2', position: 1, visibility: 'Visible' }
                ]
            };
            mockApiMethod.get.mockResolvedValue(mockResponse);

            // Call the function
            const result = await excelActions.getWorksheets({
                token: 'test-token',
                workbookId: 'workbook-1'
            });

            // Verify the client was initialized with the token
            expect(initGraphClient).toHaveBeenCalledWith('test-token');

            // Verify the API was called with the correct path
            expect(mockClient.api).toHaveBeenCalledWith('/me/drive/items/workbook-1/workbook/worksheets');
            expect(mockApiMethod.select).toHaveBeenCalledWith('id,name,position,visibility');
            expect(mockApiMethod.get).toHaveBeenCalled();

            // Verify the result
            expect(result).toEqual([
                { id: 'sheet-1', name: 'Sheet 1', position: 0, visibility: 'Visible' },
                { id: 'sheet-2', name: 'Sheet 2', position: 1, visibility: 'Visible' }
            ]);
        });
    });

    describe('getWorksheetData', () => {
        it('should get data from a worksheet with a range', async () => {
            // Mock response
            const mockResponse = {
                values: [
                    ['Header 1', 'Header 2'],
                    ['Value 1', 'Value 2']
                ]
            };
            mockApiMethod.get.mockResolvedValue(mockResponse);

            // Call the function
            const result = await excelActions.getWorksheetData({
                token: 'test-token',
                workbookId: 'workbook-1',
                worksheetId: 'sheet-1',
                range: 'A1:B2'
            });

            // Verify the client was initialized with the token
            expect(initGraphClient).toHaveBeenCalledWith('test-token');

            // Verify the API was called with the correct path
            expect(mockClient.api).toHaveBeenCalledWith(
                '/me/drive/items/workbook-1/workbook/worksheets/sheet-1/range(address=\'A1:B2\')'
            );
            expect(mockApiMethod.select).toHaveBeenCalledWith('values');
            expect(mockApiMethod.get).toHaveBeenCalled();

            // Verify the result
            expect(result).toEqual([
                ['Header 1', 'Header 2'],
                ['Value 1', 'Value 2']
            ]);
        });

        it('should get data from a worksheet without a range', async () => {
            // Mock response
            const mockResponse = {
                values: [
                    ['Header 1', 'Header 2'],
                    ['Value 1', 'Value 2']
                ]
            };
            mockApiMethod.get.mockResolvedValue(mockResponse);

            // Call the function
            const result = await excelActions.getWorksheetData({
                token: 'test-token',
                workbookId: 'workbook-1',
                worksheetId: 'sheet-1'
            });

            // Verify the client was initialized with the token
            expect(initGraphClient).toHaveBeenCalledWith('test-token');

            // Verify the API was called with the correct path
            expect(mockClient.api).toHaveBeenCalledWith(
                '/me/drive/items/workbook-1/workbook/worksheets/sheet-1/usedRange'
            );
            expect(mockApiMethod.select).toHaveBeenCalledWith('values');
            expect(mockApiMethod.get).toHaveBeenCalled();

            // Verify the result
            expect(result).toEqual([
                ['Header 1', 'Header 2'],
                ['Value 1', 'Value 2']
            ]);
        });
    });

    describe('addRow', () => {
        it('should add a row to a table', async () => {
            // Mock response
            const mockResponse = { id: 'row-1' };
            mockApiMethod.post.mockResolvedValue(mockResponse);

            // Call the function
            const result = await excelActions.addRow({
                token: 'test-token',
                workbookId: 'workbook-1',
                worksheetId: 'sheet-1',
                tableId: 'table-1',
                values: ['Value 1', 'Value 2']
            });

            // Verify the client was initialized with the token
            expect(initGraphClient).toHaveBeenCalledWith('test-token');

            // Verify the API was called with the correct path
            expect(mockClient.api).toHaveBeenCalledWith(
                '/me/drive/items/workbook-1/workbook/worksheets/sheet-1/tables/table-1/rows/add'
            );
            expect(mockApiMethod.post).toHaveBeenCalledWith({
                values: [['Value 1', 'Value 2']]
            });

            // Verify the result
            expect(result).toEqual({ id: 'row-1' });
        });
    });
});
