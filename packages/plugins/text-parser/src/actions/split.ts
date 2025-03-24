export const split = {
    name: "split",
    description: "Split text into an array based on a separator",
    inputSchema: {
        type: "object",
        properties: {
            text: {
                type: "string",
                description: "The text to split"
            },
            separator: {
                type: "string",
                description: "The separator to split by",
                default: ","
            },
            limit: {
                type: "number",
                description: "Maximum number of splits to perform (optional)",
                minimum: 0
            },
            trim: {
                type: "boolean",
                description: "Whether to trim whitespace from each resulting item",
                default: true
            }
        },
        required: ["text"]
    },
    outputSchema: {
        type: "array",
        description: "Array of text segments after splitting",
        items: {
            type: "string"
        }
    },
    exampleInput: {
        text: "apple,banana,cherry",
        separator: ",",
        trim: true
    },
    exampleOutput: ["apple", "banana", "cherry"],
    execute: async (input: any, config: any) => {
        const { text, separator = ",", limit, trim = true } = input.data || {};
        
        if (typeof text !== 'string') {
            return { error: "The 'text' parameter must be a string" };
        }
        
        try {
            let result;
            
            if (typeof limit === 'number' && limit >= 0) {
                result = text.split(separator, limit);
            } else {
                result = text.split(separator);
            }
            
            if (trim) {
                result = result.map(item => item.trim());
            }
            
            return result;
        } catch (error: any) {
            return { error: `Error splitting text: ${error.message}` };
        }
    }
};
