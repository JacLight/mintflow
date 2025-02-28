// Google Sheets data models

export enum ValueInputOption {
    RAW = 'RAW',
    USER_ENTERED = 'USER_ENTERED',
}

export enum Dimension {
    ROWS = 'ROWS',
    COLUMNS = 'COLUMNS',
}

export interface GoogleSheetsInsertRowParams {
    accessToken: string;
    spreadsheetId: string;
    sheetId: number;
    values: any[];
    asString?: boolean;
    firstRowHeaders?: boolean;
}

export interface GoogleSheetsUpdateRowParams {
    accessToken: string;
    spreadsheetId: string;
    sheetId: number;
    rowIndex: number;
    values: any[];
    asString?: boolean;
    firstRowHeaders?: boolean;
}

export interface GoogleSheetsDeleteRowParams {
    accessToken: string;
    spreadsheetId: string;
    sheetId: number;
    rowIndex: number;
}

export interface GoogleSheetsFindRowsParams {
    accessToken: string;
    spreadsheetId: string;
    sheetId: number;
    columnName: string;
    columnValue: string;
    firstRowHeaders?: boolean;
}

export interface GoogleSheetsGetRowsParams {
    accessToken: string;
    spreadsheetId: string;
    sheetId: number;
    rowIndexStart?: number;
    rowIndexEnd?: number;
}

export interface GoogleSheetsCreateSpreadsheetParams {
    accessToken: string;
    title: string;
}

export interface GoogleSheetsCreateWorksheetParams {
    accessToken: string;
    spreadsheetId: string;
    title: string;
    rows?: number;
    columns?: number;
}

export interface GoogleSheetsClearSheetParams {
    accessToken: string;
    spreadsheetId: string;
    sheetId: number;
    rowIndex: number;
    numOfRows: number;
}

export interface GoogleSheetsFindRowByNumParams {
    accessToken: string;
    spreadsheetId: string;
    sheetId: number;
    rowIndex: number;
}

export interface GoogleSheetsFindSpreadsheetsParams {
    accessToken: string;
    includeTeamDrives?: boolean;
    searchValue?: string;
}

export interface GoogleSheetsFindWorksheetParams {
    accessToken: string;
    spreadsheetId: string;
    worksheetId: number;
}

export interface GoogleSheetsCopyWorksheetParams {
    accessToken: string;
    spreadsheetId: string;
    sourceSheetId: number;
    destinationSpreadsheetId: string;
    title?: string;
}

export interface GoogleSheetsInsertMultipleRowsParams {
    accessToken: string;
    spreadsheetId: string;
    sheetId: number;
    rows: any[][];
    asString?: boolean;
    firstRowHeaders?: boolean;
}

export interface GoogleSheetsUpdateMultipleRowsParams {
    accessToken: string;
    spreadsheetId: string;
    sheetId: number;
    startRowIndex: number;
    rows: any[][];
    asString?: boolean;
    firstRowHeaders?: boolean;
}

export interface GoogleSheetsCreateColumnParams {
    accessToken: string;
    spreadsheetId: string;
    sheetId: number;
    columnName: string;
    afterColumn?: string;
}

export interface AppendGoogleSheetValuesParams {
    values: string[];
    spreadSheetId: string;
    range: string;
    valueInputOption: ValueInputOption;
    majorDimension: Dimension;
    accessToken: string;
}

export interface GoogleSheetsSpreadsheet {
    spreadsheetId: string;
    properties: {
        title: string;
        locale: string;
        autoRecalc: string;
        timeZone: string;
        defaultFormat: any;
    };
    sheets: GoogleSheetsSheet[];
}

export interface GoogleSheetsSheet {
    properties: {
        sheetId: number;
        title: string;
        index: number;
        sheetType: string;
        gridProperties: {
            rowCount: number;
            columnCount: number;
        };
    };
}

export interface GoogleSheetsRow {
    row: number;
    values: { [key: string]: string };
}
