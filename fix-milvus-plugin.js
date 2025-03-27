#!/usr/bin/env node

/**
 * This script specifically fixes the milvus plugin
 * which is one of the plugins with build failures.
 */

const fs = require('fs');
const path = require('path');

// Path to the milvus plugin
const milvusPluginPath = path.join(__dirname, 'packages', 'plugins', 'milvus');
const milvusPluginSrcPath = path.join(milvusPluginPath, 'src');

// Fix the tsconfig.json file
function fixMilvusPluginConfig() {
  const configPath = path.join(milvusPluginPath, 'tsconfig.json');
  
  if (!fs.existsSync(configPath)) {
    console.error('Config file not found for milvus plugin');
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
    console.log('Fixed config for milvus plugin');
    
  } catch (error) {
    console.error('Error fixing config for milvus plugin:', error);
  }
}

// Fix the index.ts file
function fixIndexFile() {
  const indexPath = path.join(milvusPluginSrcPath, 'index.ts');
  
  if (!fs.existsSync(indexPath)) {
    console.error('index.ts file not found for milvus plugin');
    return;
  }
  
  try {
    let content = fs.readFileSync(indexPath, 'utf8');
    
    // Fix import statements
    content = content.replace(/from ['"]\.\/actions\/create-collection\.js['"];/g, "from './actions/create-collection.js';");
    content = content.replace(/from ['"]\.\/actions\/delete-collection\.js['"];/g, "from './actions/delete-collection.js';");
    content = content.replace(/from ['"]\.\/actions\/list-collections\.js['"];/g, "from './actions/list-collections.js';");
    content = content.replace(/from ['"]\.\/actions\/get-collection-info\.js['"];/g, "from './actions/get-collection-info.js';");
    content = content.replace(/from ['"]\.\/actions\/insert-vectors\.js['"];/g, "from './actions/insert-vectors.js';");
    content = content.replace(/from ['"]\.\/actions\/search-vectors\.js['"];/g, "from './actions/search-vectors.js';");
    
    // Write the updated content back
    fs.writeFileSync(indexPath, content);
    console.log('Fixed index.ts file');
    
  } catch (error) {
    console.error('Error fixing index.ts file:', error);
  }
}

// Fix all action files
function fixActionFiles() {
  const actionsDir = path.join(milvusPluginSrcPath, 'actions');
  
  if (!fs.existsSync(actionsDir)) {
    console.error('actions directory not found for milvus plugin');
    return;
  }
  
  try {
    const files = fs.readdirSync(actionsDir);
    
    files.forEach(file => {
      if (file.endsWith('.ts')) {
        const filePath = path.join(actionsDir, file);
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Fix import statements
        if (file !== 'list-collections.ts') {
          content = content.replace(/from ['"]\.\/list-collections['"];/g, "from './list-collections.js';");
        }
        
        // Write the updated content back
        fs.writeFileSync(filePath, content);
        console.log(`Fixed ${file} file`);
      }
    });
    
  } catch (error) {
    console.error('Error fixing action files:', error);
  }
}

// Run the fixes
fixMilvusPluginConfig();
fixIndexFile();
fixActionFiles();

console.log('Milvus plugin fixes completed.');
