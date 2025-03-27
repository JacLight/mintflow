#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Files to update
const filesToUpdate = [
  'packages/ui-web/src/components/workflow/nodes/action-node.tsx',
  'packages/ui-web/src/components/workflow/nodes/app-form.tsx',
  'packages/ui-web/src/components/workflow/nodes/app-view-node.tsx',
  'packages/ui-web/src/components/workflow/nodes/condition-node.tsx',
  'packages/ui-web/src/components/workflow/nodes/improved-node.tsx',
  'packages/ui-web/src/components/workflow/edges/base-edge.tsx'
];

// Update imports in each file
filesToUpdate.forEach(filePath => {
  try {
    // Read the file
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Replace the import statement
    const updatedContent = content.replace(
      /import\s+(.+?)\s+from\s+['"](.+?)\/mock-xyflow['"]/g,
      'import $1 from \'$2/mock-xyflow\''
    );
    
    // Write the updated content back to the file
    fs.writeFileSync(filePath, updatedContent, 'utf8');
    
    console.log(`Updated imports in ${filePath}`);
  } catch (error) {
    console.error(`Error updating ${filePath}:`, error);
  }
});

console.log('All imports updated successfully!');
