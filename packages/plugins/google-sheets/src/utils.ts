import { google } from 'googleapis';
import {
    AppendGoogleSheetValuesParams,
    Dimension,
    GoogleSheetsClearSheetParams,
    GoogleSheetsCopyWorksheetParams,
    GoogleSheetsCreateColumnParams,
    GoogleSheetsCreateSpreadsheetParams,
    GoogleSheetsCreateWorksheetParams,
    GoogleSheetsDeleteRowParams,
    GoogleSheetsFindRowByNumParams,
    GoogleSheetsFindRowsParams,
    GoogleSheetsFindSpreadsheetsParams,
    GoogleSheetsFindWorksheetParams,
    GoogleSheetsGetRowsParams,
    GoogleSheetsInsertMultipleRowsParams,
    GoogleSheetsInsertRowParams,
    GoogleSheetsRow,
    GoogleSheetsUpdateMultipleRowsParams,
    GoogleSheetsUpdateRowParams,
    ValueInputOption
} from './models';

export const googleSheetsBaseUrl = 'https://sheets.googleapis.com/v4/spreadsheets';

/**
 * Create a Google Sheets client
 */
export const createGoogleSheetsClient = (accessToken: string) => {
    return google.sheets({
        version: 'v4',
        auth: accessToken
    });
};

/**
 * Create a Google Drive client
 */
export const createGoogleDriveClient = (accessToken: string) => {
    return google.drive({
        version: 'v3',
        auth: accessToken
    });
};

/**
 * Find sheet name by ID
 */
export const findSheetName = async (
    accessToken: string,
    spreadsheetId: string,
    sheetId: number | string
): Promise<string> => {
    const sheets = await listSheetsName(accessToken, spreadsheetId);
    // don't use === because sheetId can be a string when dynamic values are used
    const sheet = sheets.find((f) => f.properties && f.properties.sheetId == sheetId);
    const sheetName = sheet?.properties?.title;
    if (!sheetName) {
        throw Error(`Sheet with ID ${sheetId} not found in spreadsheet ${spreadsheetId}`);
    }
    return sheetName;
};

/**
 * List sheets in a spreadsheet
 */
export const listSheetsName = async (accessToken: string, spreadsheetId: string) => {
    const sheetsClient = createGoogleSheetsClient(accessToken);
    const response = await sheetsClient.spreadsheets.get({
        spreadsheetId: spreadsheetId
    });
    return response.data.sheets || [];
};

/**
 * Get rows from a Google Sheet
 */
export const getGoogleSheetRows = async (params: GoogleSheetsGetRowsParams): Promise<GoogleSheetsRow[]> => {
    const { spreadsheetId, accessToken, sheetId, rowIndexStart, rowIndexEnd } = params;

    // Get sheet name
    const sheetName = await findSheetName(accessToken, spreadsheetId, sheetId);
    if (!sheetName) {
        return [];
    }

    // Determine range
    let range = '';
    if (rowIndexStart !== undefined) {
        range = `!A${rowIndexStart}:ZZZ`;
    }
    if (rowIndexStart !== undefined && rowIndexEnd !== undefined) {
        range = `!A${rowIndexStart}:ZZZ${rowIndexEnd}`;
    }

    // Get rows
    const sheetsClient = createGoogleSheetsClient(accessToken);
    const rowsResponse = await sheetsClient.spreadsheets.values.get({
        spreadsheetId: spreadsheetId,
        range: `${sheetName}${range}`
    });

    if (!rowsResponse.data.values) return [];

    // Get headers
    const headerResponse = await sheetsClient.spreadsheets.values.get({
        spreadsheetId: spreadsheetId,
        range: `${sheetName}!A1:ZZZ1`
    });

    const headers = headerResponse.data.values?.[0] ?? [];
    const headerCount = headers.length;

    const startingRow = rowIndexStart ? rowIndexStart - 1 : 0;

    // Transform values to labeled rows
    return transformWorkSheetValues(
        rowsResponse.data.values,
        startingRow,
        headerCount
    );
};

