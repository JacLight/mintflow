import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const nxJsonPath = path.join(__dirname, "../nx.json");
const pluginsDir = path.join(__dirname, "../packages/plugins");

function updateNxJson() {
    if (!fs.existsSync(nxJsonPath)) {
        console.error("❌ nx.json not found!");
        process.exit(1);
    }

    // Read nx.json
    const nxJson = JSON.parse(fs.readFileSync(nxJsonPath, "utf-8"));

    // Scan plugins directory
    const pluginDirs = fs
        .readdirSync(pluginsDir)
        .filter((dir) => fs.statSync(path.join(pluginsDir, dir)).isDirectory());

    console.log("🔍 Found plugins:", pluginDirs);

    // Register plugins dynamically
    pluginDirs.forEach((plugin) => {
        const pluginName = `@mintflow/${plugin}`;
        const pluginPath = `packages/plugins/${plugin}`;

        if (!nxJson.projects) nxJson.projects = {};

        if (!nxJson.projects[pluginName]) {
            nxJson.projects[pluginName] = { root: pluginPath };
            console.log(`✅ Registered plugin: ${pluginName}`);
        }
    });

    // Write updated nx.json
    fs.writeFileSync(nxJsonPath, JSON.stringify(nxJson, null, 2));
    console.log("✨ nx.json updated successfully!");
}

// Run the update function
updateNxJson();
