import { PluginDescriptor } from "@mintflow/common";
import { useTool } from "./actions/use-tool.js";
import { accessResource } from "./actions/access-resource.js";
import { listServers } from "./actions/list-servers.js";

const mcpClientPlugin: PluginDescriptor = {
    name: "MCP Client Plugin",
    icon: "FaDesktop",
    description: "Connect to MCP servers",
    id: "mcp-client",
    runner: "node",
    type: 'node',
    documentation: "https://docs.mintflow.ai/plugins/mcp-client",
    actions: [
        useTool,
        accessResource,
        listServers
    ]
};

export default mcpClientPlugin;
