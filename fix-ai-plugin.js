#!/usr/bin/env node

/**
 * This script specifically fixes issues with the AI plugin
 * which is one of the plugins with build failures.
 * 
 * It addresses:
 * 1. Module resolution conflicts
 * 2. Import path issues
 * 3. TypeScript configuration inconsistencies
 */

const fs = require('fs');
const path = require('path');

// Path to the AI plugin
const aiPluginPath = path.join(__dirname, 'packages', 'plugins', 'ai');
const aiPluginConfigPath = path.join(aiPluginPath, 'tsconfig.json');
const aiPluginSrcPath = path.join(aiPluginPath, 'src');

// Fix the tsconfig.json file
function fixAIPluginConfig() {
  if (!fs.existsSync(aiPluginConfigPath)) {
    console.error('Config file not found for AI plugin');
    return;
  }
  
  try {
    // Read the current config
    // Use a more robust approach to handle JSON with trailing commas
    const configContent = fs.readFileSync(aiPluginConfigPath, 'utf8');
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
    fs.writeFileSync(aiPluginConfigPath, JSON.stringify(config, null, 2));
    console.log('Fixed config for AI plugin');
    
  } catch (error) {
    console.error('Error fixing config for AI plugin:', error);
  }
}

// Fix JS extensions in imports
function fixJSExtensionsInImports() {
  if (!fs.existsSync(aiPluginSrcPath)) {
    console.error('Source directory not found for AI plugin');
    return;
  }
  
  // Get all TypeScript files in the src directory
  const files = getAllFiles(aiPluginSrcPath).filter(file => file.endsWith('.ts'));
  
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

// Run the fixes
fixAIPluginConfig();
fixJSExtensionsInImports();

console.log('AI plugin fixes completed.');
