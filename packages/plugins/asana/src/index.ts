const asanaPlugin = {
    name: "asana",
    icon: "",
    description: "Description for asana",
    groups: ["productivity"],
    tags: ["productivity","collaboration","organization","workflow","task"],
    version: '1.0.0',
    id: "asana",
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
    documentation: "https://yourdocs.com/asana",
    method: "exec",
    actions: [

    ]
};

export default asanaPlugin;