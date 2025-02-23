const startPlugin = {
    name: "start",
    icon: "",
    description: "Description for start",
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
            name: "range",
            execute: async (input: any, config: any) => {
                return input;
            }
        }
    ]
};

export default startPlugin;