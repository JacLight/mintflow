export const commonSchema = {
    exampleInput: {
        command: "node",
        args: ["server.js"],
        env: {
            "API_KEY": "your-api-key"
        }
    },
    description: "Converts a node to an MCP server",
    documentation: "https://docs.mintflow.ai/plugins/mcp-server",
    method: 'exec',
}
