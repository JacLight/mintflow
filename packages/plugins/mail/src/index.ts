// mailPluginExec.ts

import { exec } from "child_process";

const mailPluginExec = {
    id: "mailPluginExec",
    name: "Mail Plugin (Exec)",
    icon: "GrMail",
    description: "A plugin to process emails using a local Python script",
    documentation: "https://docs.example.com/mailPluginExec",
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
            description: "Processes an email by running a local Python script.",
            documentation: "https://docs.example.com/mailPluginExec",
            method: "exec",
            execute: async (input: any, config: any) => {
                // config should provide the path to the Python script
                const payload = JSON.stringify(input);
                return new Promise((resolve, reject) => {
                    const command = `python3 ${config.scriptPath} '${payload}'`;
                    exec(command, (error, stdout, stderr) => {
                        if (error) {
                            return reject(stderr);
                        }
                        try {
                            resolve(JSON.parse(stdout));
                        } catch (err) {
                            reject(`Error parsing output: ${stdout}`);
                        }
                    });
                });
            },
        },
    ],
};

export default mailPluginExec;
