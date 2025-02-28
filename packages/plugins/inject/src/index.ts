const injectAction = {
    name: "Inject",
    icon: "GiLoveInjection",
    description: "Injects a variable into the workflow that can be referenced later. The injected data is dynamically structured.",
    id: "inject",
    runner: "node",
    inputSchema: {
        type: "object",
        properties: {
            name: { type: "string", description: "The name of the property to inject" },
            type: { type: "string", enum: ["string", "boolean", "number", "object"], description: "The data type of the value" },
            value: { type: "string", description: "The value to inject, always stored as a string" }
        },
        required: ["name", "type", "value"]
    },
    outputSchema: {
        type: "object",
        additionalProperties: true // The output should be dynamic and match the injected data
    },
    exampleInput: {
        name: "apiConfig",
        type: "object",
        value: '{"key": "12345-abcdef", "timeout": 5000}' // JSON object as string
    },
    exampleOutput: {
        apiConfig: { key: "12345-abcdef", timeout: 5000 } // Directly returning the parsed object
    },
    documentation: "https://yourdocs.com/inject",
    method: "exec",
    actions: [
        {
            name: "inject",
            inputSchema: {
                type: "object",
                properties: {
                    name: { type: "string", description: "The name of the property to inject" },
                    type: { type: "string", enum: ["string", "boolean", "number", "object"], description: "The data type of the value" },
                    value: { type: "string", description: "The value to inject, always stored as a string" }
                },
                required: ["name", "type", "value"]
            },
            outputSchema: {
                type: "object",
                additionalProperties: true // The output should be dynamic and match the injected data
            },
            exampleInput: {
                name: "apiConfig",
                type: "object",
                value: '{"key": "12345-abcdef", "timeout": 5000}' // JSON object as string
            },
            exampleOutput: {
                apiConfig: { key: "12345-abcdef", timeout: 5000 } // Directly returning the parsed object
            },
            description: "Injects a variable into the workflow that can be referenced later. The injected data is dynamically structured.",
            documentation: "https://yourdocs.com/inject",
            method: "exec",
            execute: async (input: any, config: any) => {
                const { name, type, value } = input;
                let parsedValue: any;
                try {
                    switch (type) {
                        case "string":
                            parsedValue = value;
                            break;
                        case "boolean":
                            parsedValue = value === "true";
                            break;
                        case "number":
                            parsedValue = parseFloat(value);
                            break;
                        case "object":
                            parsedValue = JSON.parse(value);
                            break;
                        default:
                            throw new Error("Invalid data type");
                    }
                } catch (error) {
                    const err: any = error;
                    return { error: err.message };
                }
                if (name) {
                    return { [name]: parsedValue };
                } else {
                    return parsedValue;
                }
            }
        }
    ]
};

export default injectAction;