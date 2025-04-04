#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuration
const CONFIG = {
  OUTPUT_DIR: path.join(__dirname, '../plugin-reports'),
  PLUGINS_DIR: path.join(__dirname, '../packages/plugins'),
  TEST_DATA_DIR: path.join(__dirname, '../test-data'),
  SKIP_PLUGINS: ['mcp-client', 'mcp-server'] // Plugins to skip (add more as needed)
};

// Main function
async function generatePluginReport() {
  console.log('Generating plugin report...');
  
  // Create output directory if it doesn't exist
  if (!fs.existsSync(CONFIG.OUTPUT_DIR)) {
    fs.mkdirSync(CONFIG.OUTPUT_DIR, { recursive: true });
  }
  
  // Get all plugins
  const plugins = getPlugins();
  console.log(`Found ${plugins.length} plugins`);
  
  // Generate report for each plugin
  const report = {};
  
  for (const pluginId of plugins) {
    console.log(`Processing plugin: ${pluginId}`);
    try {
      const pluginReport = await processPlugin(pluginId);
      report[pluginId] = pluginReport;
    } catch (error) {
      console.error(`Error processing plugin ${pluginId}:`, error.message);
      report[pluginId] = {
        error: error.message
      };
    }
  }
  
  // Write report to file
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  fs.writeFileSync(
    path.join(CONFIG.OUTPUT_DIR, `plugin-report-${timestamp}.json`),
    JSON.stringify(report, null, 2)
  );
  
  // Generate HTML report
  const htmlReport = generateHtmlReport(report);
  fs.writeFileSync(
    path.join(CONFIG.OUTPUT_DIR, `plugin-report-${timestamp}.html`),
    htmlReport
  );
  
  console.log(`Report generated in ${CONFIG.OUTPUT_DIR}`);
  return report;
}

// Get all plugins
function getPlugins() {
  return fs.readdirSync(CONFIG.PLUGINS_DIR)
    .filter(dir => fs.statSync(path.join(CONFIG.PLUGINS_DIR, dir)).isDirectory())
    .filter(dir => !dir.startsWith('.') && dir !== 'node_modules')
    .filter(dir => !CONFIG.SKIP_PLUGINS.includes(dir));
}

// Process a plugin
async function processPlugin(pluginId) {
  const pluginDir = path.join(CONFIG.PLUGINS_DIR, pluginId);
  const indexFile = path.join(pluginDir, 'src', 'index.ts');
  
  if (!fs.existsSync(indexFile)) {
    throw new Error(`Index file not found for plugin ${pluginId}`);
  }
  
  const pluginCode = fs.readFileSync(indexFile, 'utf8');
  const actions = extractActionsFromCode(pluginCode);
  
  if (actions.length === 0) {
    throw new Error(`No actions found for plugin ${pluginId}`);
  }
  
  const actionsDir = path.join(pluginDir, 'src', 'actions');
  const actionFiles = fs.existsSync(actionsDir) 
    ? fs.readdirSync(actionsDir)
        .filter(file => file.endsWith('.ts') || file.endsWith('.js'))
        .map(file => path.join(actionsDir, file))
    : [];
  
  const actionDetails = {};
  
  // Process action files
  for (const actionFile of actionFiles) {
    try {
      const actionCode = fs.readFileSync(actionFile, 'utf8');
      const actionName = extractActionName(actionCode);
      
      if (actionName) {
        actionDetails[actionName] = {
          file: path.basename(actionFile),
          inputSchema: extractInputSchema(actionCode),
          outputSchema: extractOutputSchema(actionCode),
          executeFunction: extractExecuteFunction(actionCode)
        };
      }
    } catch (error) {
      console.error(`Error processing action file ${actionFile}:`, error.message);
    }
  }
  
  // Load test data
  const testData = loadTestData(pluginId);
  
  return {
    id: pluginId,
    actions: actionDetails,
    testData
  };
}

