/**
 * Converts a text string containing JSON to a JSON object
 */
export const convertTextToJson = {
    name: 'convert_text_to_json',
    displayName: 'Convert Text to JSON',
    description: 'Converts a text string containing JSON to a JSON object',
    icon: '',
    runner: 'node',
    inputSchema: {
        type: 'object',
        required: ['text'],
        properties: {
            text: {
                type: 'string',
                title: 'Text',
                description: 'The text string containing JSON to convert',
            },
        },
    },
    outputSchema: {
        type: 'object',
        properties: {
            result: {
                type: 'object',
                title: 'Result',
                description: 'The parsed JSON object',
            },
            error: {
                type: 'string',
                title: 'Error',
                description: 'Error message if parsing failed',
            },
        },
    },
    exampleInput: {
        text: '{"name": "John", "age": 30, "city": "New York"}',
    },
    exampleOutput: {
        result: {
            name: 'John',
            age: 30,
            city: 'New York',
        },
    },
    execute: async (input: any, config: any, context: any): Promise<any> => {
        try {
            const { text } = input.data;

            if (!text) {
                return {
                    error: 'Text is required',
                };
            }

            // Try to parse the JSON
            const result = JSON.parse(text);

            return {
                result,
            };
        } catch (error) {
            console.error('Error parsing JSON:', error);
            return {
                error: `Failed to parse JSON: ${error instanceof Error ? error.message : String(error)}`,
            };
        }
    },
};
