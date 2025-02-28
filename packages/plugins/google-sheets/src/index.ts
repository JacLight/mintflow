import {
    areSheetIdsValid,
    clearSheet,
    copyWorksheet,
    createColumn,
    createSpreadsheet,
    createWorksheet,
    deleteRow,
    findRowByNum,
    findRows,
    findSpreadsheets,
    findWorksheet,
    getGoogleSheetRows,
    insertMultipleRows,
    insertRow,
    updateMultipleRows,
    updateRow
} from './utils';

const googleSheetsPlugin = {
    name: "Google Sheets",
    icon: "",
    description: "Create, edit, and collaborate on spreadsheets online",
    id: "google-sheets",
    runner: "node",
    inputSchema: {
        type: "object",
        properties: {
            action: {
                type: 'string',
                enum: [
                    'insert_row',
                    'update_row',
                    'delete_row',
                    'find_rows',
                    'get_rows',
                    'create_spreadsheet',
                    'create_worksheet',
                    'clear_sheet',
                    'find_row_by_num',
                    'find_spreadsheets',
                    'find_worksheet',
                    'copy_worksheet',
                    'insert_multiple_rows',
                    'update_multiple_rows',
                    'create_column'
                ],
                description: 'Action to perform on Google Sheets',
            },
            accessToken: {
                type: 'string',
                description: 'Google OAuth2 Access Token',
            },
            // Common fields
            spreadsheetId: {
                type: 'string',
                description: 'Google Spreadsheet ID',
                rules: [
                    { operation: 'notEqual', valueA: 'create_spreadsheet', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'find_spreadsheets', valueB: '{{action}}', action: 'hide' },
                ],
            },
            sheetId: {
                type: 'number',
                description: 'Sheet ID within the spreadsheet',
                rules: [
                    { operation: 'notEqual', valueA: 'create_spreadsheet', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'create_worksheet', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'find_spreadsheets', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Fields for insert_row
            values: {
                type: 'object',
                description: 'Values to insert in the row',
                rules: [
                    { operation: 'notEqual', valueA: 'insert_row', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'update_row', valueB: '{{action}}', action: 'hide' },
                ],
            },
            asString: {
                type: 'boolean',
                description: 'Insert values as strings (no formulas)',
                default: false,
                rules: [
                    { operation: 'notEqual', valueA: 'insert_row', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'update_row', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'insert_multiple_rows', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'update_multiple_rows', valueB: '{{action}}', action: 'hide' },
                ],
            },
            firstRowHeaders: {
                type: 'boolean',
                description: 'First row contains headers',
                default: true,
                rules: [
                    { operation: 'notEqual', valueA: 'insert_row', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'update_row', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'find_rows', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'insert_multiple_rows', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'update_multiple_rows', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Fields for update_row
            rowIndex: {
                type: 'number',
                description: 'Row index to update',
                rules: [
                    { operation: 'notEqual', valueA: 'update_row', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'delete_row', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'find_row_by_num', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'clear_sheet', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Fields for find_rows
            columnName: {
                type: 'string',
                description: 'Column name to search in',
                rules: [
                    { operation: 'notEqual', valueA: 'find_rows', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'create_column', valueB: '{{action}}', action: 'hide' },
                ],
            },
            columnValue: {
                type: 'string',
                description: 'Value to search for',
                rules: [
                    { operation: 'notEqual', valueA: 'find_rows', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Fields for get_rows
            rowIndexStart: {
                type: 'number',
                description: 'Starting row index',
                rules: [
                    { operation: 'notEqual', valueA: 'get_rows', valueB: '{{action}}', action: 'hide' },
                ],
            },
            rowIndexEnd: {
                type: 'number',
                description: 'Ending row index',
                rules: [
                    { operation: 'notEqual', valueA: 'get_rows', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Fields for create_spreadsheet
            title: {
                type: 'string',
                description: 'Title of the spreadsheet or worksheet',
                rules: [
                    { operation: 'notEqual', valueA: 'create_spreadsheet', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'create_worksheet', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'copy_worksheet', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Fields for create_worksheet
            rows: {
                type: 'number',
                description: 'Number of rows in the worksheet',
                default: 1000,
                rules: [
                    { operation: 'notEqual', valueA: 'create_worksheet', valueB: '{{action}}', action: 'hide' },
                ],
            },
            columns: {
                type: 'number',
                description: 'Number of columns in the worksheet',
                default: 26,
                rules: [
                    { operation: 'notEqual', valueA: 'create_worksheet', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Fields for clear_sheet
            numOfRows: {
                type: 'number',
                description: 'Number of rows to clear',
                rules: [
                    { operation: 'notEqual', valueA: 'clear_sheet', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Fields for find_spreadsheets
            includeTeamDrives: {
                type: 'boolean',
                description: 'Include team drives',
                default: false,
                rules: [
                    { operation: 'notEqual', valueA: 'find_spreadsheets', valueB: '{{action}}', action: 'hide' },
                ],
            },
            searchValue: {
                type: 'string',
                description: 'Search value for spreadsheets',
                rules: [
                    { operation: 'notEqual', valueA: 'find_spreadsheets', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Fields for find_worksheet
            worksheetId: {
                type: 'number',
                description: 'Worksheet ID to find',
                rules: [
                    { operation: 'notEqual', valueA: 'find_worksheet', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Fields for copy_worksheet
            sourceSheetId: {
                type: 'number',
                description: 'Source sheet ID to copy',
                rules: [
                    { operation: 'notEqual', valueA: 'copy_worksheet', valueB: '{{action}}', action: 'hide' },
                ],
            },
            destinationSpreadsheetId: {
                type: 'string',
                description: 'Destination spreadsheet ID',
                rules: [
                    { operation: 'notEqual', valueA: 'copy_worksheet', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Fields for insert_multiple_rows and update_multiple_rows
            rowsData: {
                type: 'array',
                description: 'Array of row data to insert or update',
                rules: [
                    { operation: 'notEqual', valueA: 'insert_multiple_rows', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'update_multiple_rows', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Fields for update_multiple_rows
            startRowIndex: {
                type: 'number',
                description: 'Starting row index for updating multiple rows',
                rules: [
                    { operation: 'notEqual', valueA: 'update_multiple_rows', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Fields for create_column
            afterColumn: {
                type: 'string',
                description: 'Column name to insert after (optional)',
                rules: [
                    { operation: 'notEqual', valueA: 'create_column', valueB: '{{action}}', action: 'hide' },
                ],
            },
        },
        required: ['action', 'accessToken'],
    },
    outputSchema: {
        type: "object",
    },
    exampleInput: {
        action: 'insert_row',
        accessToken: 'your-google-oauth2-token',
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        sheetId: 0,
        values: {
            A: 'Value 1',
            B: 'Value 2',
            C: 'Value 3'
        },
        asString: true,
        firstRowHeaders: true
    },
    exampleOutput: {
        spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
        updatedRange: 'Sheet1!A2:C2',
        updatedRows: 1,
        updatedColumns: 3,
        updatedCells: 3,
        row: 2
    },
    documentation: "https://developers.google.com/sheets/api/reference/rest",
    method: "exec",
    actions: [
        {
            name: 'google-sheets',
            execute: async (input: any): Promise<any> => {
                const { action, accessToken } = input;

                if (!action || !accessToken) {
                    throw new Error('Missing required parameters: action, accessToken');
                }

                switch (action) {
                    case 'insert_row': {
                        const { spreadsheetId, sheetId, values, asString, firstRowHeaders } = input;

                        if (!areSheetIdsValid(spreadsheetId, sheetId) || !values) {
                            throw new Error('Missing required parameters: spreadsheetId, sheetId, values');
                        }

                        return await insertRow({
                            accessToken,
                            spreadsheetId,
                            sheetId: Number(sheetId),
                            values,
                            asString,
                            firstRowHeaders
                        });
                    }

                    case 'update_row': {
                        const { spreadsheetId, sheetId, rowIndex, values, asString, firstRowHeaders } = input;

                        if (!areSheetIdsValid(spreadsheetId, sheetId) || !rowIndex || !values) {
                            throw new Error('Missing required parameters: spreadsheetId, sheetId, rowIndex, values');
                        }

                        return await updateRow({
                            accessToken,
                            spreadsheetId,
                            sheetId: Number(sheetId),
                            rowIndex: Number(rowIndex),
                            values,
                            asString,
                            firstRowHeaders
                        });
                    }

                    case 'delete_row': {
                        const { spreadsheetId, sheetId, rowIndex } = input;

                        if (!areSheetIdsValid(spreadsheetId, sheetId) || !rowIndex) {
                            throw new Error('Missing required parameters: spreadsheetId, sheetId, rowIndex');
                        }

                        return await deleteRow({
                            accessToken,
                            spreadsheetId,
                            sheetId: Number(sheetId),
                            rowIndex: Number(rowIndex)
                        });
                    }

                    case 'find_rows': {
                        const { spreadsheetId, sheetId, columnName, columnValue, firstRowHeaders } = input;

                        if (!areSheetIdsValid(spreadsheetId, sheetId) || !columnName || columnValue === undefined) {
                            throw new Error('Missing required parameters: spreadsheetId, sheetId, columnName, columnValue');
                        }

                        return await findRows({
                            accessToken,
                            spreadsheetId,
                            sheetId: Number(sheetId),
                            columnName,
                            columnValue,
                            firstRowHeaders
                        });
                    }

                    case 'get_rows': {
                        const { spreadsheetId, sheetId, rowIndexStart, rowIndexEnd } = input;

                        if (!areSheetIdsValid(spreadsheetId, sheetId)) {
                            throw new Error('Missing required parameters: spreadsheetId, sheetId');
                        }

                        return await getGoogleSheetRows({
                            accessToken,
                            spreadsheetId,
                            sheetId: Number(sheetId),
                            rowIndexStart: rowIndexStart ? Number(rowIndexStart) : undefined,
                            rowIndexEnd: rowIndexEnd ? Number(rowIndexEnd) : undefined
                        });
                    }

                    case 'create_spreadsheet': {
                        const { title } = input;

                        if (!title) {
                            throw new Error('Missing required parameter: title');
                        }

                        return await createSpreadsheet({
                            accessToken,
                            title
                        });
                    }

                    case 'create_worksheet': {
                        const { spreadsheetId, title, rows, columns } = input;

                        if (!spreadsheetId || !title) {
                            throw new Error('Missing required parameters: spreadsheetId, title');
                        }

                        return await createWorksheet({
                            accessToken,
                            spreadsheetId,
                            title,
                            rows: rows ? Number(rows) : undefined,
                            columns: columns ? Number(columns) : undefined
                        });
                    }

                    case 'clear_sheet': {
                        const { spreadsheetId, sheetId, rowIndex, numOfRows } = input;

                        if (!areSheetIdsValid(spreadsheetId, sheetId) || !rowIndex || !numOfRows) {
                            throw new Error('Missing required parameters: spreadsheetId, sheetId, rowIndex, numOfRows');
                        }

                        return await clearSheet({
                            accessToken,
                            spreadsheetId,
                            sheetId: Number(sheetId),
                            rowIndex: Number(rowIndex),
                            numOfRows: Number(numOfRows)
                        });
                    }

                    case 'find_row_by_num': {
                        const { spreadsheetId, sheetId, rowIndex } = input;

                        if (!areSheetIdsValid(spreadsheetId, sheetId) || !rowIndex) {
                            throw new Error('Missing required parameters: spreadsheetId, sheetId, rowIndex');
                        }

                        return await findRowByNum({
                            accessToken,
                            spreadsheetId,
                            sheetId: Number(sheetId),
                            rowIndex: Number(rowIndex)
                        });
                    }

                    case 'find_spreadsheets': {
                        const { includeTeamDrives, searchValue } = input;

                        return await findSpreadsheets({
                            accessToken,
                            includeTeamDrives,
                            searchValue
                        });
                    }

                    case 'find_worksheet': {
                        const { spreadsheetId, worksheetId } = input;

                        if (!spreadsheetId || !worksheetId) {
                            throw new Error('Missing required parameters: spreadsheetId, worksheetId');
                        }

                        return await findWorksheet({
                            accessToken,
                            spreadsheetId,
                            worksheetId: Number(worksheetId)
                        });
                    }

                    case 'copy_worksheet': {
                        const { spreadsheetId, sourceSheetId, destinationSpreadsheetId, title } = input;

                        if (!spreadsheetId || !sourceSheetId || !destinationSpreadsheetId) {
                            throw new Error('Missing required parameters: spreadsheetId, sourceSheetId, destinationSpreadsheetId');
                        }

                        return await copyWorksheet({
                            accessToken,
                            spreadsheetId,
                            sourceSheetId: Number(sourceSheetId),
                            destinationSpreadsheetId,
                            title
                        });
                    }

                    case 'insert_multiple_rows': {
                        const { spreadsheetId, sheetId, rowsData, asString, firstRowHeaders } = input;

                        if (!areSheetIdsValid(spreadsheetId, sheetId) || !rowsData || !Array.isArray(rowsData)) {
                            throw new Error('Missing required parameters: spreadsheetId, sheetId, rowsData (array)');
                        }

                        return await insertMultipleRows({
                            accessToken,
                            spreadsheetId,
                            sheetId: Number(sheetId),
                            rows: rowsData,
                            asString,
                            firstRowHeaders
                        });
                    }

                    case 'update_multiple_rows': {
                        const { spreadsheetId, sheetId, startRowIndex, rowsData, asString, firstRowHeaders } = input;

                        if (!areSheetIdsValid(spreadsheetId, sheetId) || !startRowIndex || !rowsData || !Array.isArray(rowsData)) {
                            throw new Error('Missing required parameters: spreadsheetId, sheetId, startRowIndex, rowsData (array)');
                        }

                        return await updateMultipleRows({
                            accessToken,
                            spreadsheetId,
                            sheetId: Number(sheetId),
                            startRowIndex: Number(startRowIndex),
                            rows: rowsData,
                            asString,
                            firstRowHeaders
                        });
                    }

                    case 'create_column': {
                        const { spreadsheetId, sheetId, columnName, afterColumn } = input;

                        if (!areSheetIdsValid(spreadsheetId, sheetId) || !columnName) {
                            throw new Error('Missing required parameters: spreadsheetId, sheetId, columnName');
                        }

                        return await createColumn({
                            accessToken,
                            spreadsheetId,
                            sheetId: Number(sheetId),
                            columnName,
                            afterColumn
                        });
                    }

                    default:
                        throw new Error(`Unsupported action: ${action}`);
                }
            }
        }
    ]
};

export default googleSheetsPlugin;
