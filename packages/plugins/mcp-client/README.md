# MCP Client Plugin

The MCP Client Plugin allows you to connect to Model Context Protocol (MCP) servers, use their tools, and access their resources. This plugin provides a bridge between MintFlow workflows and MCP servers, enabling seamless integration with AI assistants that support the Model Context Protocol.

## What is the Model Context Protocol (MCP)?

The Model Context Protocol (MCP) is a standardized way for AI assistants to communicate with external tools and resources. It allows AI models to access real-time data, perform actions in the real world, and extend their capabilities beyond their training data.

## Features

- **Use MCP Tools**: Call tools provided by MCP servers to perform actions
- **Access MCP Resources**: Retrieve data from resources exposed by MCP servers
- **List Available Servers**: Discover and manage connected MCP servers

## Actions

### use-tool

Calls a tool provided by an MCP server with the specified arguments.

**Input:**

```json
{
  "serverName": "weather-server",
  "toolName": "get_forecast",
  "arguments": {
    "city": "San Francisco",
    "days": 5
  }
}
```

**Output:**

```json
{
  "success": true,
  "result": {
    "forecast": [
      {
        "date": "2025-04-03",
        "temperature": 68,
        "conditions": "Partly cloudy"
      }
    ]
  }
}
```

### access-resource

Retrieves data from a resource provided by an MCP server.

**Input:**

```json
{
  "serverName": "weather-server",
  "uri": "weather://san-francisco/current"
}
```

**Output:**

```json
{
  "success": true,
  "content": "{\"temperature\":72,\"conditions\":\"sunny\",\"humidity\":45}",
  "mimeType": "application/json"
}
```

### list-servers

Lists all available MCP servers with optional filtering by status.

**Input:**

```json
{
  "status": "running"
}
```

**Output:**

```json
{
  "success": true,
  "servers": [
    {
      "name": "weather-server",
      "status": "running",
      "capabilities": {
        "tools": true,
        "resources": true
      }
    },
    {
      "name": "image-server",
      "status": "running",
      "capabilities": {
        "tools": false,
        "resources": true
      }
    }
  ]
}
```

## Usage Examples

### Getting Weather Forecast

```javascript
// List available servers
const listResult = await actions.listServers.execute({
  status: 'running'
});

// Use the weather server's forecast tool
const forecastResult = await actions.useTool.execute({
  serverName: "weather-server",
  toolName: "get_forecast",
  arguments: {
    city: "San Francisco",
    days: 3
  }
});

// Process the forecast data
const forecast = forecastResult.result.forecast;
console.log(`Weather forecast for San Francisco: ${forecast[0].conditions}, ${forecast[0].temperature}°F`);
```

### Accessing Document Resources

```javascript
// Access a document resource
const documentResult = await actions.accessResource.execute({
  serverName: "document-server",
  uri: "document://reports/q1-2025.md"
});

// Process the document content
console.log(`Document content: ${documentResult.content}`);
```

## Installation

```bash
npm install @mintflow/mcp-client
```

## Requirements

- Node.js 14.x or higher
- @modelcontextprotocol/sdk

## License

MIT