// Extract actions from plugin code
function extractActionsFromCode(code) {
  // Try to match actions as an object with named properties
  const objectActionRegex = /actions\s*:\s*{([^}]*)}/gs;
  const objectActionsMatch = objectActionRegex.exec(code);
  
  if (objectActionsMatch) {
    const actionsBlock = objectActionsMatch[1];
    const actionNameRegex = /['"]([^'"]+)['"]\s*:/g;
    const actions = [];
    let match;
    
    while ((match = actionNameRegex.exec(actionsBlock)) !== null) {
      actions.push(match[1]);
    }
    
    return actions;
  }
  
  // Try to match actions as an array
  const arrayActionRegex = /actions\s*:\s*\[(.*?)\]/gs;
  const arrayActionsMatch = arrayActionRegex.exec(code);
  
  if (arrayActionsMatch) {
    const actionsBlock = arrayActionsMatch[1];
    
    // Try to extract action names from imports or variable references
    const importRegex = /import\s*{\s*([^}]*)\s*}\s*from/g;
    const imports = [];
    let importMatch;
    
    while ((importMatch = importRegex.exec(code)) !== null) {
      const importNames = importMatch[1].split(',').map(name => name.trim());
      imports.push(...importNames);
    }
    
    // Look for these imports in the actions array
    const actionNames = [];
    for (const importName of imports) {
      if (actionsBlock.includes(importName)) {
        // Try to find the actual action name from the import
        const actionNameRegex = new RegExp(`${importName}\\s*:\\s*['"]([^'"]+)['"]`, 'g');
        const actionNameMatch = actionNameRegex.exec(code);
        
        if (actionNameMatch) {
          actionNames.push(actionNameMatch[1]);
        } else {
          // If we can't find the actual name, use the import name
          actionNames.push(importName);
        }
      }
    }
    
    // If we couldn't extract action names, check the action files directly
    if (actionNames.length === 0) {
      // Try to extract action file paths
      const actionFileRegex = /from\s+['"]\.\/actions\/([^'"]+)['"]/g;
      const actionFiles = [];
      let actionFileMatch;
      
      while ((actionFileMatch = actionFileRegex.exec(code)) !== null) {
        const actionFile = actionFileMatch[1].replace('.js', '');
        actionNames.push(actionFile.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase()));
      }
    }
    
    return actionNames;
  }
  
  return [];
}

// Extract action name from code
function extractActionName(code) {
  const nameMatch = code.match(/name:\s*['"]([^'"]+)['"]/);
  return nameMatch ? nameMatch[1] : null;
}

// Extract input schema from code
function extractInputSchema(code) {
  const schemaStart = code.indexOf('inputSchema:');
  if (schemaStart === -1) return null;
  
  let braceCount = 0;
  let schemaEnd = schemaStart;
  let inSchema = false;
  
  for (let i = schemaStart; i < code.length; i++) {
    if (code[i] === '{') {
      braceCount++;
      inSchema = true;
    } else if (code[i] === '}') {
      braceCount--;
      if (inSchema && braceCount === 0) {
        schemaEnd = i + 1;
        break;
      }
    }
  }
  
  const schemaCode = code.substring(schemaStart, schemaEnd);
  
  // Extract required fields
  const requiredMatch = schemaCode.match(/required:\s*\[([^\]]+)\]/);
  const required = requiredMatch 
    ? requiredMatch[1].split(',').map(field => field.trim().replace(/['"]/g, ''))
    : [];
  
  // Extract properties
  const properties = {};
  const propertiesMatch = schemaCode.match(/properties:\s*{([^}]+)}/s);
  
  if (propertiesMatch) {
    const propertiesCode = propertiesMatch[1];
    const propertyMatches = propertiesCode.matchAll(/(\w+):\s*{([^}]+)}/gs);
    
    for (const match of propertyMatches) {
      const propertyName = match[1];
      const propertyCode = match[2];
      
      const typeMatch = propertyCode.match(/type:\s*['"]([^'"]+)['"]/);
      const titleMatch = propertyCode.match(/title:\s*['"]([^'"]+)['"]/);
      const descriptionMatch = propertyCode.match(/description:\s*['"]([^'"]+)['"]/);
      const defaultMatch = propertyCode.match(/default:\s*([^,\n\r]+)/);
      
      properties[propertyName] = {
        type: typeMatch ? typeMatch[1] : 'unknown',
        title: titleMatch ? titleMatch[1] : propertyName,
        description: descriptionMatch ? descriptionMatch[1] : '',
        default: defaultMatch ? defaultMatch[1].trim() : undefined
      };
    }
  }
  
  return {
    required,
    properties
  };
}

