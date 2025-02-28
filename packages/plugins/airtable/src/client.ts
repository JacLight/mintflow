import axios, { AxiosInstance } from 'axios';
import Airtable from 'airtable';
import {
    AirtableBase,
    AirtableField,
    AirtableRecord,
    AirtableTable,
    AirtableView,
    AirtableEnterpriseFields
} from './models.js';

export class AirtableClient {
    private axiosInstance: AxiosInstance;
    private baseUrl = 'https://api.airtable.com/v0';
    private metaUrl = 'https://api.airtable.com/v0/meta';

    constructor(private token: string, axiosInstance?: AxiosInstance) {
        this.axiosInstance = axiosInstance || axios;
    }

    /**
     * Validate the token by fetching the list of bases
     */
    async validateToken(): Promise<boolean> {
        try {
            await this.fetchBases();
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Fetch the list of bases
     */
    async fetchBases(): Promise<AirtableBase[]> {
        const response = await this.axiosInstance({
            method: 'get',
            url: `${this.metaUrl}/bases`,
            headers: this.getHeaders()
        });

        return response.data.bases;
    }

    /**
     * Fetch the list of tables in a base
     */
    async fetchTables(baseId: string): Promise<AirtableTable[]> {
        const response = await this.axiosInstance({
            method: 'get',
            url: `${this.metaUrl}/bases/${baseId}/tables`,
            headers: this.getHeaders()
        });

        return response.data.tables;
    }

    /**
     * Fetch a specific table
     */
    async fetchTable(baseId: string, tableId: string): Promise<AirtableTable> {
        const tables = await this.fetchTables(baseId);
        const table = tables.find(t => t.id === tableId);

        if (!table) {
            throw new Error(`Table with ID ${tableId} not found in base ${baseId}`);
        }

        return table;
    }

    /**
     * Fetch the list of views in a table
     */
    async fetchViews(baseId: string, tableId: string): Promise<AirtableView[]> {
        const table = await this.fetchTable(baseId, tableId);
        return table.views;
    }

    /**
     * Create a record in a table
     */
    async createRecord(baseId: string, tableId: string, fields: Record<string, unknown>): Promise<AirtableRecord> {
        const response = await this.axiosInstance({
            method: 'post',
            url: `${this.baseUrl}/${baseId}/${tableId}`,
            headers: this.getHeaders(),
            data: {
                fields,
                typecast: true
            }
        });

        return response.data;
    }

    /**
     * Find records in a table
     */
    async findRecords(
        baseId: string,
        tableId: string,
        options: {
            searchField?: string;
            searchValue?: string;
            viewId?: string;
            maxRecords?: number;
        } = {}
    ): Promise<AirtableRecord[]> {
        const queryParams: Record<string, string> = {};

        if (options.searchField && options.searchValue) {
            queryParams.filterByFormula = `FIND("${options.searchValue}",{${options.searchField}})`;
        }

        if (options.viewId) {
            queryParams.view = options.viewId;
        }

        if (options.maxRecords) {
            queryParams.maxRecords = options.maxRecords.toString();
        }

        const response = await this.axiosInstance({
            method: 'get',
            url: `${this.baseUrl}/${baseId}/${tableId}`,
            headers: this.getHeaders(),
            params: queryParams
        });

        return response.data.records;
    }

    /**
     * Update a record in a table
     */
    async updateRecord(baseId: string, tableId: string, recordId: string, fields: Record<string, unknown>): Promise<AirtableRecord> {
        const response = await this.axiosInstance({
            method: 'patch',
            url: `${this.baseUrl}/${baseId}/${tableId}/${recordId}`,
            headers: this.getHeaders(),
            data: {
                fields,
                typecast: true
            }
        });

        return response.data;
    }

    /**
     * Delete a record from a table
     */
    async deleteRecord(baseId: string, tableId: string, recordId: string): Promise<AirtableRecord> {
        const response = await this.axiosInstance({
            method: 'delete',
            url: `${this.baseUrl}/${baseId}/${tableId}/${recordId}`,
            headers: this.getHeaders()
        });

        return response.data;
    }

    /**
     * Get a snapshot of a table
     */
    async getTableSnapshot(baseId: string, tableId: string, viewId?: string): Promise<AirtableRecord[]> {
        // Configure Airtable library
        Airtable.configure({
            apiKey: this.token
        });

        const airtable = new Airtable();
        const records = await airtable
            .base(baseId)
            .table(tableId)
            .select(viewId ? { view: viewId } : {})
            .all();

        return records.map(r => r._rawJson as unknown as AirtableRecord)
            .sort((a, b) =>
                new Date(a.createdTime).getTime() - new Date(b.createdTime).getTime()
            );
    }

    /**
     * Process fields for creation or update
     */
    async processFields(baseId: string, tableId: string, fields: Record<string, unknown>): Promise<Record<string, unknown>> {
        // Remove empty string values
        const fieldsWithoutEmpty: Record<string, unknown> = {};
        Object.keys(fields).forEach(key => {
            if (fields[key] !== '') {
                fieldsWithoutEmpty[key] = fields[key];
            }
        });

        // Get table schema to process fields correctly
        const table = await this.fetchTable(baseId, tableId);
        const processedFields: Record<string, unknown> = {};

        table.fields.forEach((field: AirtableField) => {
            if (!AirtableEnterpriseFields.includes(field.type)) {
                const key = field.id;

                if (fieldsWithoutEmpty[key] === undefined) {
                    return;
                }

                // Handle special field types
                if (field.type === 'multipleAttachments' && fieldsWithoutEmpty[key]) {
                    processedFields[key] = [
                        {
                            url: fieldsWithoutEmpty[key] as string
                        }
                    ];
                } else if (['multipleRecordLinks', 'multipleSelects'].includes(field.type)) {
                    if (Array.isArray(fieldsWithoutEmpty[key]) && (fieldsWithoutEmpty[key] as any[]).length > 0) {
                        processedFields[key] = fieldsWithoutEmpty[key];
                    }
                } else {
                    processedFields[key] = fieldsWithoutEmpty[key];
                }
            }
        });

        return processedFields;
    }

    /**
     * Get headers for API requests
     */
    private getHeaders(): Record<string, string> {
        return {
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
        };
    }
}
