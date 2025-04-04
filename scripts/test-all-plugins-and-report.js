#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { testPlugins } = require('./plugin-tester');

// Configuration
const CONFIG = {
  OUTPUT_DIR: path.join(__dirname, '../plugin-test-reports'),
  TEST_MODE: process.env.TEST_MODE || 'direct', // 'direct' or 'node-runner'
  PLUGINS_TO_TEST: process.env.PLUGINS_TO_TEST ? process.env.PLUGINS_TO_TEST.split(',') : null,
  SKIP_PLUGINS: ['mcp-client', 'mcp-server'] // Plugins to skip (add more as needed)
};

// Main function
async function testAllPluginsAndReport() {
  console.log('Starting plugin testing and reporting...');
  
  // Create output directory if it doesn't exist
  if (!fs.existsSync(CONFIG.OUTPUT_DIR)) {
    fs.mkdirSync(CONFIG.OUTPUT_DIR, { recursive: true });
  }
  
  // Run tests for all plugins
  console.log(`Running tests in ${CONFIG.TEST_MODE} mode...`);
  process.env.TEST_MODE = CONFIG.TEST_MODE;
  const testResults = await testPlugins(CONFIG.PLUGINS_TO_TEST);
  
  // Generate report
  console.log('Generating report...');
  const report = generateReport(testResults);
  
  // Write report to file
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  fs.writeFileSync(
    path.join(CONFIG.OUTPUT_DIR, `plugin-test-report-${timestamp}.json`),
    JSON.stringify(report, null, 2)
  );
  
  // Generate HTML report
  const htmlReport = generateHtmlReport(report);
  fs.writeFileSync(
    path.join(CONFIG.OUTPUT_DIR, `plugin-test-report-${timestamp}.html`),
    htmlReport
  );
  
  console.log(`Report generated in ${CONFIG.OUTPUT_DIR}`);
  return report;
}

// Generate report from test results
function generateReport(testResults) {
  const report = {
    summary: {
      total: testResults.total,
      passed: testResults.passed,
      failed: testResults.failed
    },
    plugins: {}
  };
  
  // Group tests by plugin
  for (const test of testResults.tests) {
    const { pluginId, actionName, nodeType, action, success, input, output, error } = test;
    
    if (!report.plugins[pluginId]) {
      report.plugins[pluginId] = {
        id: pluginId,
        actions: {}
      };
    }
    
    report.plugins[pluginId].actions[actionName] = {
      name: actionName,
      nodeType: nodeType || pluginId,
      description: action,
      success,
      input: analyzeData(input),
      output: success ? analyzeData(output) : null,
      error: error || null
    };
  }
  
  return report;
}

// Analyze data structure
function analyzeData(data) {
  if (data === null || data === undefined) {
    return { type: 'null' };
  }
  
  if (Array.isArray(data)) {
    const itemTypes = data.map(item => analyzeData(item));
    return {
      type: 'array',
      items: itemTypes.length > 0 ? itemTypes[0] : { type: 'unknown' }
    };
  }
  
  if (typeof data === 'object') {
    const properties = {};
    for (const [key, value] of Object.entries(data)) {
      properties[key] = analyzeData(value);
    }
    return {
      type: 'object',
      properties
    };
  }
  
  return { type: typeof data, value: data };
}

// Generate HTML report
function generateHtmlReport(report) {
  let html = `
<!DOCTYPE html>
<html>
<head>
  <title>Plugin Test Report</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1, h2, h3, h4 { color: #333; }
    .summary { background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 20px; }
    .plugin { margin-bottom: 30px; border: 1px solid #ddd; padding: 15px; border-radius: 5px; }
    .plugin-header { display: flex; justify-content: space-between; align-items: center; }
    .action { margin: 10px 0; padding: 10px; background-color: #f9f9f9; border-radius: 3px; }
    .action-header { display: flex; justify-content: space-between; align-items: center; }
    .success { color: #5cb85c; }
    .failure { color: #d9534f; }
    .data { margin-left: 20px; }
    .error { color: #d9534f; font-weight: bold; }
    pre { background-color: #f5f5f5; padding: 10px; border-radius: 3px; overflow-x: auto; }
    table { border-collapse: collapse; width: 100%; margin-bottom: 10px; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
    th { background-color: #f2f2f2; }
  </style>
</head>
<body>
  <h1>Plugin Test Report</h1>
  
  <div class="summary">
    <h2>Summary</h2>
    <p>Total Tests: ${report.summary.total}</p>
    <p>Passed: ${report.summary.passed}</p>
    <p>Failed: ${report.summary.failed}</p>
  </div>
  
  <h2>Plugins</h2>
  
  ${Object.entries(report.plugins).map(([pluginId, plugin]) => {
    const actions = plugin.actions || {};
    const hasFailures = Object.values(actions).some(action => !action.success);
    
    return `
      <div class="plugin">
        <div class="plugin-header">
          <h3>${pluginId}</h3>
          ${hasFailures ? '<span class="failure">Has Failures</span>' : '<span class="success">All Passed</span>'}
        </div>
        
        <h4>Actions</h4>
        ${Object.entries(actions).map(([actionName, action]) => {
          return `
            <div class="action">
              <div class="action-header">
                <h4>${actionName} (${action.nodeType})</h4>
                ${action.success 
                  ? '<span class="success">Success</span>' 
                  : '<span class="failure">Failed</span>'}
              </div>
              
              <p><strong>Description:</strong> ${action.description || actionName}</p>
              
              ${action.success ? '' : `<p class="error">Error: ${action.error}</p>`}
              
              <h5>Input</h5>
              <div class="data">
                ${renderDataStructure(action.input)}
              </div>
              
              ${action.success ? `
                <h5>Output</h5>
                <div class="data">
                  ${renderDataStructure(action.output)}
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

// Render data structure as HTML
function renderDataStructure(data, level = 0) {
  if (!data) return '<p>No data</p>';
  
  if (data.type === 'object' && data.properties) {
    return `
      <table>
        <tr>
          <th>Property</th>
          <th>Type</th>
          <th>Value/Structure</th>
        </tr>
        ${Object.entries(data.properties).map(([key, value]) => `
          <tr>
            <td>${key}</td>
            <td>${value.type}</td>
            <td>${value.type === 'object' || value.type === 'array' 
              ? renderDataStructure(value, level + 1) 
              : value.value !== undefined ? JSON.stringify(value.value) : ''}</td>
          </tr>
        `).join('')}
      </table>
    `;
  }
  
  if (data.type === 'array' && data.items) {
    return `
      <div>
        <p>Array of ${data.items.type}</p>
        ${data.items.type === 'object' || data.items.type === 'array' 
          ? renderDataStructure(data.items, level + 1) 
          : ''}
      </div>
    `;
  }
  
  return `<p>${data.type}${data.value !== undefined ? `: ${JSON.stringify(data.value)}` : ''}</p>`;
}

// Run the test and report generation if called directly
if (require.main === module) {
  testAllPluginsAndReport().catch(error => {
    console.error('Error testing plugins and generating report:', error);
    process.exit(1);
  });
}

module.exports = {
  testAllPluginsAndReport
};
