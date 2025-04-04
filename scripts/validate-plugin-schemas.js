#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { logger } = require('../packages/node_runner/src/logger');

// Configuration
const CONFIG = {
  OUTPUT_DIR: path.join(__dirname, '../schema-validation'),
  PLUGINS_DIR: path.join(__dirname, '../packages/plugins'),
  TEST_DATA_DIR: path.join(__dirname, '../test-data'),
  SKIP_PLUGINS: ['mcp-client', 'mcp-server'] // Plugins to skip (add more as needed)
};

// Main function
async function validatePluginSchemas() {
  logger.info('Starting plugin schema validation...');
  
  // Create output directory if it doesn't exist
  if (!fs.existsSync(CONFIG.OUTPUT_DIR)) {
    fs.mkdirSync(CONFIG.OUTPUT_DIR, { recursive: true });
  }
  
  // Get all plugins
  const plugins = getPlugins();
  logger.info(`Found ${plugins.length} plugins to validate`);
  
  // Validate each plugin
  const validationResults = {};
  
  for (const pluginId of plugins) {
    logger.info(`Validating plugin: ${pluginId}`);
    try {
      const pluginSchema = await extractPluginSchema(pluginId);
      const testData = loadTestData(pluginId);
      
      validationResults[pluginId] = validatePluginSchema(pluginId, pluginSchema, testData);
    } catch (error) {
      logger.error(`Error validating plugin ${pluginId}:`, { error: error.message });
      validationResults[pluginId] = {
        error: error.message
      };
    }
  }
  
  // Generate report
  generateReport(validationResults);
  
  logger.info('Schema validation complete!');
  return validationResults;
}

// Get all plugins
function getPlugins() {
  return fs.readdirSync(CONFIG.PLUGINS_DIR)
    .filter(dir => fs.statSync(path.join(CONFIG.PLUGINS_DIR, dir)).isDirectory())
    .filter(dir => !dir.startsWith('.') && dir !== 'node_modules')
    .filter(dir => !CONFIG.SKIP_PLUGINS.includes(dir));
}

// Extract schema from a plugin
async function extractPluginSchema(pluginId) {
  const pluginDir = path.join(CONFIG.PLUGINS_DIR, pluginId);
  const actionsDir = path.join(pluginDir, 'src', 'actions');
  
  // Check if actions directory exists
  if (!fs.existsSync(actionsDir)) {
    throw new Error(`Actions directory not found for plugin ${pluginId}`);
  }
  
  // Get all action files
  const actionFiles = fs.readdirSync(actionsDir)
    .filter(file => file.endsWith('.ts') || file.endsWith('.js'))
    .map(file => path.join(actionsDir, file));
  
  if (actionFiles.length === 0) {
    throw new Error(`No action files found for plugin ${pluginId}`);
  }
  
  // Extract schema from each action file
  const actions = {};
  
  for (const actionFile of actionFiles) {
    try {
      const actionCode = fs.readFileSync(actionFile, 'utf8');
      const actionName = extractActionName(actionCode);
      
      if (actionName) {
        actions[actionName] = {
          file: path.basename(actionFile),
          inputSchema: extractInputSchema(actionCode),
          outputSchema: extractOutputSchema(actionCode),
          executeFunction: extractExecuteFunction(actionCode)
        };
      }
    } catch (error) {
      logger.error(`Error processing action file ${actionFile}:`, { error: error.message });
    }
  }
  
  return {
    id: pluginId,
    actions
  };
}

// Extract action name from code
function extractActionName(code) {
  const nameMatch = code.match(/name:\s*['"]([^'"]+)['"]/);
  return nameMatch ? nameMatch[1] : null;
}

// Convert camelCase to snake_case
function camelToSnakeCase(str) {
  return str.replace(/([A-Z])/g, '_$1').toLowerCase();
}

// Convert snake_case to camelCase
function snakeToCamelCase(str) {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
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
    
    // Use a more robust regex to match property definitions
    // This handles nested objects and arrays better
    const propertyRegex = /(\w+):\s*{([^{}]*(?:{[^{}]*(?:{[^{}]*}[^{}]*)*}[^{}]*)*)}/gs;
    const propertyMatches = propertiesCode.matchAll(propertyRegex);
    
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
    
    // Use a more robust regex to match property definitions
    // This handles nested objects and arrays better
    const propertyRegex = /(\w+):\s*{([^{}]*(?:{[^{}]*(?:{[^{}]*}[^{}]*)*}[^{}]*)*)}/gs;
    const propertyMatches = propertiesCode.matchAll(propertyRegex);
    
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
    logger.error(`Error loading test data for ${pluginId}:`, { error: error.message });
    return null;
  }
}

