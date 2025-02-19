const injectAction: ActionDescriptor = {
    name: "Inject",
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
    detailedDescription: "Injects a variable into the workflow that can be referenced later. The injected data is dynamically structured.",
    helpUrl: "https://yourdocs.com/inject",
    method: "exec",
    execute: async (input) => {
        const { name, type, value } = input;

        let parsedValue = value;
        if (type === "boolean") {
            parsedValue = value === "true";
        } else if (type === "number") {
            parsedValue = Number(value);
        } else if (type === "object") {
            try {
                parsedValue = JSON.parse(value);
            } catch {
                throw new Error("Invalid JSON string for object type");
            }
        }

        return { [name]: parsedValue }; // Returns a dynamic object with the injected name as key
    }
};
