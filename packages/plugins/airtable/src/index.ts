import { AirtableClient } from './client.js';
import { AirtableFieldTypeMapping, AirtableTable, AirtableView } from './models.js';

// Create a default client instance
const defaultClient = new AirtableClient('');

const airtablePlugin = {
    name: "Airtable",
    icon: "",
    description: "Low-code platform to build apps and databases",
    groups: ["productivity"],
    tags: ["productivity","collaboration","organization","workflow","task"],
    version: '1.0.0',
    id: "airtable",
    runner: "node",
    inputSchema: {
        type: "object",
        properties: {
            action: {
                type: 'string',
                enum: ['create_record', 'find_record', 'update_record', 'delete_record'],
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Action to perform on Airtable',
            },
            token: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Airtable Personal Access Token',
            },
            baseId: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Airtable Base ID',
            },
            tableId: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Airtable Table ID',
            },
            // Fields for create_record and update_record
            fields: {
                type: 'object',
                description: 'Record fields (key-value pairs)',
                rules: [
                    { operation: 'notEqual', valueA: 'create_record', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'update_record', valueB: '{{action}}', action: 'hide' },
                ],
            },
            // Fields for find_record
            searchField: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Field name to search in',
                rules: [{ operation: 'notEqual', valueA: 'find_record', valueB: '{{action}}', action: 'hide' }],
            },
            searchValue: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Value to search for',
                rules: [{ operation: 'notEqual', valueA: 'find_record', valueB: '{{action}}', action: 'hide' }],
            },
            viewId: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Optional view ID to limit search to',
                rules: [{ operation: 'notEqual', valueA: 'find_record', valueB: '{{action}}', action: 'hide' }],
            },
            maxRecords: {
                type: 'number',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Maximum number of records to return',
                rules: [{ operation: 'notEqual', valueA: 'find_record', valueB: '{{action}}', action: 'hide' }],
            },
            // Fields for update_record and delete_record
            recordId: {
                type: 'string',
                displayStyle: 'outlined',
                displaySize: 'small',
                description: 'Record ID to update or delete',
                rules: [
                    { operation: 'notEqual', valueA: 'update_record', valueB: '{{action}}', action: 'hide' },
                    { operation: 'notEqual', valueA: 'delete_record', valueB: '{{action}}', action: 'hide' },
                ],
            },
        },
        required: ['action', 'token', 'baseId', 'tableId'],
    },
    outputSchema: {
        type: "object",
    },
    exampleInput: {
        action: 'create_record',
        token: 'pat12345abcdef',
        baseId: 'app12345abcdef',
        tableId: 'tbl12345abcdef',
        fields: {
            'Name': 'John Doe',
            'Email': 'john@example.com',
            'Status': 'Active'
        }
    },
    exampleOutput: {
        "id": "rec12345abcdef",
        "createdTime": "2023-01-01T00:00:00.000Z",
        "fields": {
            "Name": "John Doe",
            "Email": "john@example.com",
            "Status": "Active"
        }
    },
    documentation: "https://airtable.com/developers/web/api/introduction",
    method: "exec",
    actions: [
        {
            name: 'airtable',
            execute: async (input: any, context?: any): Promise<any> => {
                const { action, token, baseId, tableId } = input;

                if (!action || !token || !baseId || !tableId) {
                    throw new Error('Missing required parameters: action, token, baseId, tableId');
                }

                // Create a client instance, using the context's axios instance if provided
                const client = context?.axiosInstance ?
                    new AirtableClient(token, context.axiosInstance) :
                    new AirtableClient(token);

                // Validate the token
                const isValid = await client.validateToken();
                if (!isValid) {
                    throw new Error('Invalid Airtable token');
                }

                switch (action) {
                    case 'create_record': {
                        const { fields } = input;

                        if (!fields || typeof fields !== 'object') {
                            throw new Error('Missing or invalid fields parameter');
                        }

                        // Process fields for creation
                        const processedFields = await client.processFields(baseId, tableId, fields);

                        // Create the record
                        return await client.createRecord(baseId, tableId, processedFields);
                    }

                    case 'find_record': {
                        const { searchField, searchValue, viewId, maxRecords } = input;

                        // Find records
                        return await client.findRecords(baseId, tableId, {
                            searchField,
                            searchValue,
                            viewId,
                            maxRecords
                        });
                    }

                    case 'update_record': {
                        const { recordId, fields } = input;

                        if (!recordId) {
                            throw new Error('Missing required parameter: recordId');
                        }

                        if (!fields || typeof fields !== 'object') {
                            throw new Error('Missing or invalid fields parameter');
                        }

                        // Process fields for update
                        const processedFields = await client.processFields(baseId, tableId, fields);

                        // Update the record
                        return await client.updateRecord(baseId, tableId, recordId, processedFields);
                    }

                    case 'delete_record': {
                        const { recordId } = input;

                        if (!recordId) {
                            throw new Error('Missing required parameter: recordId');
                        }

                        // Delete the record
                        return await client.deleteRecord(baseId, tableId, recordId);
                    }

                    default:
                        throw new Error(`Unsupported action: ${action}`);
                }
            }
        }
    ]
};

export { AirtableClient };
export default airtablePlugin;
