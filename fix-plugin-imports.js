#!/usr/bin/env node

/**
 * This script fixes TypeScript configuration issues in plugin packages
 * that are causing build failures.
 * 
 * Issues addressed:
 * 1. Module resolution conflicts between base tsconfig and plugin tsconfig
 * 2. Path references to the common package
 * 3. TypeScript configuration inconsistencies
 */

const fs = require('fs');
const path = require('path');

// List of plugins with build failures
const failingPlugins = [
  'monday',
  'milvus',
  'sendgrid',
  'snowflake',
  'ui-web'
];

// Process each failing plugin
failingPlugins.forEach(plugin => {
  if (plugin === 'ui-web') {
    // ui-web is a special case as it's not in the plugins directory
    fixUIWebConfig();
  } else {
    // Fix plugin in the plugins directory
    fixPluginConfig(plugin);
  }
});

function fixPluginConfig(pluginName) {
  const configPath = path.join(__dirname, 'packages', 'plugins', pluginName, 'tsconfig.json');
  
  if (!fs.existsSync(configPath)) {
    console.error(`Config file not found for plugin: ${pluginName}`);
    return;
  }
  
  try {
    // Read the current config
    // Use a more robust approach to handle JSON with trailing commas
    const configContent = fs.readFileSync(configPath, 'utf8');
    // Remove trailing commas from JSON
    const cleanedContent = configContent.replace(/,(\s*[}\]])/g, '$1');
    const config = JSON.parse(cleanedContent);
    
    // Fix module resolution settings to match the base config
    config.compilerOptions.module = "Node16";
    config.compilerOptions.moduleResolution = "Node16";
    
    // Ensure declaration settings are consistent
    config.compilerOptions.declaration = true;
    
    // Fix path references
    if (config.compilerOptions.paths && config.compilerOptions.paths["@mintflow/common"]) {
      // Ensure the path is correctly pointing to the common package
      config.compilerOptions.paths["@mintflow/common"] = ["../../../packages/common/src/index.ts"];
    }
    
    // Write the updated config back
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log(`Fixed config for plugin: ${pluginName}`);
    
    // Check for .js extensions in imports
    fixJSExtensionsInImports(pluginName);
    
  } catch (error) {
    console.error(`Error fixing config for plugin ${pluginName}:`, error);
  }
}

function fixUIWebConfig() {
  const configPath = path.join(__dirname, 'packages', 'ui-web', 'tsconfig.json');
  
  if (!fs.existsSync(configPath)) {
    console.error('Config file not found for ui-web');
    return;
  }
  
  try {
    // Read the current config
    // Use a more robust approach to handle JSON with trailing commas
    const configContent = fs.readFileSync(configPath, 'utf8');
    // Remove trailing commas from JSON
    const cleanedContent = configContent.replace(/,(\s*[}\]])/g, '$1');
    const config = JSON.parse(cleanedContent);
    
    // For ui-web, we need to ensure it's compatible with Next.js
    // Next.js requires "moduleResolution": "node" and "module": "esnext"
    // So we don't change these settings for ui-web
    
    // Write the updated config back
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log('Fixed config for ui-web');
    
  } catch (error) {
    console.error('Error fixing config for ui-web:', error);
  }
}

function fixJSExtensionsInImports(pluginName) {
  const srcDir = path.join(__dirname, 'packages', 'plugins', pluginName, 'src');
  
  if (!fs.existsSync(srcDir)) {
    console.error(`Source directory not found for plugin: ${pluginName}`);
    return;
  }
  
  // Get all TypeScript files in the src directory
  const files = getAllFiles(srcDir).filter(file => file.endsWith('.ts'));
  
  files.forEach(file => {
    try {
      let content = fs.readFileSync(file, 'utf8');
      let updated = false;
      
      // Add .js extensions to relative imports without extensions
      // This is required for Node16 module resolution
      let updatedContent = content.replace(/from ['"](\.[^'"]*?)['"](?!\s*;)/g, (match, importPath) => {
        // Skip if the import already has an extension
        if (importPath.endsWith('.js') || importPath.endsWith('.ts') || 
            importPath.endsWith('.json') || importPath.endsWith('.node')) {
          return match;
        }
        updated = true;
        return `from '${importPath}.js'`;
      });
      
      // Also fix export statements
      updatedContent = updatedContent.replace(/export \* from ['"](\.[^'"]*?)['"](?!\s*;)/g, (match, exportPath) => {
        // Skip if the export already has an extension
        if (exportPath.endsWith('.js') || exportPath.endsWith('.ts') || 
            exportPath.endsWith('.json') || exportPath.endsWith('.node')) {
          return match;
        }
        updated = true;
        return `export * from '${exportPath}.js'`;
      });
      
      if (updated) {
        // Write the updated content back
        fs.writeFileSync(file, updatedContent);
        console.log(`Fixed JS extensions in imports for file: ${file}`);
      }
    } catch (error) {
      console.error(`Error fixing JS extensions in file ${file}:`, error);
    }
  });
}

function getAllFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat && stat.isDirectory()) {
      // Recursively get files from subdirectories
      results = results.concat(getAllFiles(filePath));
    } else {
      results.push(filePath);
    }
  });
  
  return results;
}

console.log('Plugin configuration fixes completed.');
