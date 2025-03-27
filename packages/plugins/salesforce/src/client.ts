import axios, { AxiosInstance } from 'axios';
import { SalesforceObject, SalesforceField, SalesforceCreateResponse, SalesforceUpsertResponse, SalesforceBulkJobResponse, SalesforceQueryResponse } from './models.js';

export interface SalesforceAuth {
    access_token: string;
    instance_url: string;
    environment?: 'login' | 'test';
}

export class SalesforceClient {
    private axiosInstance: AxiosInstance;
    private baseUrl: string;
    private apiVersion = 'v56.0';

    constructor(private auth: SalesforceAuth, axiosInstance?: AxiosInstance) {
        this.axiosInstance = axiosInstance || axios;
        this.baseUrl = auth.instance_url;
    }

    /**
     * Validate the authentication by fetching the list of objects
     */
    async validateAuth(): Promise<boolean> {
        try {
            await this.listObjects();
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * List all available Salesforce objects
     */
    async listObjects(): Promise<SalesforceObject[]> {
        const response = await this.axiosInstance({
            method: 'get',
            url: `${this.baseUrl}/services/data/${this.apiVersion}/sobjects`,
            headers: this.getHeaders()
        });

        return response.data.sobjects;
    }

    /**
     * Get object fields
     */
    async getObjectFields(objectName: string): Promise<SalesforceField[]> {
        const response = await this.axiosInstance({
            method: 'get',
            url: `${this.baseUrl}/services/data/${this.apiVersion}/sobjects/${objectName}/describe`,
            headers: this.getHeaders()
        });

        return response.data.fields;
    }

    /**
     * Create a new object
     */
    async createObject(objectName: string, data: Record<string, any>): Promise<SalesforceCreateResponse> {
        const response = await this.axiosInstance({
            method: 'post',
            url: `${this.baseUrl}/services/data/${this.apiVersion}/sobjects/${objectName}`,
            headers: this.getHeaders(),
            data
        });

        return response.data;
    }

    /**
     * Update an object by ID
     */
    async updateObject(objectName: string, id: string, data: Record<string, any>): Promise<void> {
        await this.axiosInstance({
            method: 'patch',
            url: `${this.baseUrl}/services/data/${this.apiVersion}/sobjects/${objectName}/${id}`,
            headers: this.getHeaders(),
            data
        });

        // Salesforce returns 204 No Content on successful update
        return;
    }

    /**
     * Upsert an object by external ID
     */
    async upsertByExternalId(objectName: string, externalField: string, records: { records: Record<string, any>[] }): Promise<SalesforceUpsertResponse[]> {
        const response = await this.axiosInstance({
            method: 'patch',
            url: `${this.baseUrl}/services/data/${this.apiVersion}/composite/sobjects/${objectName}/${externalField}`,
            headers: this.getHeaders(),
            data: {
                allOrNone: false,
                ...records
            }
        });

        return response.data;
    }

    /**
     * Bulk upsert records by external ID
     */
    async bulkUpsertByExternalId(objectName: string, externalField: string, csvRecords: string): Promise<SalesforceBulkJobResponse> {
        // Create bulk job
        const createResponse = await this.axiosInstance({
            method: 'post',
            url: `${this.baseUrl}/services/data/${this.apiVersion}/jobs/ingest/`,
            headers: this.getHeaders(),
            data: {
                object: objectName,
                externalIdFieldName: externalField,
                contentType: 'CSV',
                operation: 'upsert',
                lineEnding: 'CRLF',
            }
        });

        const jobId = createResponse.data.id;

        // Upload records to bulk job
        await this.axiosInstance({
            method: 'put',
            url: `${this.baseUrl}/services/data/${this.apiVersion}/jobs/ingest/${jobId}/batches`,
            headers: {
                ...this.getHeaders(),
                'Content-Type': 'text/csv'
            },
            data: csvRecords
        });

        // Notify upload complete
        await this.axiosInstance({
            method: 'patch',
            url: `${this.baseUrl}/services/data/${this.apiVersion}/jobs/ingest/${jobId}`,
            headers: this.getHeaders(),
            data: { state: 'UploadComplete' }
        });

        // Get job info
        const jobResponse = await this.axiosInstance({
            method: 'get',
            url: `${this.baseUrl}/services/data/${this.apiVersion}/jobs/ingest/${jobId}`,
            headers: this.getHeaders()
        });

        return jobResponse.data;
    }

    /**
     * Run a SOQL query
     */
    async runQuery(query: string): Promise<SalesforceQueryResponse> {
        const response = await this.axiosInstance({
            method: 'get',
            url: `${this.baseUrl}/services/data/${this.apiVersion}/query`,
            headers: this.getHeaders(),
            params: { q: query }
        });

        return response.data;
    }

    /**
     * Get headers for API requests
     */
    private getHeaders(): Record<string, string> {
        return {
            'Authorization': `Bearer ${this.auth.access_token}`,
            'Content-Type': 'application/json'
        };
    }
}
