const { execSync } = require('child_process');

const pluginName = process.argv[2];
if (!pluginName) {
    console.error('Please provide a plugin name');
    process.exit(1);
}

const command = `pnpm nx generate @nx/js:library --name=${pluginName} --directory=packages/plugins/${pluginName} --importPath=@mintflow/plugins/${pluginName} --projectNameAndRootFormat=as-provided --no-interactive`;

try {
    execSync(command, { stdio: 'inherit' });
} catch (error) {
    console.error('Error generating plugin:', error);
    process.exit(1);
}