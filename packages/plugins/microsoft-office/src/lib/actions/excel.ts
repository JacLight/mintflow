import { initGraphClient, handleGraphError } from '../common/index.js';
import {
    ExcelListWorkbooksParams,
    ExcelGetWorksheetsParams,
    ExcelGetWorksheetDataParams,
    ExcelAddRowParams,
    ExcelWorkbook,
    ExcelWorksheet
} from '../models/index.js';

/**
 * List Excel workbooks
 */
export const listWorkbooks = async (params: ExcelListWorkbooksParams): Promise<ExcelWorkbook[]> => {
    try {
        const { token } = params;
        const client = initGraphClient(token);

        // Get Excel files from OneDrive
        const response = await client.api('/me/drive/root/search(q=\'.xlsx\')')
            .select('id,name,webUrl')
            .get();

        return response.value.map((item: any) => ({
            id: item.id,
            name: item.name,
            webUrl: item.webUrl
        }));
    } catch (error) {
        throw handleGraphError(error);
    }
};

/**
 * Get worksheets from an Excel workbook
 */
export const getWorksheets = async (params: ExcelGetWorksheetsParams): Promise<ExcelWorksheet[]> => {
    try {
        const { token, workbookId } = params;
        const client = initGraphClient(token);

        // Get worksheets from the workbook
        const response = await client.api(`/me/drive/items/${workbookId}/workbook/worksheets`)
            .select('id,name,position,visibility')
            .get();

        return response.value.map((item: any) => ({
            id: item.id,
            name: item.name,
            position: item.position,
            visibility: item.visibility
        }));
    } catch (error) {
        throw handleGraphError(error);
    }
};

/**
 * Get data from an Excel worksheet
 */
export const getWorksheetData = async (params: ExcelGetWorksheetDataParams): Promise<any[][]> => {
    try {
        const { token, workbookId, worksheetId, range } = params;
        const client = initGraphClient(token);

        // Get data from the worksheet
        let apiPath = `/me/drive/items/${workbookId}/workbook/worksheets/${worksheetId}`;

        if (range) {
            apiPath += `/range(address='${range}')`;
        } else {
            apiPath += `/usedRange`;
        }

        const response = await client.api(apiPath)
            .select('values')
            .get();

        return response.values;
    } catch (error) {
        throw handleGraphError(error);
    }
};

/**
 * Add a row to an Excel table
 */
export const addRow = async (params: ExcelAddRowParams): Promise<any> => {
    try {
        const { token, workbookId, worksheetId, tableId, values } = params;
        const client = initGraphClient(token);

        // Add a row to the table
        const response = await client.api(`/me/drive/items/${workbookId}/workbook/worksheets/${worksheetId}/tables/${tableId}/rows/add`)
            .post({
                values: [values]
            });

        return response;
    } catch (error) {
        throw handleGraphError(error);
    }
};
