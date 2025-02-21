const fs = require('fs-extra');
const path = require('path');
const Handlebars = require('handlebars');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

const argv = yargs(hideBin(process.argv)).argv;
const pluginName = argv._[0];

if (!pluginName) {
    console.error('Please provide a plugin name');
    process.exit(1);
}

const templateDir = path.join(__dirname, './_template');
const pluginDir = path.join(__dirname, `../packages/plugins/${pluginName}`);

// Copy template directory to new plugin directory
fs.copySync(templateDir, pluginDir);

// Replace {{name}} placeholders with the plugin name
const replacePlaceholders = (filePath) => {
    const content = fs.readFileSync(filePath, 'utf8');
    const template = Handlebars.compile(content);
    const newContent = template({ name: pluginName });
    fs.writeFileSync(filePath, newContent, 'utf8');
};

// Recursively replace placeholders in all files
const replaceInDir = (dir) => {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.lstatSync(filePath).isDirectory()) {
            replaceInDir(filePath);
        } else {
            replacePlaceholders(filePath);
        }
    });
};

replaceInDir(pluginDir);

// Rename index.tpl to index.tsx
fs.renameSync(path.join(pluginDir, 'src/index.tpl'), path.join(pluginDir, 'src/index.tsx'));

console.log(`Plugin ${pluginName} generated successfully.`);
