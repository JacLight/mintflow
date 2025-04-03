import { commonSchema } from "../common.js";

export const useTool = {
    name: 'use-tool',
    outputSchema: {
        type: 'object',
        properties: {
            success: { type: 'boolean' },
            result: { type: 'any' },
            error: { type: 'string' }
        }
    },
    exampleOutput: {
        success: true,
        result: {
            "forecast": [
                {
                    "date": "2025-04-03",
                    "temperature": 68,
                    "conditions": "Partly cloudy"
                }
            ]
        }
    },
    ...commonSchema,
    inputSchema: {
        type: 'object',
        properties: {
            serverName: {
                type: 'string',
                description: 'Name of the MCP server to connect to'
            },
            toolName: {
                type: 'string',
                description: 'Name of the tool to use'
            },
            arguments: {
                type: 'object',
                additionalProperties: true,
                description: 'Arguments to pass to the tool'
            }
        },
        required: ['serverName', 'toolName', 'arguments']
    },
    description: 'Use a tool provided by an MCP server',
    execute: async (input: any): Promise<any> => {
        try {
            const { serverName, toolName, arguments: args } = input;

            // In a real implementation, this would use the MCP SDK to connect to the server
            // and call the tool. For now, we'll just return a mock response.
            console.log(`Using tool ${toolName} on server ${serverName} with arguments:`, args);

            // Mock response
            const mockResponse = {
                forecast: [
                    {
                        date: "2025-04-03",
                        temperature: 68,
                        conditions: "Partly cloudy"
                    }
                ]
            };

            return {
                success: true,
                result: mockResponse
            };
        } catch (error) {
            console.error('Error using MCP tool:', error);
            return {
                success: false,
                error: `Error using MCP tool: ${(error as Error).message}`
            };
        }
    }
};

export default useTool;
