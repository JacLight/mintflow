import { PluginDescriptor } from "@mintflow/common";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";

// 👇 Define __dirname manually in ES module scope
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);


// ✅ Correct path to plugins directory
const pluginsDir = path.join(__dirname, "../../plugins");

const pluginMap = new Map<string, PluginDescriptor>();

export async function loadPlugins() {
    const pluginNames = fs.readdirSync(pluginsDir).filter(plugin => {
        return fs.existsSync(path.join(pluginsDir, plugin, "package.json"));
    });

    for (const plugin of pluginNames) {
        try {
            const pluginPath = path.join(pluginsDir, plugin, "dist/index.js");
            console.log(`🔍 Trying to load plugin from: ${pluginPath}`);
            const pluginModule = await import(pluginPath);
            const definition = pluginModule.default;
            if (definition && definition.name && definition?.id) {
                pluginMap.set(plugin, definition);
                console.log(`✅ Loaded plugin: ${plugin}`);
            } else {
                console.error(`Invalid plugin: ${plugin}`);
            }
        } catch (err) {
            console.error(`❌ Failed to load plugin: ${plugin}`, err);
        }
    }
}

export function getPlugins() {
    return pluginMap;
}

// Function to fetch a plugin by name
export function getPlugin(name: string) {
    return pluginMap.get(name);
}

// Function to retrieve node actions from a plugin
export const getNodeAction = (nodeId: string, action: string) => {
    const node = getPlugin(nodeId);
    return node?.actions.find(a => a.name.toLowerCase() === action.toLowerCase());
};

