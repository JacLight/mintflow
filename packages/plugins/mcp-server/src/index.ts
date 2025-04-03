import { PluginDescriptor } from "@mintflow/common";
import { createServer } from "./actions/create-server.js";
import { startServer } from "./actions/start-server.js";
import { stopServer } from "./actions/stop-server.js";

const mcpServerPlugin: PluginDescriptor = {
    name: "MCP Server Plugin",
    icon: "FaServer",
    description: "Convert any node to an MCP server",
    id: "mcp-server",
    runner: "node",
    type: 'node',
    documentation: "https://docs.mintflow.ai/plugins/mcp-server",
    actions: [
        createServer,
        startServer,
        stopServer
    ]
};

export default mcpServerPlugin;
