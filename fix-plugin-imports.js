#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// List of plugins to fix
const plugins = [
  // 'ai', // Already fixed
  // 'figma', // Already fixed
  // 'stripe', // Already fixed
  // 'speech', // Already fixed
  // 'paypal', // Already fixed
  'monday',
  'milvus',
  'youtube',
  'sendgrid',
  'pinterest',
  'snowflake',
  'mailchimp',
  'krisp-call',
  'microsoft-office',
  'stable-diffusion',
  'assemblyai',
  'jira-cloud',
  'quickbooks',
  'salesforce',
  'instagram',
  'pipedrive',
  'basecamp',
  'facebook',
  'snapchat',
  'tiktok',
  'langchain'
];

// Function to recursively find all TypeScript files in a directory
function findTsFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && file !== 'node_modules' && file !== 'dist') {
      results = results.concat(findTsFiles(filePath));
    } else if (file.endsWith('.ts')) {
      results.push(filePath);
    }
  });
  
  return results;
}

// Function to fix imports in a file
function fixImportsInFile(filePath) {
  console.log(`Fixing imports in ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Find relative imports without .js extension
  const importRegex = /from\s+['"](\.[^'"]*)['"]/g;
  let match;
  
  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[1];
    
    // Skip if already has .js extension
    if (importPath.endsWith('.js')) {
      continue;
    }
    
    // Replace the import path with one that has .js extension
    const newImportPath = `${importPath}.js`;
    const newImport = `from '${newImportPath}'`;
    const oldImport = `from '${importPath}'`;
    
    content = content.replace(oldImport, newImport);
    modified = true;
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  Modified imports in ${filePath}`);
  }
}

// Function to add axios as a dependency in package.json if needed
function addAxiosDependency(pluginDir) {
  const packageJsonPath = path.join(pluginDir, 'package.json');
  
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Check if axios is already a dependency
    if (!packageJson.dependencies) {
      packageJson.dependencies = {};
    }
    
    if (!packageJson.dependencies.axios) {
      console.log(`Adding axios dependency to ${packageJsonPath}`);
      packageJson.dependencies.axios = "^1.6.7";
      
      // Write the updated package.json
      fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8');
    }
  }
}

// Function to fix a single plugin
function fixPlugin(plugin) {
  const pluginDir = path.join(process.cwd(), 'packages', 'plugins', plugin);
  
  if (!fs.existsSync(pluginDir)) {
    console.log(`Plugin directory not found: ${pluginDir}`);
    return false;
  }
  
  console.log(`\nFixing plugin: ${plugin}`);
  
  // Find all TypeScript files in the plugin directory
  const tsFiles = findTsFiles(pluginDir);
  console.log(`Found ${tsFiles.length} TypeScript files`);
  
  // Fix imports in each file
  tsFiles.forEach(fixImportsInFile);
  
  // Add axios dependency if needed
  addAxiosDependency(pluginDir);
  
  // Try to build the plugin
  console.log(`Building plugin: ${plugin}`);
  try {
    execSync('npm run build', { cwd: pluginDir, stdio: 'inherit' });
    console.log(`Successfully built plugin: ${plugin}`);
    return true;
  } catch (error) {
    console.error(`Error building plugin ${plugin}:`, error);
    return false;
  }
}

// Get the plugin to fix from command line arguments
const pluginToFix = process.argv[2];

if (pluginToFix) {
  // Fix a specific plugin
  console.log(`Starting to fix ${pluginToFix} plugin imports...`);
  const success = fixPlugin(pluginToFix);
  console.log(`Finished fixing ${pluginToFix} plugin imports. Success: ${success}`);
} else {
  // Fix all plugins in the list
  console.log('Starting to fix plugin imports...');
  
  const results = {};
  
  for (const plugin of plugins) {
    console.log(`\n--- Processing plugin: ${plugin} ---`);
    results[plugin] = fixPlugin(plugin);
  }
  
  console.log('\nResults:');
  for (const [plugin, success] of Object.entries(results)) {
    console.log(`${plugin}: ${success ? 'SUCCESS' : 'FAILED'}`);
  }
  
  console.log('\nFinished fixing plugin imports.');
}
