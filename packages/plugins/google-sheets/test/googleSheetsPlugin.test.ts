import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import googleSheetsPlugin from '../src/index';
import * as utils from '../src/utils';

// Mock the utils functions
jest.mock('../src/utils');

describe('googleSheetsPlugin', () => {
    let executeGoogleSheets: any;

    beforeEach(() => {
        // Reset all mocks
        jest.resetAllMocks();

        // Get the execute function from the plugin
        executeGoogleSheets = googleSheetsPlugin.actions[0].execute;

        // Mock areSheetIdsValid to return true by default
        (utils.areSheetIdsValid as jest.Mock).mockReturnValue(true);
    });

    it('should have the correct plugin metadata', () => {
        expect(googleSheetsPlugin.name).toBe('Google Sheets');
        expect(googleSheetsPlugin.description).toBe('Create, edit, and collaborate on spreadsheets online');
        expect(googleSheetsPlugin.id).toBe('google-sheets');
        expect(googleSheetsPlugin.runner).toBe('node');
        expect(googleSheetsPlugin.actions.length).toBe(1);
    });

    it('should have the correct input schema', () => {
        expect(googleSheetsPlugin.inputSchema.type).toBe('object');
        expect(googleSheetsPlugin.inputSchema.properties.action.enum).toContain('insert_row');
        expect(googleSheetsPlugin.inputSchema.properties.action.enum).toContain('update_row');
        expect(googleSheetsPlugin.inputSchema.properties.action.enum).toContain('delete_row');
        expect(googleSheetsPlugin.inputSchema.properties.action.enum).toContain('find_rows');
        expect(googleSheetsPlugin.inputSchema.properties.action.enum).toContain('get_rows');
        expect(googleSheetsPlugin.inputSchema.properties.action.enum).toContain('create_spreadsheet');
        expect(googleSheetsPlugin.inputSchema.properties.action.enum).toContain('create_worksheet');
        expect(googleSheetsPlugin.inputSchema.properties.action.enum).toContain('clear_sheet');
        expect(googleSheetsPlugin.inputSchema.properties.action.enum).toContain('find_row_by_num');
        expect(googleSheetsPlugin.inputSchema.properties.action.enum).toContain('find_spreadsheets');
        expect(googleSheetsPlugin.inputSchema.properties.action.enum).toContain('find_worksheet');
        expect(googleSheetsPlugin.inputSchema.properties.action.enum).toContain('copy_worksheet');
        expect(googleSheetsPlugin.inputSchema.properties.action.enum).toContain('insert_multiple_rows');
        expect(googleSheetsPlugin.inputSchema.properties.action.enum).toContain('update_multiple_rows');
        expect(googleSheetsPlugin.inputSchema.properties.action.enum).toContain('create_column');
    });

    it('should have the correct example input and output', () => {
        expect(googleSheetsPlugin.exampleInput).toBeDefined();
        expect(googleSheetsPlugin.exampleOutput).toBeDefined();
    });

    it('should have the correct documentation URL', () => {
        expect(googleSheetsPlugin.documentation).toBe('https://developers.google.com/sheets/api/reference/rest');
    });

    it('should have the correct method', () => {
        expect(googleSheetsPlugin.method).toBe('exec');
    });

    it('should throw an error for missing required parameters', async () => {
        // Missing accessToken
        await expect(executeGoogleSheets({ action: 'insert_row' })).rejects.toThrow('Missing required parameters');

        // Missing action
        await expect(executeGoogleSheets({ accessToken: 'token123' })).rejects.toThrow('Missing required parameters');
    });

    it('should throw an error for unsupported action', async () => {
        await expect(executeGoogleSheets({
            action: 'unsupported_action',
            accessToken: 'token123'
        })).rejects.toThrow('Unsupported action');
    });

    it('should call insertRow for insert_row action', async () => {
        (utils.insertRow as jest.Mock).mockResolvedValue({ success: true });

        const result = await executeGoogleSheets({
            action: 'insert_row',
            accessToken: 'token123',
            spreadsheetId: 'sheet123',
            sheetId: 0,
            values: { A: 'test' }
        });

        expect(utils.insertRow).toHaveBeenCalledWith({
            accessToken: 'token123',
            spreadsheetId: 'sheet123',
            sheetId: 0,
            values: { A: 'test' },
            asString: undefined,
            firstRowHeaders: undefined
        });
        expect(result).toEqual({ success: true });
    });

    it('should call updateRow for update_row action', async () => {
        (utils.updateRow as jest.Mock).mockResolvedValue({ success: true });

        const result = await executeGoogleSheets({
            action: 'update_row',
            accessToken: 'token123',
            spreadsheetId: 'sheet123',
            sheetId: 0,
            rowIndex: 1,
            values: { A: 'test' }
        });

        expect(utils.updateRow).toHaveBeenCalledWith({
            accessToken: 'token123',
            spreadsheetId: 'sheet123',
            sheetId: 0,
            rowIndex: 1,
            values: { A: 'test' },
            asString: undefined,
            firstRowHeaders: undefined
        });
        expect(result).toEqual({ success: true });
    });

    it('should call deleteRow for delete_row action', async () => {
        (utils.deleteRow as jest.Mock).mockResolvedValue({ success: true });

        const result = await executeGoogleSheets({
            action: 'delete_row',
            accessToken: 'token123',
            spreadsheetId: 'sheet123',
            sheetId: 0,
            rowIndex: 1
        });

        expect(utils.deleteRow).toHaveBeenCalledWith({
            accessToken: 'token123',
            spreadsheetId: 'sheet123',
            sheetId: 0,
            rowIndex: 1
        });
        expect(result).toEqual({ success: true });
    });

    it('should call findRows for find_rows action', async () => {
        (utils.findRows as jest.Mock).mockResolvedValue([{ row: 1, values: { A: 'test' } }]);

        const result = await executeGoogleSheets({
            action: 'find_rows',
            accessToken: 'token123',
            spreadsheetId: 'sheet123',
            sheetId: 0,
            columnName: 'A',
            columnValue: 'test'
        });

        expect(utils.findRows).toHaveBeenCalledWith({
            accessToken: 'token123',
            spreadsheetId: 'sheet123',
            sheetId: 0,
            columnName: 'A',
            columnValue: 'test',
            firstRowHeaders: undefined
        });
        expect(result).toEqual([{ row: 1, values: { A: 'test' } }]);
    });

    it('should call getGoogleSheetRows for get_rows action', async () => {
        (utils.getGoogleSheetRows as jest.Mock).mockResolvedValue([{ row: 1, values: { A: 'test' } }]);

        const result = await executeGoogleSheets({
            action: 'get_rows',
            accessToken: 'token123',
            spreadsheetId: 'sheet123',
            sheetId: 0,
            rowIndexStart: 1,
            rowIndexEnd: 10
        });

        expect(utils.getGoogleSheetRows).toHaveBeenCalledWith({
            accessToken: 'token123',
            spreadsheetId: 'sheet123',
            sheetId: 0,
            rowIndexStart: 1,
            rowIndexEnd: 10
        });
        expect(result).toEqual([{ row: 1, values: { A: 'test' } }]);
    });

    it('should call createSpreadsheet for create_spreadsheet action', async () => {
        (utils.createSpreadsheet as jest.Mock).mockResolvedValue({ spreadsheetId: 'sheet123' });

        const result = await executeGoogleSheets({
            action: 'create_spreadsheet',
            accessToken: 'token123',
            title: 'New Spreadsheet'
        });

        expect(utils.createSpreadsheet).toHaveBeenCalledWith({
            accessToken: 'token123',
            title: 'New Spreadsheet'
        });
        expect(result).toEqual({ spreadsheetId: 'sheet123' });
    });

    it('should call createWorksheet for create_worksheet action', async () => {
        (utils.createWorksheet as jest.Mock).mockResolvedValue({ sheetId: 0 });

        const result = await executeGoogleSheets({
            action: 'create_worksheet',
            accessToken: 'token123',
            spreadsheetId: 'sheet123',
            title: 'New Worksheet',
            rows: 100,
            columns: 20
        });

        expect(utils.createWorksheet).toHaveBeenCalledWith({
            accessToken: 'token123',
            spreadsheetId: 'sheet123',
            title: 'New Worksheet',
            rows: 100,
            columns: 20
        });
        expect(result).toEqual({ sheetId: 0 });
    });

    it('should call clearSheet for clear_sheet action', async () => {
        (utils.clearSheet as jest.Mock).mockResolvedValue({ success: true });

        const result = await executeGoogleSheets({
            action: 'clear_sheet',
            accessToken: 'token123',
            spreadsheetId: 'sheet123',
            sheetId: 0,
            rowIndex: 1,
            numOfRows: 10
        });

        expect(utils.clearSheet).toHaveBeenCalledWith({
            accessToken: 'token123',
            spreadsheetId: 'sheet123',
            sheetId: 0,
            rowIndex: 1,
            numOfRows: 10
        });
        expect(result).toEqual({ success: true });
    });

    it('should call findRowByNum for find_row_by_num action', async () => {
        (utils.findRowByNum as jest.Mock).mockResolvedValue({ row: 1, values: { A: 'test' } });

        const result = await executeGoogleSheets({
            action: 'find_row_by_num',
            accessToken: 'token123',
            spreadsheetId: 'sheet123',
            sheetId: 0,
            rowIndex: 1
        });

        expect(utils.findRowByNum).toHaveBeenCalledWith({
            accessToken: 'token123',
            spreadsheetId: 'sheet123',
            sheetId: 0,
            rowIndex: 1
        });
        expect(result).toEqual({ row: 1, values: { A: 'test' } });
    });

    it('should call findSpreadsheets for find_spreadsheets action', async () => {
        (utils.findSpreadsheets as jest.Mock).mockResolvedValue([{ id: 'sheet123', name: 'Test Sheet' }]);

        const result = await executeGoogleSheets({
            action: 'find_spreadsheets',
            accessToken: 'token123',
            includeTeamDrives: true,
            searchValue: 'test'
        });

        expect(utils.findSpreadsheets).toHaveBeenCalledWith({
            accessToken: 'token123',
            includeTeamDrives: true,
            searchValue: 'test'
        });
        expect(result).toEqual([{ id: 'sheet123', name: 'Test Sheet' }]);
    });

    it('should call findWorksheet for find_worksheet action', async () => {
        (utils.findWorksheet as jest.Mock).mockResolvedValue({ properties: { sheetId: 0, title: 'Sheet1' } });

        const result = await executeGoogleSheets({
            action: 'find_worksheet',
            accessToken: 'token123',
            spreadsheetId: 'sheet123',
            worksheetId: 0
        });

        expect(utils.findWorksheet).toHaveBeenCalledWith({
            accessToken: 'token123',
            spreadsheetId: 'sheet123',
            worksheetId: 0
        });
        expect(result).toEqual({ properties: { sheetId: 0, title: 'Sheet1' } });
    });

    it('should call copyWorksheet for copy_worksheet action', async () => {
        (utils.copyWorksheet as jest.Mock).mockResolvedValue({ sheetId: 1 });

        const result = await executeGoogleSheets({
            action: 'copy_worksheet',
            accessToken: 'token123',
            spreadsheetId: 'sheet123',
            sourceSheetId: 0,
            destinationSpreadsheetId: 'sheet456',
            title: 'Copied Sheet'
        });

        expect(utils.copyWorksheet).toHaveBeenCalledWith({
            accessToken: 'token123',
            spreadsheetId: 'sheet123',
            sourceSheetId: 0,
            destinationSpreadsheetId: 'sheet456',
            title: 'Copied Sheet'
        });
        expect(result).toEqual({ sheetId: 1 });
    });

    it('should call insertMultipleRows for insert_multiple_rows action', async () => {
        (utils.insertMultipleRows as jest.Mock).mockResolvedValue({ success: true });

        const rowsData = [
            { A: 'test1', B: 'test2' },
            { A: 'test3', B: 'test4' }
        ];

        const result = await executeGoogleSheets({
            action: 'insert_multiple_rows',
            accessToken: 'token123',
            spreadsheetId: 'sheet123',
            sheetId: 0,
            rowsData,
            asString: true,
            firstRowHeaders: true
        });

        expect(utils.insertMultipleRows).toHaveBeenCalledWith({
            accessToken: 'token123',
            spreadsheetId: 'sheet123',
            sheetId: 0,
            rows: rowsData,
            asString: true,
            firstRowHeaders: true
        });
        expect(result).toEqual({ success: true });
    });

    it('should call updateMultipleRows for update_multiple_rows action', async () => {
        (utils.updateMultipleRows as jest.Mock).mockResolvedValue({ success: true });

        const rowsData = [
            { A: 'test1', B: 'test2' },
            { A: 'test3', B: 'test4' }
        ];

        const result = await executeGoogleSheets({
            action: 'update_multiple_rows',
            accessToken: 'token123',
            spreadsheetId: 'sheet123',
            sheetId: 0,
            startRowIndex: 1,
            rowsData,
            asString: true,
            firstRowHeaders: true
        });

        expect(utils.updateMultipleRows).toHaveBeenCalledWith({
            accessToken: 'token123',
            spreadsheetId: 'sheet123',
            sheetId: 0,
            startRowIndex: 1,
            rows: rowsData,
            asString: true,
            firstRowHeaders: true
        });
        expect(result).toEqual({ success: true });
    });

    it('should call createColumn for create_column action', async () => {
        (utils.createColumn as jest.Mock).mockResolvedValue({ success: true });

        const result = await executeGoogleSheets({
            action: 'create_column',
            accessToken: 'token123',
            spreadsheetId: 'sheet123',
            sheetId: 0,
            columnName: 'New Column',
            afterColumn: 'A'
        });

        expect(utils.createColumn).toHaveBeenCalledWith({
            accessToken: 'token123',
            spreadsheetId: 'sheet123',
            sheetId: 0,
            columnName: 'New Column',
            afterColumn: 'A'
        });
        expect(result).toEqual({ success: true });
    });

    it('should throw an error when sheet IDs are invalid', async () => {
        (utils.areSheetIdsValid as jest.Mock).mockReturnValue(false);

        await expect(executeGoogleSheets({
            action: 'insert_row',
            accessToken: 'token123',
            spreadsheetId: '',
            sheetId: 0,
            values: { A: 'test' }
        })).rejects.toThrow('Missing required parameters');
    });
});