/**
 * Transform worksheet values to labeled rows
 */
export const transformWorkSheetValues = (
    values: any[][],
    startingRow: number,
    headerCount: number
): GoogleSheetsRow[] => {
    return values.map((row, index) => {
        const rowObj: { [key: string]: string } = {};
        for (let i = 0; i < headerCount; i++) {
            const columnLabel = columnToLabel(i);
            rowObj[columnLabel] = row[i] !== undefined ? row[i] : '';
        }
        return {
            row: startingRow + index + 1,
            values: rowObj
        };
    });
};

/**
 * Get header row from a Google Sheet
 */
export const getHeaderRow = async (params: {
    spreadsheetId: string;
    accessToken: string;
    sheetId: number;
}): Promise<string[] | undefined> => {
    const rows = await getGoogleSheetRows({
        spreadsheetId: params.spreadsheetId,
        accessToken: params.accessToken,
        sheetId: params.sheetId,
        rowIndexStart: 1,
        rowIndexEnd: 1
    });

    if (rows.length === 0) {
        return undefined;
    }

    return objectToArray(rows[0].values);
};

/**
 * Convert column index to label (e.g., 0 -> A, 1 -> B, 26 -> AA)
 */
export const columnToLabel = (columnIndex: number): string => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let label = '';

    while (columnIndex >= 0) {
        label = alphabet[columnIndex % 26] + label;
        columnIndex = Math.floor(columnIndex / 26) - 1;
    }

    return label;
};

/**
 * Convert label to column index (e.g., A -> 0, B -> 1, AA -> 26)
 */
export const labelToColumn = (label: string): number => {
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let column = 0;

    for (let i = 0; i < label.length; i++) {
        column += (alphabet.indexOf(label[i]) + 1) * Math.pow(26, label.length - i - 1);
    }

    return column - 1;
};

/**
 * Convert object to array
 */
export const objectToArray = (obj: { [x: string]: any }): any[] => {
    const maxIndex = Math.max(...Object.keys(obj).map((key) => labelToColumn(key)));
    const arr = new Array(maxIndex + 1);

    for (const key in obj) {
        arr[labelToColumn(key)] = obj[key];
    }

    return arr;
};

/**
 * Stringify array values
 */
export const stringifyArray = (object: unknown[]): string[] => {
    return object.map((val) => {
        if (typeof val === 'string') {
            return val;
        }
        return JSON.stringify(val);
    });
};

/**
 * Insert a row into a Google Sheet
 */
export const insertRow = async (params: GoogleSheetsInsertRowParams): Promise<any> => {
    const { accessToken, spreadsheetId, sheetId, values, asString, firstRowHeaders } = params;

    // Get sheet name
    const sheetName = await findSheetName(accessToken, spreadsheetId, sheetId);

    // Format values
    const formattedValues = firstRowHeaders
        ? objectToArray(values).map(val => val === null || val === undefined ? '' : val)
        : values;

    // Append values
    const result = await appendGoogleSheetValues({
        accessToken,
        majorDimension: Dimension.COLUMNS,
        range: sheetName,
        spreadSheetId: spreadsheetId,
        valueInputOption: asString ? ValueInputOption.RAW : ValueInputOption.USER_ENTERED,
        values: stringifyArray(formattedValues)
    });

    // Extract row number
    const updatedRowNumber = extractRowNumber(result.updatedRange);
    return { ...result, row: updatedRowNumber };
};

/**
 * Extract row number from updated range
 */
export const extractRowNumber = (updatedRange: string): number => {
    const rowRange = updatedRange.split('!')[1];
    return parseInt(rowRange.split(':')[0].substring(1), 10);
};

/**
 * Append values to a Google Sheet
 */
