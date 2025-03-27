const fs = require('fs');
const path = require('path');

// Function to recursively find all TypeScript files in a directory
function findTsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findTsFiles(filePath, fileList);
    } else if (file.endsWith('.ts')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Function to fix imports in a file
function fixImportsInFile(filePath) {
  console.log(`Processing ${filePath}`);
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Fix method name mismatches in EvaluationPlugin.ts
  if (filePath.includes('EvaluationPlugin.ts')) {
    if (content.includes('evaluateRetrievalSystem')) {
      content = content.replace(/evaluateRetrievalSystem/g, 'evaluateRetrieval');
      modified = true;
    }
    if (content.includes('evaluateGenerationSystem')) {
      content = content.replace(/evaluateGenerationSystem/g, 'evaluateGeneration');
      modified = true;
    }
    if (content.includes('evaluateAgentSystem')) {
      content = content.replace(/evaluateAgentSystem/g, 'evaluateAgent');
      modified = true;
    }
  }
  
  // Fix export conflicts in MultiModalPlugin.ts
  if (filePath.includes('MultiModalPlugin.ts') && content.includes('export type { ImageLoadOptions, AudioLoadOptions, MultiModalOptions };')) {
    content = content.replace('export type { ImageLoadOptions, AudioLoadOptions, MultiModalOptions };', '// Types are already exported above');
    modified = true;
  }
  
  // Fix missing argument in JSONParser.ts
  if (filePath.includes('JSONParser.ts') && content.includes('this.schema.describe()')) {
    content = content.replace('this.schema.describe()', 'this.schema.describe("JSON Schema")');
    modified = true;
  }
  
  // Fix StoredPromptTemplate in ABTestingFramework.ts
  if (filePath.includes('ABTestingFramework.ts')) {
    if (content.includes('import { PromptTemplateRegistry, StoredPromptTemplate }')) {
      content = content.replace('import { PromptTemplateRegistry, StoredPromptTemplate }', 'import { PromptTemplateRegistry }');
      modified = true;
    }
    if (content.includes('StoredPromptTemplate')) {
      content = content.replace(/StoredPromptTemplate/g, 'PromptTemplate');
      modified = true;
    }
  }
  
  // Fix missing imports from @langchain/community
  if (content.includes('@langchain/community/document_loaders')) {
    // Add a comment to indicate that the module is not available
    content = content.replace(
      /import\s*\{\s*([^}]+)\s*\}\s*from\s*["']@langchain\/community\/document_loaders[^"']*["'];?/g,
      '// TODO: Install @langchain/community package\n// import { $1 } from "@langchain/community/document_loaders";'
    );
    modified = true;
  }
  
  // Fix PineconeFactory.ts
  if (filePath.includes('PineconeFactory.ts') && content.includes('pineconeIndex: index')) {
    content = content.replace(
      'pineconeIndex: index',
      'pineconeIndex: index as any // TODO: Fix type mismatch'
    );
    modified = true;
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed ${filePath}`);
  }
}

// Main function
function main() {
  const langchainDir = path.join(__dirname, 'packages', 'plugins', 'langchain');
  const tsFiles = findTsFiles(path.join(langchainDir, 'src'));
  
  tsFiles.forEach(fixImportsInFile);
  
  console.log('Done fixing langchain plugin files');
}

main();
