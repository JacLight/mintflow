#!/usr/bin/env node

/**
 * This script tests plugins in real-world conditions by:
 * 1. Using the test data in the test-data directory
 * 2. Running each plugin with its test data
 * 3. Generating a comprehensive report of the results
 * 
 * Usage:
 * - Test all utility plugins: node scripts/test-plugins-real-world.js
 * - Test a specific plugin: node scripts/test-plugins-real-world.js --plugin=array
 * - Test a specific action: node scripts/test-plugins-real-world.js --plugin=array --action=filter
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { logger } = require('../packages/node_runner/src/logger');

// Parse command-line arguments
const args = process.argv.slice(2);
const pluginArg = args.find(arg => arg.startsWith('--plugin='))?.split('=')[1];
const actionArg = args.find(arg => arg.startsWith('--action='))?.split('=')[1];

// Configuration
const CONFIG = {
  OUTPUT_DIR: path.join(__dirname, '../plugin-test-reports'),
  PLUGINS_DIR: path.join(__dirname, '../packages/plugins'),
  TEST_DATA_DIR: path.join(__dirname, '../test-data'),
  CHAINS_DIR: path.join(__dirname, '../test-data/chains'),
  CREDENTIALS_FILE: path.join(__dirname, '../test-data/credentials.json'),
  SKIP_PLUGINS: ['mcp-client', 'mcp-server'], // Plugins to skip
  TEST_MODES: ['direct', 'node-runner'], // Test modes to run
  TIMEOUT: 30000, // Timeout for each test in ms
  PLUGIN: pluginArg, // Specific plugin to test (optional)
  ACTION: actionArg, // Specific action to test (optional)
  // List of utility plugins that don't require API keys
  UTILITY_PLUGINS: [
    'array',
    'crypto',
    'csv',
    'data-bridge',
    'delay',
    'exec',
    'file',
    'inject',
    'json',
    'modify',
    'pdf',
    'qrcode',
    'range',
    'start',
    'switch',
    'text-parser',
    'timer',
    'xml'
  ]
};

// Main function
async function testPluginsRealWorld() {
  logger.info('Starting real-world plugin testing...');
  
  // Create output directory if it doesn't exist
  if (!fs.existsSync(CONFIG.OUTPUT_DIR)) {
    fs.mkdirSync(CONFIG.OUTPUT_DIR, { recursive: true });
  }
  
  // Create chains directory if it doesn't exist
  if (!fs.existsSync(CONFIG.CHAINS_DIR)) {
    fs.mkdirSync(CONFIG.CHAINS_DIR, { recursive: true });
  }
  
  // Get all plugins
  const plugins = getPlugins();
  logger.info(`Found ${plugins.length} plugins to test`);
  
  // Load credentials
  const credentials = loadCredentials();
  
  // Test results
  const results = {
    timestamp: new Date().toISOString(),
    summary: {
      total: plugins.length,
      passed: 0,
      failed: 0,
      skipped: 0
    },
    plugins: {}
  };
  
  // Test each plugin
  for (const pluginId of plugins) {
    logger.info(`Testing plugin: ${pluginId}`);
    
    try {
      // Get plugin actions
      const actions = await getPluginActions(pluginId);
      
      if (!actions || actions.length === 0) {
        logger.warn(`No actions found for plugin ${pluginId}, skipping...`);
        results.summary.skipped++;
        results.plugins[pluginId] = {
          id: pluginId,
          status: 'skipped',
          reason: 'No actions found'
        };
        continue;
      }
      
      // Test plugin in each mode
      const modeResults = {};
      let pluginPassed = true;
      
      for (const mode of CONFIG.TEST_MODES) {
        logger.info(`Testing ${pluginId} in ${mode} mode...`);
        
        try {
          const result = testPluginInMode(pluginId, mode);
          modeResults[mode] = {
            status: result.success ? 'passed' : 'failed',
            output: result.output,
            error: result.error
          };
          
          if (!result.success) {
            pluginPassed = false;
          }
        } catch (error) {
          modeResults[mode] = {
            status: 'failed',
            error: error.message
          };
          pluginPassed = false;
        }
      }
      
      // Update results
      if (pluginPassed) {
        results.summary.passed++;
      } else {
        results.summary.failed++;
      }
      
      results.plugins[pluginId] = {
        id: pluginId,
        status: pluginPassed ? 'passed' : 'failed',
        actions: actions.map(a => a.name),
        modes: modeResults
      };
    } catch (error) {
      logger.error(`Error testing plugin ${pluginId}:`, error);
      results.summary.failed++;
      results.plugins[pluginId] = {
        id: pluginId,
        status: 'failed',
        error: error.message
      };
    }
  }
  
  // Generate report
  generateReport(results);
  
  logger.info('Real-world plugin testing complete!');
  return results;
}

// Get plugins to test
function getPlugins() {
  // If a specific plugin is specified, only test that plugin
  if (CONFIG.PLUGIN) {
    return [CONFIG.PLUGIN];
  }
  
  // Otherwise, get all utility plugins
  return fs.readdirSync(CONFIG.PLUGINS_DIR)
    .filter(dir => fs.statSync(path.join(CONFIG.PLUGINS_DIR, dir)).isDirectory())
    .filter(dir => !dir.startsWith('.') && dir !== 'node_modules')
    .filter(dir => !CONFIG.SKIP_PLUGINS.includes(dir))
    .filter(dir => CONFIG.UTILITY_PLUGINS.includes(dir));
}

// Get plugin actions
async function getPluginActions(pluginId) {
  const pluginDir = path.join(CONFIG.PLUGINS_DIR, pluginId);
  const actionsDir = path.join(pluginDir, 'src', 'actions');
  
  if (!fs.existsSync(actionsDir)) {
    return [];
  }
  
  const actionFiles = fs.readdirSync(actionsDir)
    .filter(file => file.endsWith('.ts') || file.endsWith('.js'));
  
  if (actionFiles.length === 0) {
    return [];
  }
  
  const actions = [];
  
  for (const actionFile of actionFiles) {
    try {
      const actionCode = fs.readFileSync(path.join(actionsDir, actionFile), 'utf8');
      const actionName = extractActionName(actionCode);
      
      // If a specific action is specified, only include that action
      if (actionName && (!CONFIG.ACTION || actionName === CONFIG.ACTION)) {
        actions.push({
          name: actionName,
          file: actionFile,
          inputSchema: extractInputSchema(actionCode),
          outputSchema: extractOutputSchema(actionCode)
        });
      }
    } catch (error) {
      logger.error(`Error processing action file ${actionFile}:`, error);
    }
  }
  
  return actions;
}

// Extract action name from code
function extractActionName(code) {
  const nameMatch = code.match(/name:\s*['"]([^'"]+)['"]/);
  return nameMatch ? nameMatch[1] : null;
}

// Extract input schema from code
function extractInputSchema(code) {
  // First, check if we have test data for this plugin and action
  const actionName = extractActionName(code);
  const pluginId = CONFIG.PLUGIN;
  
  if (pluginId && actionName) {
    // Check for test data in the new directory structure
    const testDataPath = path.join(CONFIG.TEST_DATA_DIR, pluginId, `${actionName}.json`);
    if (fs.existsSync(testDataPath)) {
      try {
        const testData = JSON.parse(fs.readFileSync(testDataPath, 'utf8'));
        if (testData.input) {
          return testData.input;
        }
      } catch (error) {
        logger.warn(`Error loading test data from ${testDataPath}: ${error.message}`);
      }
    }
  }
  
  // If no test data found, fall back to extracting from code
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
  
  try {
    // Extract example input if available
    const exampleMatch = code.match(/exampleInput:\s*({[^}]+})/);
    if (exampleMatch) {
      const exampleStr = exampleMatch[1].replace(/'/g, '"');
      try {
        return JSON.parse(exampleStr);
      } catch (e) {
        // If parsing fails, try to evaluate it as a JavaScript object
        try {
          return eval(`(${exampleMatch[1]})`);
        } catch (e2) {
          logger.warn(`Could not parse example input: ${e2.message}`);
        }
      }
    }
    
    // If no example input, try to generate from schema
    return generateInputFromSchema(schemaCode);
  } catch (error) {
    logger.error('Error extracting input schema:', error);
    return {};
  }
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
  
  return {};
}

// Generate input from schema
function generateInputFromSchema(schemaCode) {
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
    
    for (const match of Array.from(propertyMatches)) {
      const propertyName = match[1];
      const propertyCode = match[2];
      
      const typeMatch = propertyCode.match(/type:\s*['"]([^'"]+)['"]/);
      const type = typeMatch ? typeMatch[1] : 'string';
      
      properties[propertyName] = generateValueForType(type);
    }
  }
  
  return properties;
}

// Generate a value for a given type
function generateValueForType(type) {
  switch (type) {
    case 'string':
      return 'test-value';
    case 'number':
      return 42;
    case 'boolean':
      return true;
    case 'array':
      return ['item1', 'item2'];
    case 'object':
      return { key: 'value' };
    default:
      return null;
  }
}

// Load credentials
function loadCredentials() {
  if (!fs.existsSync(CONFIG.CREDENTIALS_FILE)) {
    logger.warn(`Credentials file not found: ${CONFIG.CREDENTIALS_FILE}`);
    return {};
  }
  
  try {
    return JSON.parse(fs.readFileSync(CONFIG.CREDENTIALS_FILE, 'utf8'));
  } catch (error) {
    logger.error('Error loading credentials:', error);
    return {};
  }
}

// This function has been removed as we no longer use chain files

// Test plugin in a specific mode
function testPluginInMode(pluginId, mode) {
  try {
    // Run the test command directly without relying on chain files
    const command = `node scripts/test-plugins-cli.js test-${mode} --plugin=${pluginId}`;
    const output = execSync(command, { 
      timeout: CONFIG.TIMEOUT,
      encoding: 'utf8'
    });
    
    return {
      success: !output.includes('Error') && !output.includes('Failed'),
      output
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      output: error.stdout
    };
  }
}

// Generate report
function generateReport(results) {
  // Write JSON report
  const timestamp = results.timestamp.replace(/[:.]/g, '-');
  fs.writeFileSync(
    path.join(CONFIG.OUTPUT_DIR, `real-world-test-results-${timestamp}.json`),
    JSON.stringify(results, null, 2)
  );
  
  // Generate HTML report
  const htmlReport = generateHtmlReport(results);
  fs.writeFileSync(
    path.join(CONFIG.OUTPUT_DIR, `real-world-test-report-${timestamp}.html`),
    htmlReport
  );
  
  logger.info(`Report generated in ${CONFIG.OUTPUT_DIR}`);
  logger.info(`Summary: ${results.summary.passed} passed, ${results.summary.failed} failed, ${results.summary.skipped} skipped`);
}

// Generate HTML report
function generateHtmlReport(results) {
  const passRate = results.summary.total > 0 
    ? Math.round((results.summary.passed / results.summary.total) * 100) 
    : 0;
  
  // Create a navigation section with links to each plugin
  const navigationLinks = Object.entries(results.plugins)
    .map(([pluginId, result]) => {
      return `<li><a href="#plugin-${pluginId}">${pluginId} - <span class="${result.status}">${result.status.toUpperCase()}</span></a></li>`;
    })
    .join('');
  
  let html = `
<!DOCTYPE html>
<html>
<head>
  <title>Real-World Plugin Test Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1, h2, h3 { color: #333; }
    .summary { background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
    .plugin { margin-bottom: 30px; border: 1px solid #ddd; padding: 15px; border-radius: 5px; }
    .plugin-header { display: flex; justify-content: space-between; align-items: center; }
    .passed { color: #5cb85c; }
    .failed { color: #d9534f; }
    .skipped { color: #f0ad4e; }
    .mode { margin: 10px 0; padding: 10px; background-color: #f9f9f9; border-radius: 3px; }
    .error { color: #d9534f; font-weight: bold; }
    pre { background-color: #f5f5f5; padding: 10px; border-radius: 3px; overflow-x: auto; max-height: 300px; }
    .progress-bar { 
      height: 20px; 
      background-color: #f5f5f5; 
      border-radius: 5px; 
      margin-bottom: 10px;
    }
    .progress-bar-fill {
      height: 100%;
      border-radius: 5px;
      background-color: #5cb85c;
      width: ${passRate}%;
    }
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
  <h1>Real-World Plugin Test Report</h1>
  <p>Generated on: ${new Date(results.timestamp).toLocaleString()}</p>
  
  <div class="summary">
    <h2>Summary</h2>
    <div class="progress-bar">
      <div class="progress-bar-fill"></div>
    </div>
    <p>Pass Rate: ${passRate}%</p>
    <p>Total Plugins: ${results.summary.total}</p>
    <p>Passed: <span class="passed">${results.summary.passed}</span></p>
    <p>Failed: <span class="failed">${results.summary.failed}</span></p>
    <p>Skipped: <span class="skipped">${results.summary.skipped}</span></p>
  </div>
  
  <div class="navigation">
    <h2>Plugin Navigation</h2>
    <ul>
      ${navigationLinks}
    </ul>
  </div>
  
  <h2>Plugin Details</h2>
  
  ${Object.entries(results.plugins).map(([pluginId, result]) => {
    return `
      <div id="plugin-${pluginId}" class="plugin">
        <div class="plugin-header">
          <h3>${pluginId} - <span class="${result.status}">${result.status.toUpperCase()}</span></h3>
        </div>
        
        ${result.error ? `<p class="error">Error: ${result.error}</p>` : ''}
        
        ${result.actions ? `
          <p>Actions tested: ${result.actions.join(', ')}</p>
        ` : ''}
        
        ${result.modes ? `
          <h4>Test Modes</h4>
          ${Object.entries(result.modes).map(([mode, modeResult]) => `
            <div class="mode">
              <h5>${mode} mode: <span class="${modeResult.status}">${modeResult.status.toUpperCase()}</span></h5>
              
              ${modeResult.error ? `
                <p class="error">Error: ${modeResult.error}</p>
              ` : ''}
              
              ${modeResult.output ? `
                <h6>Output:</h6>
                <pre>${modeResult.output}</pre>
              ` : ''}
            </div>
          `).join('')}
        ` : ''}
      </div>
    `;
  }).join('')}
</body>
</html>
  `;
  
  return html;
}

// Run the tests if called directly
if (require.main === module) {
  testPluginsRealWorld().catch(error => {
    logger.error('Error testing plugins:', error);
    process.exit(1);
  });
}

module.exports = {
  testPluginsRealWorld
};