export const appendGoogleSheetValues = async (params: AppendGoogleSheetValuesParams): Promise<any> => {
    const { accessToken, majorDimension, range, spreadSheetId, valueInputOption, values } = params;

    const sheetsClient = createGoogleSheetsClient(accessToken);

    const response = await sheetsClient.spreadsheets.values.append({
        spreadsheetId: spreadSheetId,
        range: `${range}!A:A`,
        valueInputOption: valueInputOption,
        requestBody: {
            majorDimension,
            range: `${range}!A:A`,
            values: values.map(val => [val])
        }
    });

    return response.data;
};

/**
 * Update a row in a Google Sheet
 */
export const updateRow = async (params: GoogleSheetsUpdateRowParams): Promise<any> => {
    const { accessToken, spreadsheetId, sheetId, rowIndex, values, asString, firstRowHeaders } = params;

    // Get sheet name
    const sheetName = await findSheetName(accessToken, spreadsheetId, sheetId);

    // Format values
    const formattedValues = firstRowHeaders
        ? objectToArray(values).map(val => val === null || val === undefined ? '' : val)
        : values;

    // Update values
    const sheetsClient = createGoogleSheetsClient(accessToken);

    const response = await sheetsClient.spreadsheets.values.update({
        spreadsheetId: spreadsheetId,
        range: `${sheetName}!A${rowIndex}:ZZ${rowIndex}`,
        valueInputOption: asString ? ValueInputOption.RAW : ValueInputOption.USER_ENTERED,
        requestBody: {
            majorDimension: Dimension.ROWS,
            range: `${sheetName}!A${rowIndex}:ZZ${rowIndex}`,
            values: [stringifyArray(formattedValues)]
        }
    });

    return response.data;
};

/**
 * Delete a row from a Google Sheet
 */
export const deleteRow = async (params: GoogleSheetsDeleteRowParams): Promise<any> => {
    const { accessToken, spreadsheetId, sheetId, rowIndex } = params;

    const sheetsClient = createGoogleSheetsClient(accessToken);

    const response = await sheetsClient.spreadsheets.batchUpdate({
        spreadsheetId: spreadsheetId,
        requestBody: {
            requests: [
                {
                    deleteDimension: {
                        range: {
                            sheetId: sheetId,
                            dimension: 'ROWS',
                            startIndex: rowIndex - 1,
                            endIndex: rowIndex
                        }
                    }
                }
            ]
        }
    });

    return response.data;
};

/**
 * Find rows in a Google Sheet
 */
export const findRows = async (params: GoogleSheetsFindRowsParams): Promise<GoogleSheetsRow[]> => {
    const { accessToken, spreadsheetId, sheetId, columnName, columnValue, firstRowHeaders } = params;

    // Get all rows
    const rows = await getGoogleSheetRows({
        spreadsheetId,
        accessToken,
        sheetId
    });

    // If first row is headers, skip it
    const startIndex = firstRowHeaders ? 1 : 0;

    // Filter rows
    return rows.slice(startIndex).filter(row => {
        return row.values[columnName] === columnValue;
    });
};

/**
 * Create a new spreadsheet
 */
export const createSpreadsheet = async (params: GoogleSheetsCreateSpreadsheetParams): Promise<any> => {
    const { accessToken, title } = params;

    const sheetsClient = createGoogleSheetsClient(accessToken);

    const response = await sheetsClient.spreadsheets.create({
        requestBody: {
            properties: {
                title
            }
        }
    });

    return response.data;
};

/**
 * Create a new worksheet in a spreadsheet
 */
export const createWorksheet = async (params: GoogleSheetsCreateWorksheetParams): Promise<any> => {
    const { accessToken, spreadsheetId, title, rows = 1000, columns = 26 } = params;

    const sheetsClient = createGoogleSheetsClient(accessToken);

    const response = await sheetsClient.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
            requests: [
                {
                    addSheet: {
                        properties: {
                            title,
                            gridProperties: {
                                rowCount: rows,
                                columnCount: columns
                            }
                        }
                    }
                }
            ]
        }
    });

    return response.data;
};

/**
 * Clear a sheet
 */
