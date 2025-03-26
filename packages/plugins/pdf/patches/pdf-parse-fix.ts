/**
 * This patch fixes an issue with pdf-parse where it tries to access a test file
 * in debug mode, even when imported as a dependency in an ESM context.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Get the current directory in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Path to the pdf-parse module
const pdfParsePath = path.resolve(
  __dirname,
  '../../../node_modules/.pnpm/pdf-parse@1.1.1/node_modules/pdf-parse/index.js'
);

// Check if the file exists
if (fs.existsSync(pdfParsePath)) {
  console.log('📄 Patching pdf-parse module...');
  
  // Read the file
  let content = fs.readFileSync(pdfParsePath, 'utf8');
  
  // Replace the debug mode check with a more reliable one
  const originalCheck = 'let isDebugMode = !module.parent;';
  const newCheck = 'let isDebugMode = false; // Patched to prevent debug mode in production';
  
  // Apply the patch
  if (content.includes(originalCheck)) {
    content = content.replace(originalCheck, newCheck);
    
    // Write the patched file
    fs.writeFileSync(pdfParsePath, content, 'utf8');
    console.log('✅ Successfully patched pdf-parse module');
  } else {
    console.log('⚠️ Could not find the debug mode check in pdf-parse module');
  }
} else {
  console.log('⚠️ Could not find pdf-parse module at', pdfParsePath);
}

// Export a function to run the patch
export function applyPdfParsePatch() {
  console.log('PDF Parse patch applied');
}
