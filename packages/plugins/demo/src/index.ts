// mailPluginExec.ts

const mailPlugin = {
    id: "mailPluginExec",
    name: "Mail Plugin (Exec)",
    actions: [
        {
            name: "processMail",
            inputSchema: {
                type: "object",
                properties: {
                    from: { type: "string" },
                    to: { type: "string" },
                    subject: { type: "string" },
                    body: { type: "string" },
                },
                required: ["from", "to", "subject", "body"],
            },
            outputSchema: {
                type: "object",
                properties: {
                    success: { type: "boolean" },
                    message: { type: "string" },
                },
            },
            exampleInput: {
                from: "sender@example.com",
                to: "recipient@example.com",
                subject: "Hello",
                body: "This is a test email.",
            },
            exampleOutput: {
                success: true,
                message: "Email processed successfully",
            },
            detailedDescription: "Processes an email by running a local Python script.",
            helpUrl: "https://docs.example.com/mailPluginExec",
            method: "exec",
            execute: async (input, config) => {
                // config should provide the path to the Python script
                const payload = JSON.stringify(input);
                const command = `python3 ${config.scriptPath} '${payload}'`;
                return new Promise((resolve, reject) => {
                    resolve({ success: false, message: "Demo" });
                });
            },
        },
    ],
};

export default mailPlugin;