export const clearSheet = async (params: GoogleSheetsClearSheetParams): Promise<any> => {
    const { accessToken, spreadsheetId, sheetId, rowIndex, numOfRows } = params;

    const sheetsClient = createGoogleSheetsClient(accessToken);

    const response = await sheetsClient.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
            requests: [
                {
                    deleteDimension: {
                        range: {
                            sheetId: sheetId,
                            dimension: 'ROWS',
                            startIndex: rowIndex - 1,
                            endIndex: rowIndex + numOfRows - 1
                        }
                    }
                }
            ]
        }
    });

    return response.data;
};

/**
 * Find a row by row number
 */
export const findRowByNum = async (params: GoogleSheetsFindRowByNumParams): Promise<GoogleSheetsRow | null> => {
    const { accessToken, spreadsheetId, sheetId, rowIndex } = params;

    const rows = await getGoogleSheetRows({
        spreadsheetId,
        accessToken,
        sheetId,
        rowIndexStart: rowIndex,
        rowIndexEnd: rowIndex
    });

    return rows.length > 0 ? rows[0] : null;
};

/**
 * Find spreadsheets
 */
export const findSpreadsheets = async (params: GoogleSheetsFindSpreadsheetsParams): Promise<any[]> => {
    const { accessToken, includeTeamDrives = false, searchValue } = params;

    const driveClient = createGoogleDriveClient(accessToken);

    const q = ["mimeType='application/vnd.google-apps.spreadsheet'", 'trashed = false'];

    if (searchValue) {
        q.push(`name contains '${searchValue}'`);
    }

    const response = await driveClient.files.list({
        q: q.join(' and '),
        orderBy: 'createdTime desc',
        fields: 'nextPageToken, files(id, name)',
        supportsAllDrives: true,
        includeItemsFromAllDrives: includeTeamDrives
    });

    return response.data.files || [];
};

/**
 * Find a worksheet
 */
export const findWorksheet = async (params: GoogleSheetsFindWorksheetParams): Promise<any> => {
    const { accessToken, spreadsheetId, worksheetId } = params;

    const sheetsClient = createGoogleSheetsClient(accessToken);

    const response = await sheetsClient.spreadsheets.get({
        spreadsheetId
    });

    const sheet = response.data.sheets?.find(s => s.properties?.sheetId === worksheetId);

    if (!sheet) {
        throw new Error(`Worksheet with ID ${worksheetId} not found in spreadsheet ${spreadsheetId}`);
    }

    return sheet;
};

/**
 * Copy a worksheet
 */
export const copyWorksheet = async (params: GoogleSheetsCopyWorksheetParams): Promise<any> => {
    const { accessToken, spreadsheetId, sourceSheetId, destinationSpreadsheetId, title } = params;

    const sheetsClient = createGoogleSheetsClient(accessToken);

    // Get source sheet name
    const sheetName = await findSheetName(accessToken, spreadsheetId, sourceSheetId);

    const response = await sheetsClient.spreadsheets.sheets.copyTo({
        spreadsheetId,
        sheetId: Number(sourceSheetId),
        requestBody: {
            destinationSpreadsheetId
        }
    });

    // If title is provided, rename the copied sheet
    if (title && response.data.sheetId) {
        await sheetsClient.spreadsheets.batchUpdate({
            spreadsheetId: destinationSpreadsheetId,
            requestBody: {
                requests: [
                    {
                        updateSheetProperties: {
                            properties: {
                                sheetId: response.data.sheetId,
                                title
                            },
                            fields: 'title'
                        }
                    }
                ]
            }
        });
    }

    return response.data;
};

/**
 * Insert multiple rows
 */
