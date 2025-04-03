import { commonSchema } from "../common.js";

export const listServers = {
    name: 'list-servers',
    outputSchema: {
        type: 'object',
        properties: {
            success: { type: 'boolean' },
            servers: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        name: { type: 'string' },
                        status: { type: 'string' },
                        capabilities: {
                            type: 'object',
                            properties: {
                                tools: { type: 'boolean' },
                                resources: { type: 'boolean' }
                            }
                        }
                    }
                }
            },
            error: { type: 'string' }
        }
    },
    exampleOutput: {
        success: true,
        servers: [
            {
                name: "weather-server",
                status: "running",
                capabilities: {
                    tools: true,
                    resources: true
                }
            },
            {
                name: "document-server",
                status: "stopped",
                capabilities: {
                    tools: true,
                    resources: false
                }
            }
        ]
    },
    ...commonSchema,
    inputSchema: {
        type: 'object',
        properties: {
            status: {
                type: 'string',
                enum: ['all', 'running', 'stopped'],
                default: 'all',
                description: 'Filter servers by status'
            }
        }
    },
    description: 'List all available MCP servers',
    execute: async (input: any): Promise<any> => {
        try {
            const { status = 'all' } = input;

            // In a real implementation, this would query the system for available MCP servers
            // For now, we'll just return a mock list
            console.log(`Listing MCP servers with status filter: ${status}`);

            // Mock server list
            const mockServers = [
                {
                    name: "weather-server",
                    status: "running",
                    capabilities: {
                        tools: true,
                        resources: true
                    }
                },
                {
                    name: "document-server",
                    status: "stopped",
                    capabilities: {
                        tools: true,
                        resources: false
                    }
                },
                {
                    name: "image-server",
                    status: "running",
                    capabilities: {
                        tools: false,
                        resources: true
                    }
                }
            ];

            // Filter by status if needed
            const filteredServers = status === 'all'
                ? mockServers
                : mockServers.filter(server => server.status === status);

            return {
                success: true,
                servers: filteredServers
            };
        } catch (error) {
            console.error('Error listing MCP servers:', error);
            return {
                success: false,
                error: `Error listing MCP servers: ${(error as Error).message}`
            };
        }
    }
};

export default listServers;
