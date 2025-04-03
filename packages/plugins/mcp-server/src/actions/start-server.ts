import { commonSchema } from "../common.js";
import { spawn } from 'child_process';

export const startServer = {
    name: 'start-server',
    outputSchema: {
        type: 'object',
        properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            pid: { type: 'number' }
        }
    },
    exampleOutput: {
        success: true,
        message: "MCP server started successfully",
        pid: 12345
    },
    ...commonSchema,
    inputSchema: {
        type: 'object',
        properties: {
            command: {
                type: 'string',
                description: 'Command to run the server (e.g., node, python)'
            },
            args: {
                type: 'array',
                items: { type: 'string' },
                description: 'Arguments to pass to the command'
            },
            env: {
                type: 'object',
                additionalProperties: { type: 'string' },
                description: 'Environment variables to set for the server process'
            },
            cwd: {
                type: 'string',
                description: 'Working directory for the server process'
            }
        },
        required: ['command', 'args']
    },
    description: 'Starts an MCP server process',
    execute: async (input: any): Promise<any> => {
        try {
            const { command, args, env, cwd } = input;

            // Spawn the server process
            const serverProcess = spawn(command, args, {
                env: { ...process.env, ...env },
                cwd: cwd || process.cwd(),
                stdio: ['pipe', 'pipe', 'pipe']
            });

            // Store the process ID
            const pid = serverProcess.pid;

            if (!pid) {
                throw new Error('Failed to start server process');
            }

            // Set up event handlers
            serverProcess.stdout.on('data', (data) => {
                console.log(`[MCP Server ${pid}] stdout: ${data}`);
            });

            serverProcess.stderr.on('data', (data) => {
                console.error(`[MCP Server ${pid}] stderr: ${data}`);
            });

            serverProcess.on('close', (code) => {
                console.log(`[MCP Server ${pid}] process exited with code ${code}`);
            });

            // Return success
            return {
                success: true,
                message: `MCP server started successfully with PID ${pid}`,
                pid
            };
        } catch (error) {
            console.error('Error starting MCP server:', error);
            return {
                success: false,
                message: `Error starting MCP server: ${(error as Error).message}`
            };
        }
    }
};

export default startServer;
