export default {
    name: "Array Plugin",
    id: "array",
    icon: "TbMathFunction",
    description: "A plugin to perform array operations",
    actions: [
        {
            name: "arraySum",
            inputSchema: {
                type: "object",
                properties: {
                    array: { type: "array" },
                },
                required: ["array"],
            },
            outputSchema: {
                type: "object",
                properties: {
                    sum: { type: "number" },
                },
            },
            exampleInput: {
                array: [1, 2, 3, 4, 5],
            },
            exampleOutput: {
                sum: 15,
            },
            description: "Calculates the sum of all elements in an array",
            documentation: "https://docs.example.com/arrayPluginExec",
            method: "exec",
            execute: async (input: any, config: any) => {
                const sum = input.array.reduce((a: number, b: number) => a + b, 0);
                return { sum };
            },
        },
        {
            name: "arrayProduct",
            inputSchema: {
                type: "object",
                properties: {
                    array: { type: "array" },
                },
                required: ["array"],
            },
            outputSchema: {
                type: "object",
                properties: {
                    product: { type: "number" },
                },
            },
            exampleInput: {
                array: [1, 2, 3, 4, 5],
            },
            exampleOutput: {
                product: 120,
            },
            description: "Calculates the product of all elements in an array",
            documentation: "https://docs.example.com/arrayPluginExec",
            method: "exec",
            execute: async (input: any, config: any) => {
                const product = input.array.reduce((a: number, b: number) => a * b, 1);
                return { product };
            },
        },
    ],
};
