import { SalesforceClient, SalesforceAuth } from './client.js';
import { SalesforceRecord } from './models.js';

// Create a default client instance with empty auth
const defaultClient = new SalesforceClient({
    access_token: '',
    instance_url: ''
});

const salesforcePlugin = {
    name: "Salesforce",
    icon: "",
    description: "CRM software solutions and enterprise cloud computing",
    groups: ["crm"],
    tags: ["crm","marketing","customer","lead","sales"],
    version: '1.0.0',
    id: "salesforce",
    runner: "node",
    inputSchema: {
        type: "object",
        properties: {
            action: {
                type: 'string',
                enum: ['create_object', 'update_object', 'run_query', 'upsert_by_external_id', 'bulk_upsert'],
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Action to perform on Salesforce',
            },
            access_token: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Salesforce OAuth Access Token',
            },
            instance_url: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Salesforce Instance URL',
            },
            // Fields for create_object
            object_name: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Salesforce Object Name (e.g., Account, Contact, Lead)',
                rules: [
                    { operation: 'notEqual', valueA: 'run_query', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Fields for create_object and update_object
            data: {
                type: 'object',
                description: 'Object data (key-value pairs)',
                rules: [
                    { operation: 'notEqual', valueA: 'create_object', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'update_object', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Fields for update_object
            record_id: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Record ID to update',
                rules: [
                    { operation: 'notEqual', valueA: 'update_object', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Fields for run_query
            query: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'SOQL Query',
                rules: [
                    { operation: 'notEqual', valueA: 'run_query', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Fields for upsert_by_external_id
            external_field: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'External ID Field Name',
                rules: [
                    { operation: 'notEqual', valueA: 'upsert_by_external_id', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'bulk_upsert', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Fields for upsert_by_external_id
            records: {
                type: 'object',
                description: 'Records to upsert (must include "records" array)',
                rules: [
                    { operation: 'notEqual', valueA: 'upsert_by_external_id', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Fields for bulk_upsert
            csv_records: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'CSV Records for bulk upsert',
                rules: [
                    { operation: 'notEqual', valueA: 'bulk_upsert', valueB: '{{action}}', action: 'hide' },
                ],
            },
        },
        required: ['action', 'access_token', 'instance_url'],
    },
    outputSchema: {
        type: "object",
    },
    exampleInput: {
        action: 'create_object',
        access_token: 'your_access_token',
        instance_url: 'https://your-instance.salesforce.com',
        object_name: 'Account',
        data: {
            Name: 'Acme Corporation',
            Industry: 'Technology',
            Phone: '(123) 456-7890'
        }
    },
    exampleOutput: {
        "id": "001xx000003DGb2AAG",
        "success": true,
        "errors": [],
        "created": true
    },
    documentation: "https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/api_rest/intro_what_is_rest_api.htm",
    method: "exec",
    actions: [
        {
            name: 'salesforce',
            execute: async (input: any, context?: any): Promise<any> => {
                const { action, access_token, instance_url } = input;

                if (!action || !access_token || !instance_url) {
                    throw new Error('Missing required parameters: action, access_token, instance_url');
                }

                // Create a client instance, using the context's axios instance if provided
                const auth: SalesforceAuth = {
                    access_token,
                    instance_url
                };

                const client = context?.axiosInstance ?
                    new SalesforceClient(auth, context.axiosInstance) :
                    new SalesforceClient(auth);

                // Validate the authentication
                const isValid = await client.validateAuth();
                if (!isValid) {
                    throw new Error('Invalid Salesforce authentication');
                }

                switch (action) {
                    case 'create_object': {
                        const { object_name, data } = input;

                        if (!object_name || !data) {
                            throw new Error('Missing required parameters: object_name, data');
                        }

                        return await client.createObject(object_name, data);
                    }

                    case 'update_object': {
                        const { object_name, record_id, data } = input;

                        if (!object_name || !record_id || !data) {
                            throw new Error('Missing required parameters: object_name, record_id, data');
                        }

                        await client.updateObject(object_name, record_id, data);
                        return { success: true, message: `Record ${record_id} updated successfully` };
                    }

                    case 'run_query': {
                        const { query } = input;

                        if (!query) {
                            throw new Error('Missing required parameter: query');
                        }

                        return await client.runQuery(query);
                    }

                    case 'upsert_by_external_id': {
                        const { object_name, external_field, records } = input;

                        if (!object_name || !external_field || !records) {
                            throw new Error('Missing required parameters: object_name, external_field, records');
                        }

                        if (!records.records || !Array.isArray(records.records)) {
                            throw new Error('Records must contain a "records" array');
                        }

                        return await client.upsertByExternalId(object_name, external_field, records);
                    }

                    case 'bulk_upsert': {
                        const { object_name, external_field, csv_records } = input;

                        if (!object_name || !external_field || !csv_records) {
                            throw new Error('Missing required parameters: object_name, external_field, csv_records');
                        }

                        return await client.bulkUpsertByExternalId(object_name, external_field, csv_records);
                    }

                    default:
                        throw new Error(`Unsupported action: ${action}`);
                }
            }
        }
    ]
};

export { SalesforceClient };
export default salesforcePlugin;
