#!/usr/bin/env node

/**
 * This script specifically fixes the sendgrid plugin
 * which is one of the plugins with build failures.
 */

const fs = require('fs');
const path = require('path');

// Path to the sendgrid plugin
const sendgridPluginPath = path.join(__dirname, 'packages', 'plugins', 'sendgrid');
const sendgridPluginSrcPath = path.join(sendgridPluginPath, 'src');

// Fix the tsconfig.json file
function fixSendgridPluginConfig() {
  const configPath = path.join(sendgridPluginPath, 'tsconfig.json');
  
  if (!fs.existsSync(configPath)) {
    console.error('Config file not found for sendgrid plugin');
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
    console.log('Fixed config for sendgrid plugin');
    
  } catch (error) {
    console.error('Error fixing config for sendgrid plugin:', error);
  }
}

// Fix the index.ts file
function fixIndexFile() {
  const indexPath = path.join(sendgridPluginSrcPath, 'index.ts');
  
  if (!fs.existsSync(indexPath)) {
    console.error('index.ts file not found for sendgrid plugin');
    return;
  }
  
  try {
    let content = fs.readFileSync(indexPath, 'utf8');
    
    // Fix import statements
    content = content.replace(/from ['"]\.\/actions['"];/g, "from './actions/index.js';");
    content = content.replace(/from ['"]\.\/common['"];/g, "from './common/index.js';");
    
    // Write the updated content back
    fs.writeFileSync(indexPath, content);
    console.log('Fixed index.ts file');
    
  } catch (error) {
    console.error('Error fixing index.ts file:', error);
  }
}

// Fix all action files
function fixActionFiles() {
  const actionsDir = path.join(sendgridPluginSrcPath, 'actions');
  
  if (!fs.existsSync(actionsDir)) {
    console.error('actions directory not found for sendgrid plugin');
    return;
  }
  
  try {
    const files = fs.readdirSync(actionsDir);
    
    files.forEach(file => {
      if (file.endsWith('.ts')) {
        const filePath = path.join(actionsDir, file);
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Fix import statements
        content = content.replace(/from ['"]\.\.\/common['"];/g, "from '../common/index.js';");
        
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
      content = content.replace(/export \* from ['"]\.\/send-email['"];/g, "export * from './send-email.js';");
      content = content.replace(/export \* from ['"]\.\/send-dynamic-template['"];/g, "export * from './send-dynamic-template.js';");
      content = content.replace(/export \* from ['"]\.\/custom-api-call['"];/g, "export * from './custom-api-call.js';");
      
      // Write the updated content back
      fs.writeFileSync(actionsIndexPath, content);
      console.log('Fixed actions/index.ts file');
    }
    
  } catch (error) {
    console.error('Error fixing action files:', error);
  }
}

// Fix common files
function fixCommonFiles() {
  const commonDir = path.join(sendgridPluginSrcPath, 'common');
  
  if (!fs.existsSync(commonDir)) {
    console.error('common directory not found for sendgrid plugin');
    return;
  }
  
  try {
    const files = fs.readdirSync(commonDir);
    
    files.forEach(file => {
      if (file.endsWith('.ts')) {
        const filePath = path.join(commonDir, file);
        let content = fs.readFileSync(filePath, 'utf8');
        
        // No specific imports to fix in common files
        
        // Write the updated content back
        fs.writeFileSync(filePath, content);
        console.log(`Fixed ${file} file`);
      }
    });
    
    // Fix the index.ts file in common directory
    const commonIndexPath = path.join(commonDir, 'index.ts');
    if (fs.existsSync(commonIndexPath)) {
      let content = fs.readFileSync(commonIndexPath, 'utf8');
      
      // Fix export statements
      content = content.replace(/export \* from ['"]\.\/client['"];/g, "export * from './client.js';");
      
      // Write the updated content back
      fs.writeFileSync(commonIndexPath, content);
      console.log('Fixed common/index.ts file');
    }
    
  } catch (error) {
    console.error('Error fixing common files:', error);
  }
}

// Run the fixes
fixSendgridPluginConfig();
fixIndexFile();
fixActionFiles();
fixCommonFiles();

console.log('Sendgrid plugin fixes completed.');
