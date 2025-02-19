import { readdirSync } from "fs";
import path from "path";
import { PluginDescriptor } from "./types/noteTypes";

const pluginsDir = path.join(__dirname, "../packages/plugins");
const pluginMap = new Map<string, PluginDescriptor>();

export async function loadPlugins() {
    const pluginNames = readdirSync(pluginsDir);

    for (const plugin of pluginNames) {
        try {
            const pluginModule = await import(`@mintflow/${plugin}`); // Load dynamically from PNPM workspace
            pluginMap.set(plugin, pluginModule.default); // Store plugin in the map
            console.log(`✅ Loaded plugin: ${plugin}`);
        } catch (err) {
            console.error(`❌ Failed to load plugin: ${plugin}`, err);
        }
    }
}

// Function to fetch plugin by name
export function getPlugin(name: string) {
    return pluginMap.get(name);
}

export const getNodeAction = (nodeId: string, action: string) => {
    const node = getPlugin(nodeId);
    return node?.actions.find(a => a.name === action);
}
// Compare this snippet from packages/server/src/routes/flowEngineRoutes.ts: