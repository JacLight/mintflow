#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create dist directory if it doesn't exist
const distDir = path.join(__dirname, 'dist');
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

// Run tsc with specific options
const command = 'npx tsc --outDir ./dist --rootDir ./src --module NodeNext --moduleResolution NodeNext --target ESNext --esModuleInterop true';
console.log(`Running command: ${command}`);

exec(command, { cwd: __dirname }, (error, stdout, stderr) => {
  if (error) {
    console.error(`Error: ${error.message}`);
    return;
  }
  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }
  console.log(`stdout: ${stdout}`);
  
  // Check if files were generated
  fs.readdir(distDir, (err, files) => {
    if (err) {
      console.error(`Error reading dist directory: ${err.message}`);
      return;
    }
    console.log(`Files in dist directory: ${files.length > 0 ? files.join(', ') : 'No files found'}`);
  });
});
