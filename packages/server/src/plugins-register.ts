import { PluginDescriptor, logger } from "@mintflow/common";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import timerPlugin from "./plugins/timer-plugin.js";

// Set up global error handlers to prevent plugin loading issues from crashing the server
const setupErrorHandlers = () => {
    // Set up process-level uncaught exception handler
    process.on('uncaughtException', (err) => {
        console.error('🚨 Uncaught exception:', err);
        // Don't exit the process, just log the error
    });

    // Handle unhandled promise rejections
    process.on('unhandledRejection', (reason, promise) => {
        console.error('🚨 Unhandled promise rejection:', reason);
        // Don't exit the process, just log the error
    });
};

// Call the setup function immediately
setupErrorHandlers();

let _dirname;
if (typeof __dirname !== 'undefined') {
    _dirname = __dirname;
} else {
    const __filename = fileURLToPath(import.meta.url);
    _dirname = path.dirname(__filename);
}
const pluginsDir = path.join(_dirname, "../../plugins");

const pluginMap = new Map<string, PluginDescriptor>();

export async function loadPlugins() {
    const pluginNames = fs.readdirSync(pluginsDir).filter(plugin => {
        return fs.existsSync(path.join(pluginsDir, plugin, "package.json"));
    });

    // Load built-in plugins first
    pluginMap.set("timer", timerPlugin);
    console.log(`✅ Loaded built-in plugin: timer`);

    // Load external plugins with robust error handling
    for (const plugin of pluginNames) {
        // Wrap the entire plugin loading process in a try-catch to prevent any errors from crashing the server
        try {
            const pluginPath = path.join(pluginsDir, plugin, "dist/index.js");
            console.log(`🔍 Trying to load plugin from: ${pluginPath}`);

            // Use dynamic import with a timeout to prevent hanging
            const importPromise = (async () => {
                try {
                    return await import(pluginPath);
                } catch (importErr) {
                    console.error(`❌ Import error for plugin: ${plugin}`, importErr);
                    return null;
                }
            })();

            // Set a timeout for the import (30 seconds)
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error(`Import timeout for plugin: ${plugin}`)), 30000)
            );

            // Race the import against the timeout
            const pluginModule = await Promise.race([importPromise, timeoutPromise])
                .catch(err => {
                    console.error(`⏱️ ${err.message}`);
                    return null;
                });

            // If plugin module loaded successfully
            if (pluginModule) {
                const definition = pluginModule.default;
                if (definition && definition.name && definition?.id) {
                    pluginMap.set(plugin, definition);
                    console.log(`✅ Loaded plugin: ${plugin}`);
                } else {
                    console.error(`⚠️ Invalid plugin structure: ${plugin} - missing required fields`);
                }
            }
        } catch (err) {
            // This catch block handles any other errors that might occur during the plugin loading process
            console.error(`❌ Failed to load plugin: ${plugin}`, err);
            console.log(`⚠️ Continuing to load other plugins...`);
        }
    }

    console.log(`📊 Loaded ${pluginMap.size} plugins successfully`);
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
