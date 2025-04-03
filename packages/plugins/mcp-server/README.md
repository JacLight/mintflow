# MCP Server Plugin

The MCP Server Plugin allows you to convert any node to a Model Context Protocol (MCP) server. This plugin provides tools to create, start, and stop MCP servers, enabling seamless integration with AI assistants that support the Model Context Protocol.

## What is the Model Context Protocol (MCP)?

The Model Context Protocol (MCP) is a standardized way for AI assistants to communicate with external tools and resources. It allows AI models to access real-time data, perform actions in the real world, and extend their capabilities beyond their training data.

## Features

- **Create MCP Server Templates**: Generate boilerplate code for new MCP servers with customizable capabilities
- **Start MCP Servers**: Launch MCP servers with configurable environment variables and arguments
- **Stop MCP Servers**: Gracefully shut down running MCP servers

## Actions

### create-server

Creates a new MCP server template with the specified configuration.

**Input:**

```json
{
  "name": "weather-server",
  "description": "MCP server for weather data",
  "outputPath": "/path/to/output/directory",
  "capabilities": {
    "tools": true,
    "resources": true
  }
}
```

**Output:**

```json
{
  "success": true,
  "message": "MCP server template 'weather-server' created successfully at /path/to/output/directory"
}
```

### start-server

Starts an MCP server process with the specified command and arguments.

**Input:**

```json
{
  "command": "node",
  "args": ["server.js"],
  "env": {
    "API_KEY": "your-api-key"
  },
  "cwd": "/path/to/server/directory"
}
```

**Output:**

```json
{
  "success": true,
  "message": "MCP server started successfully with PID 12345",
  "pid": 12345
}
```

### stop-server

Stops a running MCP server process.

**Input:**

```json
{
  "pid": 12345,
  "signal": "SIGTERM"
}
```

**Output:**

```json
{
  "success": true,
  "message": "Signal SIGTERM sent to MCP server with PID 12345"
}
```

## Usage Examples

### Creating and Starting a Weather MCP Server

1. Create a new MCP server template:

```javascript
// Create a weather MCP server template
const createResult = await actions.createServer.execute({
  name: "weather-server",
  description: "MCP server for weather data",
  outputPath: "./weather-server"
});
```

2. Start the MCP server:

```javascript
// Start the weather MCP server
const startResult = await actions.startServer.execute({
  command: "node",
  args: ["./weather-server/index.js"],
  env: {
    "WEATHER_API_KEY": "your-weather-api-key"
  }
});

// Store the PID for later use
const serverPid = startResult.pid;
```

3. Stop the MCP server when done:

```javascript
// Stop the weather MCP server
const stopResult = await actions.stopServer.execute({
  pid: serverPid
});
```

## Installation

```bash
npm install @mintflow/mcp-server
```

## Requirements

- Node.js 14.x or higher
- @modelcontextprotocol/sdk

## License

MIT
