import { commonSchema } from "../common.js";

export const stopServer = {
    name: 'stop-server',
    outputSchema: {
        type: 'object',
        properties: {
            success: { type: 'boolean' },
            message: { type: 'string' }
        }
    },
    exampleOutput: {
        success: true,
        message: "MCP server stopped successfully"
    },
    ...commonSchema,
    inputSchema: {
        type: 'object',
        properties: {
            pid: {
                type: 'number',
                description: 'Process ID of the MCP server to stop'
            },
            signal: {
                type: 'string',
                enum: ['SIGTERM', 'SIGKILL', 'SIGINT'],
                default: 'SIGTERM',
                description: 'Signal to send to the process'
            }
        },
        required: ['pid']
    },
    description: 'Stops a running MCP server process',
    execute: async (input: any): Promise<any> => {
        try {
            const { pid, signal = 'SIGTERM' } = input;

            // Check if the process exists
            try {
                // On Unix-like systems, sending signal 0 tests if the process exists
                process.kill(pid, 0);
            } catch (e) {
                return {
                    success: false,
                    message: `No process found with PID ${pid}`
                };
            }

            // Send the signal to stop the process
            process.kill(pid, signal);

            return {
                success: true,
                message: `Signal ${signal} sent to MCP server with PID ${pid}`
            };
        } catch (error) {
            console.error('Error stopping MCP server:', error);
            return {
                success: false,
                message: `Error stopping MCP server: ${(error as Error).message}`
            };
        }
    }
};

export default stopServer;
