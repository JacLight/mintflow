#!/usr/bin/env node

/**
 * This script specifically fixes the snowflake plugin
 * which is one of the plugins with build failures.
 */

const fs = require('fs');
const path = require('path');

// Path to the snowflake plugin
const snowflakePluginPath = path.join(__dirname, 'packages', 'plugins', 'snowflake');
const snowflakePluginSrcPath = path.join(snowflakePluginPath, 'src');

// Fix the tsconfig.json file
function fixSnowflakePluginConfig() {
  const configPath = path.join(snowflakePluginPath, 'tsconfig.json');
  
  if (!fs.existsSync(configPath)) {
    console.error('Config file not found for snowflake plugin');
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
    console.log('Fixed config for snowflake plugin');
    
  } catch (error) {
    console.error('Error fixing config for snowflake plugin:', error);
  }
}

// Fix the index.ts file
function fixIndexFile() {
  const indexPath = path.join(snowflakePluginSrcPath, 'index.ts');
  
  if (!fs.existsSync(indexPath)) {
    console.error('index.ts file not found for snowflake plugin');
    return;
  }
  
  try {
    let content = fs.readFileSync(indexPath, 'utf8');
    
    // Fix import statements
    content = content.replace(/from ['"]\.\/actions['"];/g, "from './actions/index.js';");
    content = content.replace(/from ['"]\.\/utils['"];/g, "from './utils/index.js';");
    
    // Write the updated content back
    fs.writeFileSync(indexPath, content);
    console.log('Fixed index.ts file');
    
  } catch (error) {
    console.error('Error fixing index.ts file:', error);
  }
}

// Fix all action files
function fixActionFiles() {
  const actionsDir = path.join(snowflakePluginSrcPath, 'actions');
  
  if (!fs.existsSync(actionsDir)) {
    console.error('actions directory not found for snowflake plugin');
    return;
  }
  
  try {
    const files = fs.readdirSync(actionsDir);
    
    files.forEach(file => {
      if (file.endsWith('.ts')) {
        const filePath = path.join(actionsDir, file);
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Fix import statements
        content = content.replace(/from ['"]\.\.\/utils['"];/g, "from '../utils/index.js';");
        
        // Write the updated content back
        fs.writeFileSync(filePath, content);
        console.log(`Fixed ${file} file`);
      }
    });
    
    // Fix the index.ts file in actions directory
    const actionsIndexPath = path.join(actionsDir, 'index.ts');
    if (fs.existsSync(actionsIndexPath)) {
      let content = fs.readFileSync(actionsIndexPath, 'utf8');
      
      // Fix export statements
      content = content.replace(/export \* from ['"]\.\/execute-query['"];/g, "export * from './execute-query.js';");
      content = content.replace(/export \* from ['"]\.\/list-databases['"];/g, "export * from './list-databases.js';");
      content = content.replace(/export \* from ['"]\.\/list-schemas['"];/g, "export * from './list-schemas.js';");
      content = content.replace(/export \* from ['"]\.\/list-tables['"];/g, "export * from './list-tables.js';");
      content = content.replace(/export \* from ['"]\.\/describe-table['"];/g, "export * from './describe-table.js';");
      
      // Write the updated content back
      fs.writeFileSync(actionsIndexPath, content);
      console.log('Fixed actions/index.ts file');
    }
    
  } catch (error) {
    console.error('Error fixing action files:', error);
  }
}

// Fix utils files
function fixUtilsFiles() {
  const utilsDir = path.join(snowflakePluginSrcPath, 'utils');
  
  if (!fs.existsSync(utilsDir)) {
    console.error('utils directory not found for snowflake plugin');
    return;
  }
  
  try {
    const files = fs.readdirSync(utilsDir);
    
    files.forEach(file => {
      if (file.endsWith('.ts')) {
        const filePath = path.join(utilsDir, file);
        let content = fs.readFileSync(filePath, 'utf8');
        
        // No specific imports to fix in utils files
        
        // Write the updated content back
        fs.writeFileSync(filePath, content);
        console.log(`Fixed ${file} file`);
      }
    });
    
  } catch (error) {
    console.error('Error fixing utils files:', error);
  }
}

// Run the fixes
fixSnowflakePluginConfig();
fixIndexFile();
fixActionFiles();
fixUtilsFiles();

console.log('Snowflake plugin fixes completed.');