export const insertMultipleRows = async (params: GoogleSheetsInsertMultipleRowsParams): Promise<any> => {
    const { accessToken, spreadsheetId, sheetId, rows, asString, firstRowHeaders } = params;

    // Get sheet name
    const sheetName = await findSheetName(accessToken, spreadsheetId, sheetId);

    // Format values
    const formattedRows = rows.map(row => {
        if (firstRowHeaders) {
            return stringifyArray(objectToArray(row).map(val => val === null || val === undefined ? '' : val));
        }
        return stringifyArray(row);
    });

    // Append values
    const sheetsClient = createGoogleSheetsClient(accessToken);

    const response = await sheetsClient.spreadsheets.values.append({
        spreadsheetId,
        range: `${sheetName}!A:A`,
        valueInputOption: asString ? ValueInputOption.RAW : ValueInputOption.USER_ENTERED,
        requestBody: {
            majorDimension: Dimension.ROWS,
            range: `${sheetName}!A:A`,
            values: formattedRows
        }
    });

    return response.data;
};

/**
 * Update multiple rows
 */
export const updateMultipleRows = async (params: GoogleSheetsUpdateMultipleRowsParams): Promise<any> => {
    const { accessToken, spreadsheetId, sheetId, startRowIndex, rows, asString, firstRowHeaders } = params;

    // Get sheet name
    const sheetName = await findSheetName(accessToken, spreadsheetId, sheetId);

    // Format values
    const formattedRows = rows.map(row => {
        if (firstRowHeaders) {
            return stringifyArray(objectToArray(row).map(val => val === null || val === undefined ? '' : val));
        }
        return stringifyArray(row);
    });

    // Update values
    const sheetsClient = createGoogleSheetsClient(accessToken);

    const endRowIndex = startRowIndex + rows.length - 1;

    const response = await sheetsClient.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!A${startRowIndex}:ZZ${endRowIndex}`,
        valueInputOption: asString ? ValueInputOption.RAW : ValueInputOption.USER_ENTERED,
        requestBody: {
            majorDimension: Dimension.ROWS,
            range: `${sheetName}!A${startRowIndex}:ZZ${endRowIndex}`,
            values: formattedRows
        }
    });

    return response.data;
};

/**
 * Create a column
 */
export const createColumn = async (params: GoogleSheetsCreateColumnParams): Promise<any> => {
    const { accessToken, spreadsheetId, sheetId, columnName, afterColumn } = params;

    // Get sheet name
    const sheetName = await findSheetName(accessToken, spreadsheetId, sheetId);

    // Get header row
    const headers = await getHeaderRow({
        spreadsheetId,
        accessToken,
        sheetId: Number(sheetId)
    });

    if (!headers) {
        throw new Error('No headers found in sheet');
    }

    // Determine column index
    let columnIndex = headers.length;

    if (afterColumn) {
        const afterColumnIndex = headers.findIndex(h => h === afterColumn);
        if (afterColumnIndex === -1) {
            throw new Error(`Column ${afterColumn} not found`);
        }
        columnIndex = afterColumnIndex + 1;
    }

    // Update headers
    const newHeaders = [...headers];
    newHeaders.splice(columnIndex, 0, columnName);

    // Update sheet
    const sheetsClient = createGoogleSheetsClient(accessToken);

    // First, insert a column
    await sheetsClient.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
            requests: [
                {
                    insertDimension: {
                        range: {
                            sheetId: Number(sheetId),
                            dimension: 'COLUMNS',
                            startIndex: columnIndex,
                            endIndex: columnIndex + 1
                        }
                    }
                }
            ]
        }
    });

    // Then, update the header
    const response = await sheetsClient.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!A1:ZZ1`,
        valueInputOption: ValueInputOption.RAW,
        requestBody: {
            majorDimension: Dimension.ROWS,
            range: `${sheetName}!A1:ZZ1`,
            values: [newHeaders]
        }
    });

    return response.data;
};

/**
 * Check if sheet IDs are valid
 */
export const areSheetIdsValid = (spreadsheetId: string | null | undefined, sheetId: string | number | null | undefined): boolean => {
    return !(spreadsheetId === null || spreadsheetId === undefined || spreadsheetId === "" ||
        sheetId === null || sheetId === undefined || sheetId === "");
};
