import { exec } from "child_process";

export default {
    name: "Exec Plugin",
    id: "exec",
    icon: "TbCode",
    description: "A plugin to execute shell commands",
    actions: [
        {
            name: "execute",
            inputSchema: {
                type: "object",
                properties: {
                    command: { type: "string" },
                },
                required: ["command"],
            },
            outputSchema: {
                type: "object",
                properties: {
                    success: { type: "boolean" },
                    message: { type: "string" },
                },
            },
            exampleInput: {
                command: "ls -l",
            },
            exampleOutput: {
                success: true,
                message: "Command executed successfully",
            },
            detailedDescription: "Executes a shell command",
            documentation: "https://docs.example.com/execPluginExec",
            method: "exec",
            execute: async (input: any, config: any) => {
                const { command } = input;
                return new Promise((resolve, reject) => {
                    exec(command, (error: any, stdout: any, stderr: any) => {
                        if (error) {
                            resolve({ success: false, message: error.message });
                        } else if (stderr) {
                            resolve({ success: false, message: stderr });
                        } else {
                            resolve({ success: true, message: stdout });
                        }
                    });
                });
            },
        },
    ],
};