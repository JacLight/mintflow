const startPlugin = {
    name: "start",
    icon: "",
    description: "Description for start",
    groups: ["utility"],
    tags: ["utility","tool","helper","function","operation"],
    version: '1.0.0',
    id: "start",
    runner: "node",
    inputSchema: {
        type: "object",

    },
    outputSchema: {
        type: "object",
    },
    exampleInput: {

    },
    exampleOutput: {
    },
    documentation: "https://yourdocs.com/start",
    method: "exec",
    actions: [
        {
            name: "start",
            execute: async (input: any, config: any) => {
                return input;
            }
        }
    ]
};

export default startPlugin;