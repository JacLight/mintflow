import { csvToJson } from './csv-to-json.js';
import { jsonToCsv } from './json-to-csv.js';

const csvPlugin = {
    name: "CSV",
    icon: "",
    description: "Convert between CSV and JSON formats",
    groups: ["utility"],
    tags: ["utility","tool","helper","function","operation"],
    version: '1.0.0',
    id: "csv",
    runner: "node",
    inputSchema: {
        type: "object",
        properties: {
            csvText: {
                type: "string",
                description: "CSV text to convert to JSON"
            },
            jsonArray: {
                type: "array",
                description: "JSON array to convert to CSV"
            },
            hasHeaders: {
                type: "boolean",
                description: "Whether the CSV has headers"
            },
            delimiter: {
                type: "string",
                description: "Delimiter used in the CSV (comma or tab)"
            }
        }
    },
    outputSchema: {
        type: "object",
        properties: {
            result: {
                oneOf: [
                    {
                        type: "array",
                        description: "JSON array result from CSV conversion"
                    },
                    {
                        type: "string",
                        description: "CSV string result from JSON conversion"
                    }
                ]
            },
            error: {
                type: "string",
                description: "Error message if conversion fails"
            }
        }
    },
    exampleInput: {
        csvText: "name,age\nJohn,30\nJane,25",
        hasHeaders: true,
        delimiter: ","
    },
    exampleOutput: {
        result: [
            { name: "John", age: "30" },
            { name: "Jane", age: "25" }
        ]
    },
    documentation: "https://mintflow.com/plugins/csv",
    method: "exec",
    actions: [
        {
            name: 'csv_to_json',
            execute: async (input: any, config: any): Promise<any> => {
                try {
                    const csvText = input.data?.csvText || '';
                    const hasHeaders = config.data?.hasHeaders !== undefined ? config.data.hasHeaders : false;
                    const delimiter = config.data?.delimiter || ',';

                    if (!csvText) {
                        return { error: 'CSV text is required' };
                    }

                    const result = csvToJson(csvText, hasHeaders, delimiter);
                    return { result };
                } catch (error: any) {
                    console.error('Error converting CSV to JSON:', error);
                    return { error: error.message || 'Failed to convert CSV to JSON' };
                }
            }
        },
        {
            name: 'json_to_csv',
            execute: async (input: any, config: any): Promise<any> => {
                try {
                    const jsonArray = input.data?.jsonArray || [];
                    const delimiter = config.data?.delimiter || ',';

                    if (!Array.isArray(jsonArray) || jsonArray.length === 0) {
                        return { error: 'JSON array is required' };
                    }

                    const result = jsonToCsv(jsonArray, delimiter);
                    return { result };
                } catch (error: any) {
                    console.error('Error converting JSON to CSV:', error);
                    return { error: error.message || 'Failed to convert JSON to CSV' };
                }
            }
        }
    ]
};

export default csvPlugin;