// Validate plugin schema against test data
function validatePluginSchema(pluginId, pluginSchema, testData) {
  const result = {
    pluginId,
    actions: {}
  };
  
  if (!testData) {
    result.warning = 'No test data found for this plugin';
    return result;
  }
  
  // Validate each action
  for (const [actionName, actionSchema] of Object.entries(pluginSchema.actions)) {
    const actionResult = {
      name: actionName,
      file: actionSchema.file,
      issues: []
    };
    
    // Try different naming conventions for test data lookup
    const snakeCaseActionName = camelToSnakeCase(actionName);
    const camelCaseActionName = snakeToCamelCase(actionName);
    
    // Look for test data using different naming conventions
    let actionTestData = null;
    
    // First try the exact action name
    if (testData.actions?.[actionName]?.input) {
      actionTestData = testData.actions[actionName].input;
    } 
    // Then try snake_case version
    else if (testData.actions?.[snakeCaseActionName]?.input) {
      actionTestData = testData.actions[snakeCaseActionName].input;
    }
    // Then try camelCase version
    else if (actionName !== camelCaseActionName && testData.actions?.[camelCaseActionName]?.input) {
      actionTestData = testData.actions[camelCaseActionName].input;
    }
    
    if (!actionTestData) {
      actionResult.issues.push({
        type: 'missing_test_data',
        message: `No test data found for action ${actionName}`
      });
    } else {
      // Extract execute function parameters
      const executeParams = actionSchema.executeFunction?.parameters || [];
      const paramNames = executeParams.map(p => p.name);
      
      // Check if all required fields are present in test data
      if (actionSchema.inputSchema?.required) {
        for (const requiredField of actionSchema.inputSchema.required) {
          // Check if the required field is in the test data
          // or if there's a parameter with the same name in the execute function
          if (!(requiredField in actionTestData) && !paramNames.includes(requiredField)) {
            actionResult.issues.push({
              type: 'missing_required_field',
              message: `Required field '${requiredField}' is missing in test data`
            });
          }
        }
      }
      
      // Check if all fields in test data are defined in schema
      for (const field in actionTestData) {
        if (!actionSchema.inputSchema?.properties?.[field]) {
          // Check if there's a parameter with the same name in the execute function
          const matchingParam = executeParams.find(p => p.name === field);
          if (!matchingParam) {
            actionResult.issues.push({
              type: 'undefined_field',
              message: `Field '${field}' in test data is not defined in schema`
            });
          }
        }
      }
      
      // Check if execute function parameters match schema
      for (const param of executeParams) {
        if (!actionSchema.inputSchema?.properties?.[param.name]) {
          actionResult.issues.push({
            type: 'parameter_not_in_schema',
            message: `Parameter '${param.name}' in execute function is not defined in schema`
          });
        }
      }
    }
    
    result.actions[actionName] = actionResult;
  }
  
  return result;
}

// Generate validation report
function generateReport(validationResults) {
  // Create summary
  const summary = {
    totalPlugins: Object.keys(validationResults).length,
    pluginsWithIssues: 0,
    totalIssues: 0,
    issuesByType: {}
  };
  
  // Count issues
  for (const [pluginId, result] of Object.entries(validationResults)) {
    if (result.error) {
      summary.pluginsWithIssues++;
      summary.totalIssues++;
      summary.issuesByType.error = (summary.issuesByType.error || 0) + 1;
      continue;
    }
    
    let pluginHasIssues = false;
    
    for (const [actionName, actionResult] of Object.entries(result.actions || {})) {
      if (actionResult.issues && actionResult.issues.length > 0) {
        pluginHasIssues = true;
        summary.totalIssues += actionResult.issues.length;
        
        for (const issue of actionResult.issues) {
          summary.issuesByType[issue.type] = (summary.issuesByType[issue.type] || 0) + 1;
        }
      }
    }
    
    if (pluginHasIssues) {
      summary.pluginsWithIssues++;
    }
  }
  
  // Write summary to file
  fs.writeFileSync(
    path.join(CONFIG.OUTPUT_DIR, 'summary.json'),
    JSON.stringify(summary, null, 2)
  );
  
  // Write detailed results to file
  fs.writeFileSync(
    path.join(CONFIG.OUTPUT_DIR, 'validation-results.json'),
    JSON.stringify(validationResults, null, 2)
  );
  
  // Generate HTML report
  const htmlReport = generateHtmlReport(summary, validationResults);
  fs.writeFileSync(
    path.join(CONFIG.OUTPUT_DIR, 'report.html'),
    htmlReport
  );
  
  logger.info(`Report generated in ${CONFIG.OUTPUT_DIR}`);
  logger.info(`Summary: ${summary.pluginsWithIssues} plugins with issues, ${summary.totalIssues} total issues`);
}