// Extract output schema from code
function extractOutputSchema(code) {
  const schemaStart = code.indexOf('outputSchema:');
  if (schemaStart === -1) return null;
  
  let braceCount = 0;
  let schemaEnd = schemaStart;
  let inSchema = false;
  
  for (let i = schemaStart; i < code.length; i++) {
    if (code[i] === '{') {
      braceCount++;
      inSchema = true;
    } else if (code[i] === '}') {
      braceCount--;
      if (inSchema && braceCount === 0) {
        schemaEnd = i + 1;
        break;
      }
    }
  }
  
  const schemaCode = code.substring(schemaStart, schemaEnd);
  
  // Extract properties
  const properties = {};
  const propertiesMatch = schemaCode.match(/properties:\s*{([^}]+)}/s);
  
  if (propertiesMatch) {
    const propertiesCode = propertiesMatch[1];
    const propertyMatches = propertiesCode.matchAll(/(\w+):\s*{([^}]+)}/gs);
    
    for (const match of propertyMatches) {
      const propertyName = match[1];
      const propertyCode = match[2];
      
      const typeMatch = propertyCode.match(/type:\s*['"]([^'"]+)['"]/);
      const titleMatch = propertyCode.match(/title:\s*['"]([^'"]+)['"]/);
      const descriptionMatch = propertyCode.match(/description:\s*['"]([^'"]+)['"]/);
      
      properties[propertyName] = {
        type: typeMatch ? typeMatch[1] : 'unknown',
        title: titleMatch ? titleMatch[1] : propertyName,
        description: descriptionMatch ? descriptionMatch[1] : ''
      };
    }
  }
  
  return {
    properties
  };
}

// Extract execute function from code
function extractExecuteFunction(code) {
  const executeStart = code.indexOf('execute:');
  if (executeStart === -1) return null;
  
  // Find the parameter destructuring
  const paramMatch = code.match(/\{\s*([^}]+)\s*\}\s*=\s*input\.data/);
  const parameters = paramMatch 
    ? paramMatch[1].split(',').map(param => {
        const parts = param.trim().split('=');
        return {
          name: parts[0].trim(),
          default: parts.length > 1 ? parts[1].trim() : undefined
        };
      })
    : [];
  
  return {
    parameters
  };
}

// Load test data for a plugin
function loadTestData(pluginId) {
  const testDataFile = path.join(CONFIG.TEST_DATA_DIR, `${pluginId}.json`);
  
  if (!fs.existsSync(testDataFile)) {
    return null;
  }
  
  try {
    return JSON.parse(fs.readFileSync(testDataFile, 'utf8'));
  } catch (error) {
    console.error(`Error loading test data for ${pluginId}:`, error.message);
    return null;
  }
}

