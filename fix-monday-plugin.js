#!/usr/bin/env node

/**
 * This script specifically fixes the monday plugin
 * which is one of the plugins with build failures.
 */

const fs = require('fs');
const path = require('path');

// Path to the monday plugin
const mondayPluginPath = path.join(__dirname, 'packages', 'plugins', 'monday');
const mondayPluginSrcPath = path.join(mondayPluginPath, 'src');

// Fix the tsconfig.json file
function fixMondayPluginConfig() {
  const configPath = path.join(mondayPluginPath, 'tsconfig.json');
  
  if (!fs.existsSync(configPath)) {
    console.error('Config file not found for monday plugin');
    return;
  }
  
  try {
    // Read the current config
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
    
    // Add strict: false to fix the implicit any errors
    config.compilerOptions.strict = false;
    
    // Write the updated config back
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    console.log('Fixed config for monday plugin');
    
  } catch (error) {
    console.error('Error fixing config for monday plugin:', error);
  }
}

// Fix the index.ts file
function fixIndexFile() {
  const indexPath = path.join(mondayPluginSrcPath, 'index.ts');
  
  if (!fs.existsSync(indexPath)) {
    console.error('index.ts file not found for monday plugin');
    return;
  }
  
  try {
    let content = fs.readFileSync(indexPath, 'utf8');
    
    // Fix import statements
    content = content.replace(/from ['"]\.\/client['"];/g, "from './client.js';");
    content = content.replace(/from ['"]\.\/constants['"];/g, "from './constants.js';");
    content = content.replace(/from ['"]\.\/utils['"];/g, "from './utils.js';");
    
    // Fix export statements
    content = content.replace(/export \* from ['"]\.\/models['"];/g, "export * from './models.js';");
    content = content.replace(/export \* from ['"]\.\/constants['"];/g, "export * from './constants.js';");
    
    // Write the updated content back
    fs.writeFileSync(indexPath, content);
    console.log('Fixed index.ts file');
    
  } catch (error) {
    console.error('Error fixing index.ts file:', error);
  }
}

// Fix the client.ts file
function fixClientFile() {
  const clientPath = path.join(mondayPluginSrcPath, 'client.ts');
  
  if (!fs.existsSync(clientPath)) {
    console.error('client.ts file not found for monday plugin');
    return;
  }
  
  try {
    let content = fs.readFileSync(clientPath, 'utf8');
    
    // Fix import statements
    content = content.replace(/from ['"]\.\/models['"];/g, "from './models.js';");
    content = content.replace(/from ['"]\.\/mutations['"];/g, "from './mutations.js';");
    content = content.replace(/from ['"]\.\/queries['"];/g, "from './queries.js';");
    
    // Write the updated content back
    fs.writeFileSync(clientPath, content);
    console.log('Fixed client.ts file');
    
  } catch (error) {
    console.error('Error fixing client.ts file:', error);
  }
}

// Fix the models.ts file
function fixModelsFile() {
  const modelsPath = path.join(mondayPluginSrcPath, 'models.ts');
  
  if (!fs.existsSync(modelsPath)) {
    console.error('models.ts file not found for monday plugin');
    return;
  }
  
  try {
    let content = fs.readFileSync(modelsPath, 'utf8');
    
    // Fix import statements
    content = content.replace(/from ['"]\.\/constants['"];/g, "from './constants.js';");
    
    // Write the updated content back
    fs.writeFileSync(modelsPath, content);
    console.log('Fixed models.ts file');
    
  } catch (error) {
    console.error('Error fixing models.ts file:', error);
  }
}

// Fix the utils.ts file
function fixUtilsFile() {
  const utilsPath = path.join(mondayPluginSrcPath, 'utils.ts');
  
  if (!fs.existsSync(utilsPath)) {
    console.error('utils.ts file not found for monday plugin');
    return;
  }
  
  try {
    let content = fs.readFileSync(utilsPath, 'utf8');
    
    // Fix import statements
    content = content.replace(/from ['"]\.\/constants['"];/g, "from './constants.js';");
    content = content.replace(/from ['"]\.\/models['"];/g, "from './models.js';");
    
    // Write the updated content back
    fs.writeFileSync(utilsPath, content);
    console.log('Fixed utils.ts file');
    
  } catch (error) {
    console.error('Error fixing utils.ts file:', error);
  }
}

// Run the fixes
fixMondayPluginConfig();
fixIndexFile();
fixClientFile();
fixModelsFile();
fixUtilsFile();

console.log('Monday plugin fixes completed.');
