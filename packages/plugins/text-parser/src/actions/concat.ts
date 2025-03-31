export const concat = {
    name: "concat",
    description: "Concatenate two or more texts with an optional separator",
    inputSchema: {
        type: "object",
        properties: {
            texts: {
                type: "array",
                description: "Array of text strings to concatenate",
                items: {
                    type: "string"
                }
            },
            separator: {
                type: "string",
                description: "Optional separator to place between concatenated texts"
            }
        },
        required: ["texts"]
    },
    outputSchema: {
        type: "string",
        description: "The concatenated text"
    },
    exampleInput: {
        texts: ["Hello", "World"],
        separator: " "
    },
    exampleOutput: "Hello World",
    execute: async (input: any, config: any) => {
        const texts = input.data?.texts || [];
        const separator = input.data?.separator || '';
        
        if (!Array.isArray(texts)) {
            return { error: "The 'texts' parameter must be an array" };
        }
        
        return texts.join(separator);
    }
};
