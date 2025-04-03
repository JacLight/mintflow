export const commonSchema = {
    exampleInput: {
        serverName: "weather-server",
        toolName: "get_forecast",
        arguments: {
            "city": "San Francisco",
            "days": 5
        }
    },
    description: "Connect to MCP servers",
    documentation: "https://docs.mintflow.ai/plugins/mcp-client",
    method: 'exec',
}
