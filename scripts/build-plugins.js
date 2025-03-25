#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// List of plugins to build
const pluginsToBuild = [
  'activecampaign',
  'ai',
  'assemblyai',
  'figma',
  'instagram',
  'facebook',
  'jira-cloud',
  'jotform',
  'mailchimp',
  'microsoft-office',
  'monday',
  'paypal',
  'pinterest',
  'pipedrive',
  'salesforce',
  'sendgrid',
  'snapchat',
  'soap',
  'speech',
  'stripe',
  'teams',
  'text-parser',
  'tiktok',
  'youtube',
  'zoom',
  'woocommerce',
  'wordpress'
];

// Build each plugin
async function buildPlugins() {
  for (const plugin of pluginsToBuild) {
    const pluginDir = path.join(__dirname, '..', 'packages', 'plugins', plugin);
    
    // Check if plugin directory exists
    if (!fs.existsSync(pluginDir)) {
      console.log(`Plugin directory not found: ${pluginDir}`);
      continue;
    }
    
    // Create dist directory if it doesn't exist
    const distDir = path.join(pluginDir, 'dist');
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir, { recursive: true });
    }
    
    console.log(`Building plugin: ${plugin}`);
    
    // Run tsc with specific options
    const command = 'npx tsc --outDir ./dist --rootDir ./src --module NodeNext --moduleResolution NodeNext --target ESNext --esModuleInterop true';
    
    try {
      await new Promise((resolve, reject) => {
        exec(command, { cwd: pluginDir }, (error, stdout, stderr) => {
          if (error) {
            console.error(`Error building ${plugin}: ${error.message}`);
            if (stderr) {
              console.error(`stderr for ${plugin}:\n${stderr}`);
            }
            // Continue with next plugin even if this one fails
            resolve();
            return;
          }
          
          if (stdout) {
            console.log(stdout);
          }
          
          // Check if files were generated
          fs.readdir(distDir, (err, files) => {
            if (err) {
              console.error(`Error reading dist directory for ${plugin}: ${err.message}`);
            } else {
              console.log(`Files in ${plugin}/dist directory: ${files.length > 0 ? files.join(', ') : 'No files found'}`);
            }
            resolve();
          });
        });
      });
    } catch (err) {
      console.error(`Failed to build ${plugin}: ${err.message}`);
    }
  }
}

buildPlugins().then(() => {
  console.log('Build process completed');
}).catch(err => {
  console.error('Build process failed:', err);
});
