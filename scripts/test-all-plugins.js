const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const pluginsDir = path.join(__dirname, '../packages/plugins');

const runTests = (pluginDir) => {
    try {
        console.log(`Running tests for ${pluginDir}...`);
        execSync('pnpm test', { cwd: pluginDir, stdio: 'inherit' });
        console.log(`Tests passed for ${pluginDir}`);
    } catch (error) {
        console.error(`Tests failed for ${pluginDir}`);
        process.exit(1);
    }
};

fs.readdirSync(pluginsDir).forEach(plugin => {
    const pluginDir = path.join(pluginsDir, plugin);
    if (fs.lstatSync(pluginDir).isDirectory()) {
        runTests(pluginDir);
    }
});
