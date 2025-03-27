#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Files to update
const filesToUpdate = [
  'packages/ui-web/src/components/workflow/nodes/action-node.tsx',
  'packages/ui-web/src/components/workflow/nodes/app-form.tsx',
  'packages/ui-web/src/components/workflow/nodes/app-view-node.tsx',
  'packages/ui-web/src/components/workflow/nodes/improved-node.tsx'
];

// Update imports in each file
filesToUpdate.forEach(filePath => {
  try {
    // Read the file
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Replace the import statement
    const updatedContent = content.replace(
      /import\s+\{([^}]*?)Handle([^}]*?)\}\s+from\s+['"](.+?)\/mock-xyflow['"]/g,
      (match, before, after, path) => {
        // Extract the other imports
        const otherImports = (before + after).replace(/,\s*,/g, ',').trim();
        
        // Create the new import statements
        let result = '';
        
        // Add the mock-xyflow import if there are other imports
        if (otherImports) {
          result += `import { ${otherImports} } from '${path}/mock-xyflow';\n`;
        }
        
        // Add the Handle import
        result += `import { Handle } from '${path}/handle';`;
        
        return result;
      }
    );
    
    // Write the updated content back to the file
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    
    console.log(`Updated imports in ${filePath}`);
  } catch (error) {
    console.error(`Error updating ${filePath}:`, error);
  }
});

console.log('All imports updated successfully!');
