#!/usr/bin/env node

/**
 * This script tests plugins using the test data in the test-data directory.
 * It directly loads and executes the plugin actions with the test data.
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
async function testPluginData() {
  logger.info('Starting plugin data testing...');
  
  // Create output directory if it doesn't exist
  if (!fs.existsSync(CONFIG.OUTPUT_DIR)) {
    fs.mkdirSync(CONFIG.OUTPUT_DIR, { recursive: true });
  }
  
  // Get plugins to test
  const plugins = getPlugins();
  logger.info(`Found ${plugins.length} plugins to test`);
  
  // Test results
  const results = {
    timestamp: new Date().toISOString(),
    summary: {
      total: 0,
      passed: 0,
      failed: 0,
      skipped: 0
    },
    plugins: {}
  };
  
  // Test each plugin
  for (const pluginId of plugins) {
    logger.info(`Testing plugin: ${pluginId}`);
    
    // Get test data for this plugin
    const pluginTestData = getPluginTestData(pluginId);
    
    if (!pluginTestData || Object.keys(pluginTestData).length === 0) {
      logger.warn(`No test data found for plugin ${pluginId}, skipping...`);
      results.summary.skipped++;
      results.plugins[pluginId] = {
        id: pluginId,
        status: 'skipped',
        reason: 'No test data found'
      };
      continue;
    }
    
    // Test each action
    const actionResults = {};
    let pluginPassed = true;
    
    for (const [actionName, testData] of Object.entries(pluginTestData)) {
      // Skip if a specific action is specified and this is not it
      if (CONFIG.ACTION && actionName !== CONFIG.ACTION) {
        continue;
      }
      
      results.summary.total++;
      logger.info(`  Testing action: ${actionName}`);
      
      try {
        // Execute the action with the test data
        const result = await executeAction(pluginId, actionName, testData.input);
        
        // Compare the result with the expected output
        const passed = compareResults(result, testData.expected);
        
        if (passed) {
          logger.info(`    Passed: ${pluginId}:${actionName}`);
          results.summary.passed++;
          actionResults[actionName] = {
            status: 'passed',
            input: testData.input,
            expected: testData.expected,
            actual: result
          };
        } else {
          logger.error(`    Failed: ${pluginId}:${actionName} - Result does not match expected output`);
          results.summary.failed++;
          pluginPassed = false;
          actionResults[actionName] = {
            status: 'failed',
            input: testData.input,
            expected: testData.expected,
            actual: result,
            error: 'Result does not match expected output'
          };
        }
      } catch (error) {
        logger.error(`    Failed: ${pluginId}:${actionName} - ${error.message}`);
        results.summary.failed++;
        pluginPassed = false;
        actionResults[actionName] = {
          status: 'failed',
          input: testData.input,
          expected: testData.expected,
          error: error.message
        };
      }
    }
    
    // Update plugin results
    results.plugins[pluginId] = {
      id: pluginId,
      status: pluginPassed ? 'passed' : 'failed',
      actions: actionResults
    };
  }
  
  // Generate report
  generateReport(results);
  
  logger.info('Plugin data testing complete!');
  return results;
}

// Get plugins to test
function getPlugins() {
  // If a specific plugin is specified, only test that plugin
  if (CONFIG.PLUGIN) {
    return [CONFIG.PLUGIN];
  }
  
  // Otherwise, get all utility plugins with test data
  return fs.readdirSync(CONFIG.TEST_DATA_DIR)
    .filter(dir => fs.statSync(path.join(CONFIG.TEST_DATA_DIR, dir)).isDirectory())
    .filter(dir => !dir.startsWith('.') && dir !== 'node_modules' && dir !== 'chains')
    .filter(dir => CONFIG.UTILITY_PLUGINS.includes(dir));
}

// Get test data for a plugin
function getPluginTestData(pluginId) {
  const pluginDir = path.join(CONFIG.TEST_DATA_DIR, pluginId);
  
  if (!fs.existsSync(pluginDir)) {
    return null;
  }
  
  const testData = {};
  
  const files = fs.readdirSync(pluginDir)
    .filter(file => file.endsWith('.json'));
  
  for (const file of files) {
    const actionName = file.replace('.json', '');
    
    try {
      testData[actionName] = JSON.parse(fs.readFileSync(path.join(pluginDir, file), 'utf8'));
    } catch (error) {
      logger.error(`Error loading test data for ${pluginId}:${actionName}:`, error.message);
    }
  }
  
  return testData;
}

// Execute an action with test data
async function executeAction(pluginId, actionName, input) {
  // Create a temporary script to execute the action
  const tempScript = `
    // Import the plugin
    import plugin from '../packages/plugins/${pluginId}/src/index.ts';
    
    // Find the action
    const action = plugin.default.actions.find(a => a.name === '${actionName}');
    if (!action) {
      console.error('Action not found: ${actionName}');
      process.exit(1);
    }
    
    // Execute the action
    try {
      const result = await action.execute(
        { data: ${JSON.stringify(input)} },
        {}, // config
        {}  // context
      );
      
      // Output the result as JSON
      console.log(JSON.stringify(result));
    } catch (error) {
      console.error(error.message);
      process.exit(1);
    }
  `;
  
  const tempFile = path.join(__dirname, 'temp-execute-action.mjs');
  fs.writeFileSync(tempFile, tempScript);
  
  try {
    // Execute the temporary script with Node.js's ES module support
    const output = execSync(`node --experimental-modules ${tempFile}`, {
      encoding: 'utf8',
      timeout: CONFIG.TIMEOUT
    });
    
    // Parse the output as JSON
    return JSON.parse(output);
  } catch (error) {
    throw new Error(`Error executing action: ${error.message}`);
  } finally {
    // Clean up the temporary script
    fs.unlinkSync(tempFile);
  }
}

// Compare results
function compareResults(actual, expected) {
  // If expected is a special value, handle it
  if (expected === 'RANDOM_PASSWORD') {
    return typeof actual === 'string' && actual.length > 0;
  }
  
  // Otherwise, compare the results
  return JSON.stringify(actual) === JSON.stringify(expected);
}

// Generate report
function generateReport(results) {
  // Write JSON report
  const timestamp = results.timestamp.replace(/[:.]/g, '-');
  fs.writeFileSync(
    path.join(CONFIG.OUTPUT_DIR, `plugin-data-test-results-${timestamp}.json`),
    JSON.stringify(results, null, 2)
  );
  
  // Generate HTML report
  const htmlReport = generateHtmlReport(results);
  fs.writeFileSync(
    path.join(CONFIG.OUTPUT_DIR, `plugin-data-test-report-${timestamp}.html`),
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
  <title>Plugin Data Test Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1, h2, h3 { color: #333; }
    .summary { background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
    .plugin { margin-bottom: 30px; border: 1px solid #ddd; padding: 15px; border-radius: 5px; }
    .plugin-header { display: flex; justify-content: space-between; align-items: center; }
    .passed { color: #5cb85c; }
    .failed { color: #d9534f; }
    .skipped { color: #f0ad4e; }
    .action { margin: 10px 0; padding: 10px; background-color: #f9f9f9; border-radius: 3px; }
    .action-header { display: flex; justify-content: space-between; align-items: center; }
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
  <h1>Plugin Data Test Report</h1>
  <p>Generated on: ${new Date(results.timestamp).toLocaleString()}</p>
  
  <div class="summary">
    <h2>Summary</h2>
    <div class="progress-bar">
      <div class="progress-bar-fill"></div>
    </div>
    <p>Pass Rate: ${passRate}%</p>
    <p>Total Tests: ${results.summary.total}</p>
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
    if (result.status === 'skipped') {
      return `
        <div id="plugin-${pluginId}" class="plugin">
          <div class="plugin-header">
            <h3>${pluginId} - <span class="skipped">SKIPPED</span></h3>
          </div>
          <p>Reason: ${result.reason}</p>
        </div>
      `;
    }
    
    return `
      <div id="plugin-${pluginId}" class="plugin">
        <div class="plugin-header">
          <h3>${pluginId} - <span class="${result.status}">${result.status.toUpperCase()}</span></h3>
        </div>
        
        <h4>Actions</h4>
        ${Object.entries(result.actions).map(([actionName, actionResult]) => `
          <div class="action">
            <div class="action-header">
              <h5>${actionName} - <span class="${actionResult.status}">${actionResult.status.toUpperCase()}</span></h5>
            </div>
            
            ${actionResult.error ? `<p class="error">Error: ${actionResult.error}</p>` : ''}
            
            <h6>Input:</h6>
            <pre>${JSON.stringify(actionResult.input, null, 2)}</pre>
            
            <h6>Expected Output:</h6>
            <pre>${JSON.stringify(actionResult.expected, null, 2)}</pre>
            
            ${actionResult.actual ? `
              <h6>Actual Output:</h6>
              <pre>${JSON.stringify(actionResult.actual, null, 2)}</pre>
            ` : ''}
          </div>
        `).join('')}
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
  testPluginData().catch(error => {
    logger.error('Error testing plugins:', error);
    process.exit(1);
  });
}

module.exports = {
  testPluginData
};
