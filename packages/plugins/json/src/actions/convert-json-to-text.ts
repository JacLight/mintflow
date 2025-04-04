/**
 * Converts a JSON object to a text string
 */
export const convertJsonToText = {
    name: 'convert_json_to_text',
    displayName: 'Convert JSON to Text',
    description: 'Converts a JSON object to a text string',
    icon: '',
    runner: 'node',
    inputSchema: {
        type: 'object',
        required: ['json'],
        properties: {
            json: {
                type: 'object',
                title: 'JSON',
                description: 'The JSON object to convert to text',
            },
            pretty: {
                type: 'boolean',
                title: 'Pretty Print',
                description: 'Whether to format the JSON with indentation for readability',
                default: false,
            },
        },
    },
    outputSchema: {
        type: 'object',
        properties: {
            text: {
                type: 'string',
                title: 'Text',
                description: 'The JSON object converted to a text string',
            },
            error: {
                type: 'string',
                title: 'Error',
                description: 'Error message if conversion failed',
            },
        },
    },
    exampleInput: {
        json: {
            name: 'John',
            age: 30,
            city: 'New York',
        },
        pretty: true,
    },
    exampleOutput: {
        text: '{\n  "name": "John",\n  "age": 30,\n  "city": "New York"\n}',
    },
    execute: async (input: any, config: any, context: any): Promise<any> => {
        try {
            // Get input parameters from the data object
            const data = input.data || {};
            const { json, pretty = false } = data;

            if (json === undefined || json === null) {
                return {
                    error: 'JSON is required',
                };
            }

            // Convert the JSON to a string
            const text = pretty
                ? JSON.stringify(json, null, 2)
                : JSON.stringify(json);

            return {
                text,
            };
        } catch (error) {
            console.error('Error converting JSON to text:', error);
            return {
                error: `Failed to convert JSON to text: ${error instanceof Error ? error.message : String(error)}`,
            };
        }
    },
};