// Generate HTML report
function generateHtmlReport(summary, validationResults) {
  // Create navigation links for each plugin
  const navigationLinks = Object.entries(validationResults)
    .map(([pluginId, result]) => {
      let status = "no-issues";
      let statusText = "OK";
      
      if (result.error) {
        status = "error";
        statusText = "ERROR";
      } else if (result.warning) {
        status = "warning";
        statusText = "WARNING";
      } else {
        const actions = result.actions || {};
        const hasIssues = Object.values(actions).some(action => action.issues && action.issues.length > 0);
        if (hasIssues) {
          status = "issue";
          statusText = "ISSUES";
        }
      }
      
      return `<li><a href="#plugin-${pluginId}">${pluginId} - <span class="${status}">${statusText}</span></a></li>`;
    })
    .join('');
  
  let html = `
<!DOCTYPE html>
<html>
<head>
  <title>Plugin Schema Validation Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1, h2, h3 { color: #333; }
    .summary { background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
    .plugin { margin-bottom: 30px; border: 1px solid #ddd; padding: 15px; border-radius: 5px; }
    .plugin-header { display: flex; justify-content: space-between; align-items: center; }
    .action { margin: 10px 0; padding: 10px; background-color: #f9f9f9; border-radius: 3px; }
    .issues { margin-left: 20px; }
    .issue { color: #d9534f; }
    .warning { color: #f0ad4e; }
    .no-issues { color: #5cb85c; }
    .error { color: #d9534f; font-weight: bold; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f2f2f2; }
    .navigation {
      background-color: #f9f9f9;
      padding: 15px;
      border-radius: 5px;
      margin-bottom: 20px;
      max-height: 300px;
      overflow-y: auto;
    }
    .navigation ul {
      list-style-type: none;
      padding: 0;
      margin: 0;
      columns: 3;
    }
    .navigation li {
      margin-bottom: 5px;
    }
    .navigation a {
      text-decoration: none;
      color: #333;
    }
    .navigation a:hover {
      text-decoration: underline;
    }
    @media (max-width: 768px) {
      .navigation ul {
        columns: 1;
      }
    }
  </style>
</head>
<body>
  <h1>Plugin Schema Validation Report</h1>
  
  <div class="summary">
    <h2>Summary</h2>
    <p>Total Plugins: ${summary.totalPlugins}</p>
    <p>Plugins with Issues: ${summary.pluginsWithIssues}</p>
    <p>Total Issues: ${summary.totalIssues}</p>
    
    <h3>Issues by Type</h3>
    <table>
      <tr>
        <th>Issue Type</th>
        <th>Count</th>
      </tr>
      ${Object.entries(summary.issuesByType).map(([type, count]) => `
        <tr>
          <td>${type}</td>
          <td>${count}</td>
        </tr>
      `).join('')}
    </table>
  </div>
  
  <div class="navigation">
    <h2>Plugin Navigation</h2>
    <ul>
      ${navigationLinks}
    </ul>
  </div>
  
  <h2>Plugin Details</h2>
  
  ${Object.entries(validationResults).map(([pluginId, result]) => {
    if (result.error) {
      return `
        <div id="plugin-${pluginId}" class="plugin">
          <div class="plugin-header">
            <h3>${pluginId} - <span class="error">ERROR</span></h3>
          </div>
          <p class="error">${result.error}</p>
        </div>
      `;
    }
    
    const actions = result.actions || {};
    const hasIssues = Object.values(actions).some(action => action.issues && action.issues.length > 0);
    
    return `
      <div id="plugin-${pluginId}" class="plugin">
        <div class="plugin-header">
          <h3>${pluginId} - ${result.warning ? 
            `<span class="warning">WARNING</span>` : 
            hasIssues ? `<span class="issue">ISSUES</span>` : 
            `<span class="no-issues">OK</span>`}
          </h3>
        </div>
        
        ${result.warning ? `<p class="warning">${result.warning}</p>` : ''}
        
        ${Object.entries(actions).map(([actionName, actionResult]) => {
          const hasActionIssues = actionResult.issues && actionResult.issues.length > 0;
          const actionId = `${pluginId}-${actionName}`.replace(/[^a-zA-Z0-9-]/g, '-');
          
          return `
            <div id="action-${actionId}" class="action">
              <div class="action-header">
                <h4>${actionName} (${actionResult.file}) - ${hasActionIssues ? 
                  `<span class="issue">${actionResult.issues.length} Issues</span>` : 
                  `<span class="no-issues">No Issues</span>`}
                </h4>
              </div>
              
              ${hasActionIssues ? `
                <div class="issues">
                  <ul>
                    ${actionResult.issues.map(issue => `
                      <li class="issue">${issue.message}</li>
                    `).join('')}
                  </ul>
                </div>
              ` : ''}
            </div>
          `;
        }).join('')}
      </div>
    `;
  }).join('')}
</body>
</html>
  `;
  
  return html;
}

// Run the validation if called directly
if (require.main === module) {
  validatePluginSchemas().catch(error => {
    logger.error('Error validating plugin schemas:', { error: error.message });
    process.exit(1);
  });
}

module.exports = {
  validatePluginSchemas
};
