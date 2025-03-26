#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

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

// Function to install axios if needed
function installAxiosIfNeeded(pluginDir) {
  const packageJsonPath = path.join(pluginDir, 'package.json');
  
  if (fs.existsSync(packageJsonPath)) {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Check if axios is already a dependency
    if (!packageJson.dependencies || !packageJson.dependencies.axios) {
      console.log(`Installing axios in ${pluginDir}`);
      try {
        execSync('npm install axios', { cwd: pluginDir, stdio: 'inherit' });
      } catch (error) {
        console.error(`Error installing axios in ${pluginDir}:`, error);
      }
    }
  }
}

// Main function to fix the AI plugin
function fixAiPlugin() {
  const pluginDir = path.join(process.cwd(), 'packages', 'plugins', 'ai');
  
  if (!fs.existsSync(pluginDir)) {
    console.log(`Plugin directory not found: ${pluginDir}`);
    return;
  }
  
  console.log(`\nFixing plugin: ai`);
  
  // Find all TypeScript files in the plugin directory
  const tsFiles = findTsFiles(pluginDir);
  console.log(`Found ${tsFiles.length} TypeScript files`);
  
  // Fix imports in each file
  tsFiles.forEach(fixImportsInFile);
  
  // Install axios if needed
  installAxiosIfNeeded(pluginDir);
  
  // Try to build the plugin
  console.log(`Building plugin: ai`);
  try {
    execSync('npm run build', { cwd: pluginDir, stdio: 'inherit' });
    console.log(`Successfully built plugin: ai`);
  } catch (error) {
    console.error(`Error building plugin ai:`, error);
  }
}

// Run the fix
console.log('Starting to fix AI plugin imports...');
fixAiPlugin();
console.log('Finished fixing AI plugin imports.');