// Generate HTML report
function generateHtmlReport(report) {
  let html = `
<!DOCTYPE html>
<html>
<head>
  <title>Plugin Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1, h2, h3, h4 { color: #333; }
    .plugin { margin-bottom: 30px; border: 1px solid #ddd; padding: 15px; border-radius: 5px; }
    .plugin-header { display: flex; justify-content: space-between; align-items: center; }
    .action { margin: 10px 0; padding: 10px; background-color: #f9f9f9; border-radius: 3px; }
    .schema { margin-left: 20px; }
    .error { color: #d9534f; font-weight: bold; }
    table { border-collapse: collapse; width: 100%; margin-bottom: 10px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f2f2f2; }
    .no-data { color: #999; font-style: italic; }
  </style>
</head>
<body>
  <h1>Plugin Report</h1>
  
  <h2>Plugins</h2>
  
  ${Object.entries(report).map(([pluginId, pluginReport]) => {
    if (pluginReport.error) {
      return `
        <div class="plugin">
          <div class="plugin-header">
            <h3>${pluginId}</h3>
            <span class="error">Error</span>
          </div>
          <p class="error">${pluginReport.error}</p>
        </div>
      `;
    }
    
    const actions = pluginReport.actions || {};
    
    return `
      <div class="plugin">
        <div class="plugin-header">
          <h3>${pluginId}</h3>
        </div>
        
        <h4>Actions</h4>
        ${Object.keys(actions).length === 0 
          ? '<p class="no-data">No actions found</p>' 
          : Object.entries(actions).map(([actionName, actionDetails]) => {
              return `
                <div class="action">
                  <h4>${actionName} (${actionDetails.file})</h4>
                  
                  <h5>Input Schema</h5>
                  ${!actionDetails.inputSchema 
                    ? '<p class="no-data">No input schema found</p>' 
                    : `
                      <div class="schema">
                        <h6>Required Fields</h6>
                        ${actionDetails.inputSchema.required.length === 0 
                          ? '<p class="no-data">No required fields</p>' 
                          : `
                            <ul>
                              ${actionDetails.inputSchema.required.map(field => `<li>${field}</li>`).join('')}
                            </ul>
                          `
                        }
                        
                        <h6>Properties</h6>
                        ${Object.keys(actionDetails.inputSchema.properties).length === 0 
                          ? '<p class="no-data">No properties found</p>' 
                          : `
                            <table>
                              <tr>
                                <th>Name</th>
                                <th>Type</th>
                                <th>Title</th>
                                <th>Description</th>
                                <th>Default</th>
                              </tr>
                              ${Object.entries(actionDetails.inputSchema.properties).map(([propName, propDetails]) => `
                                <tr>
                                  <td>${propName}</td>
                                  <td>${propDetails.type}</td>
                                  <td>${propDetails.title}</td>
                                  <td>${propDetails.description}</td>
                                  <td>${propDetails.default !== undefined ? propDetails.default : ''}</td>
                                </tr>
                              `).join('')}
                            </table>
                          `
                        }
                      </div>
                    `
                  }
                  
                  <h5>Output Schema</h5>
                  ${!actionDetails.outputSchema 
                    ? '<p class="no-data">No output schema found</p>' 
                    : `
                      <div class="schema">
                        <h6>Properties</h6>
                        ${Object.keys(actionDetails.outputSchema.properties).length === 0 
                          ? '<p class="no-data">No properties found</p>' 
                          : `
                            <table>
                              <tr>
                                <th>Name</th>
                                <th>Type</th>
                                <th>Title</th>
                                <th>Description</th>
                              </tr>
                              ${Object.entries(actionDetails.outputSchema.properties).map(([propName, propDetails]) => `
                                <tr>
                                  <td>${propName}</td>
                                  <td>${propDetails.type}</td>
                                  <td>${propDetails.title}</td>
                                  <td>${propDetails.description}</td>
                                </tr>
                              `).join('')}
                            </table>
                          `
                        }
                      </div>
                    `
                  }
                  
                  <h5>Execute Function Parameters</h5>
                  ${!actionDetails.executeFunction 
                    ? '<p class="no-data">No execute function found</p>' 
                    : `
                      <div class="schema">
                        ${actionDetails.executeFunction.parameters.length === 0 
                          ? '<p class="no-data">No parameters found</p>' 
                          : `
                            <table>
                              <tr>
                                <th>Name</th>
                                <th>Default</th>
                              </tr>
                              ${actionDetails.executeFunction.parameters.map(param => `
                                <tr>
                                  <td>${param.name}</td>
                                  <td>${param.default !== undefined ? param.default : ''}</td>
                                </tr>
                              `).join('')}
                            </table>
                          `
                        }
                      </div>
                    `
                  }
                  
                  <h5>Test Data</h5>
                  ${!pluginReport.testData || !pluginReport.testData.actions || !pluginReport.testData.actions[actionName] 
                    ? '<p class="no-data">No test data found</p>' 
                    : `
                      <div class="schema">
                        <pre>${JSON.stringify(pluginReport.testData.actions[actionName], null, 2)}</pre>
                      </div>
                    `
                  }
                </div>
              `;
            }).join('')
        }
      </div>
    `;
  }).join('')}
</body>
</html>
  `;
  
  return html;
}

// Run the report generation if called directly
if (require.main === module) {
  generatePluginReport().catch(error => {
    console.error('Error generating plugin report:', error);
    process.exit(1);
  });
}

module.exports = {
  generatePluginReport
};
