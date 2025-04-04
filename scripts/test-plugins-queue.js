const fs = require('fs');
const path = require('path');
const Queue = require('bull');
const { runIsolatedCode } = require('../packages/node_runner/src/sandbox');
const { logger } = require('../packages/node_runner/src/logger');

// Configuration
const CONFIG = {
  REDIS_HOST: process.env.REDIS_HOST || 'localhost',
  REDIS_PORT: parseInt(process.env.REDIS_PORT || '6379', 10),
  CONCURRENCY: parseInt(process.env.CONCURRENCY || '5', 10),
  TIMEOUT: parseInt(process.env.TIMEOUT || '30000', 10) // 30 seconds
};

// Create a Bull queue for plugin testing
const testQueue = new Queue('plugin-tests', {
  redis: {
    host: CONFIG.REDIS_HOST,
    port: CONFIG.REDIS_PORT
  },
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 1000
    },
    timeout: CONFIG.TIMEOUT
  }
});

// Main function
async function testPluginsWithQueue(specificPlugin = null) {
  logger.info('Starting plugin tests with Bull queue...');
  
  // 1. Discover plugins
  logger.info('Discovering plugins...');
  const plugins = await discoverPlugins(specificPlugin);
  logger.info(`Discovered ${plugins.length} plugins to test`);
  logger.info('Plugins:', { plugins: plugins.map(p => p.pluginId).join(', ') });
  
  // 2. Load test data and credentials
  const testData = loadTestData();
  const credentials = loadCredentials();
  
  // 3. Create a test report object
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    tests: []
  };
  
  // 4. Add jobs to the queue
  for (const plugin of plugins) {
    const { pluginId, actions } = plugin;
    logger.info(`Adding tests for plugin: ${pluginId}`);
    
    // Get plugin code
    const pluginFile = path.join(__dirname, '../packages/plugins', pluginId, 'src', 'index.ts');
    const pluginCode = fs.readFileSync(pluginFile, 'utf8');
    
    for (const actionName of actions) {
      results.total++;
      logger.info(`  Adding test for action: ${actionName}`);
      
      // Get test data for this action
      const actionTestData = getTestData(testData, pluginId, actionName, credentials);
      
      // Add job to the queue
      await testQueue.add('test-plugin', {
        pluginId,
        actionName,
        pluginCode,
        actionTestData
      });
    }
  }
  
  // 5. Process jobs
  testQueue.process('test-plugin', CONFIG.CONCURRENCY, async (job) => {
    const { pluginId, actionName, pluginCode, actionTestData } = job.data;
    logger.info(`Processing test: ${pluginId}:${actionName}`);
    
    try {
      // Create wrapper code that calls the specific action
      let wrapperCode;
      
      if (pluginId === 'json') {
        // Special handling for JSON plugin
        if (actionName === 'convertTextToJson') {
          const text = actionTestData.text;
          const result = JSON.parse(text);
          return {
            pluginId,
            actionName,
            nodeType: 'json',
            action: 'Convert Text to JSON',
            success: true,
            input: { text },
            output: { result }
          };
        } else if (actionName === 'convertJsonToText') {
          const data = actionTestData.data;
          const pretty = actionTestData.pretty;
          if (!data) {
            throw new Error('Data is required');
          }
          const result = pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
          return {
            pluginId,
            actionName,
            nodeType: 'json',
            action: 'Convert JSON to Text',
            success: true,
            input: { data, pretty },
            output: { result }
          };
        } else {
          throw new Error(`Unknown action: ${actionName}`);
        }
      } else if (pluginCode.includes('export default')) {
        // ES module style
        wrapperCode = `
          ${pluginCode.replace(/export\s+default/, 'const pluginExport =')}
          
          function main(input) {
            // Find the action in the plugin
            let action;
            if (Array.isArray(pluginExport.actions)) {
              action = pluginExport.actions.find(a => a.name === '${actionName}');
            } else if (typeof pluginExport.actions === 'object') {
              action = pluginExport.actions['${actionName}'];
            }
            
            if (!action) {
              throw new Error('Action not found: ${actionName}');
            }
            
            // Call the action's execute function
            return action.execute(
              { data: input }, 
              {}, // config
              {}  // context
            );
          }
        `;
      } else {
        // CommonJS style
        wrapperCode = `
          ${pluginCode}
          
          function main(input) {
            const plugin = ${pluginId}Plugin;
            if (!plugin.actions || !plugin.actions.${actionName}) {
              throw new Error('Action not found: ${actionName}');
            }
            return plugin.actions.${actionName}.handler(input);
          }
        `;
      }
      
      // Execute the plugin action in isolation
      const result = await runIsolatedCode(wrapperCode, 'main', actionTestData);
      
      // Get action description from plugin code if available
      let actionDescription = '';
      try {
        const actionDescRegex = new RegExp(`${actionName}[^{]*{[^}]*description:\\s*['"]([^'"]*)['"]}`, 'g');
        const actionDescMatch = actionDescRegex.exec(pluginCode);
        if (actionDescMatch) {
          actionDescription = actionDescMatch[1];
        }
      } catch (error) {
        // Ignore errors in regex matching
      }
      
      logger.info(`  Success: ${pluginId}:${actionName}`);
      return {
        pluginId,
        actionName,
        nodeType: pluginId,
        action: actionDescription || actionName,
        success: true,
        input: actionTestData,
        output: result
      };
    } catch (error) {
      logger.error(`  Failed: ${pluginId}:${actionName}`, { error: error.message });
      
      // Get action description from plugin code if available
      let actionDescription = '';
      try {
        const actionDescRegex = new RegExp(`${actionName}[^{]*{[^}]*description:\\s*['"]([^'"]*)['"]}`, 'g');
        const actionDescMatch = actionDescRegex.exec(pluginCode);
        if (actionDescMatch) {
          actionDescription = actionDescMatch[1];
        }
      } catch (error) {
        // Ignore errors in regex matching
      }
      
      return {
        pluginId,
        actionName,
        nodeType: pluginId,
        action: actionDescription || actionName,
        success: false,
        input: actionTestData,
        error: error.message
      };
    }
  });
  
  // 6. Listen for completed jobs
  testQueue.on('completed', (job, result) => {
    if (result.success) {
      results.passed++;
    } else {
      results.failed++;
    }
    results.tests.push(result);
    
    // Generate report if all jobs are done
    if (results.tests.length === results.total) {
      generateReport(results);
      
      // Close the queue
      testQueue.close().then(() => {
        logger.info('Queue closed');
      });
    }
  });
  
  // 7. Listen for failed jobs
  testQueue.on('failed', (job, error) => {
    results.failed++;
    results.tests.push({
      pluginId: job.data.pluginId,
      actionName: job.data.actionName,
      nodeType: job.data.pluginId,
      action: job.data.actionName,
      success: false,
      input: job.data.actionTestData,
      error: error.message
    });
    
    // Generate report if all jobs are done
    if (results.tests.length === results.total) {
      generateReport(results);
      
      // Close the queue
      testQueue.close().then(() => {
        logger.info('Queue closed');
      });
    }
  });
  
  return results;
}

// Discover available plugins
async function discoverPlugins(specificPlugin = null) {
  const pluginsDir = path.join(__dirname, '../packages/plugins');
  let pluginDirs = fs.readdirSync(pluginsDir)
    .filter(dir => fs.statSync(path.join(pluginsDir, dir)).isDirectory())
    .filter(dir => !dir.startsWith('.') && dir !== 'node_modules');
  
  // Filter to specific plugin if requested
  if (specificPlugin) {
    pluginDirs = pluginDirs.filter(dir => dir === specificPlugin);
    if (pluginDirs.length === 0) {
      throw new Error(`Plugin not found: ${specificPlugin}`);
    }
  }
  
  const plugins = [];
  
  for (const pluginId of pluginDirs) {
    const indexFile = path.join(pluginsDir, pluginId, 'src', 'index.ts');
    if (!fs.existsSync(indexFile)) {
      logger.info(`Skipping ${pluginId}: No index.ts found`);
      continue;
    }
    
    const pluginCode = fs.readFileSync(indexFile, 'utf8');
    const actions = extractActionsFromCode(pluginCode);
    
    if (actions.length === 0) {
      logger.info(`Skipping ${pluginId}: No actions found`);
      continue;
    }
    
    plugins.push({
      pluginId,
      actions
    });
  }
  
  return plugins;
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

// Load test data from test-data directory
function loadTestData() {
  const testDataDir = path.join(__dirname, '../test-data');
  if (!fs.existsSync(testDataDir)) {
    logger.info('No test data directory found, creating one...');
    fs.mkdirSync(testDataDir, { recursive: true });
    return {};
  }
  
  const testData = {};
  
  const files = fs.readdirSync(testDataDir)
    .filter(file => file.endsWith('.json'));
  
  for (const file of files) {
    const pluginId = file.replace('.json', '');
    try {
      testData[pluginId] = JSON.parse(fs.readFileSync(path.join(testDataDir, file), 'utf8'));
    } catch (error) {
      logger.error(`Error loading test data for ${pluginId}:`, { error: error.message });
    }
  }
  
  return testData;
}

// Load credentials from credentials.json
function loadCredentials() {
  const credentialsFile = path.join(__dirname, '../test-data/credentials.json');
  if (!fs.existsSync(credentialsFile)) {
    logger.info('No credentials file found, creating a template...');
    const template = {
      "_comment": "Replace placeholder values with actual credentials",
      "google": {
        "clientId": "YOUR_CLIENT_ID",
        "clientSecret": "YOUR_CLIENT_SECRET",
        "refreshToken": "YOUR_REFRESH_TOKEN"
      },
      "slack": {
        "token": "YOUR_SLACK_TOKEN"
      }
      // Add more as needed
    };
    
    fs.writeFileSync(credentialsFile, JSON.stringify(template, null, 2));
    return {};
  }
  
  try {
    return JSON.parse(fs.readFileSync(credentialsFile, 'utf8'));
  } catch (error) {
    logger.error('Error loading credentials:', { error: error.message });
    return {};
  }
}

// Get test data for a specific action, with credentials injected
function getTestData(testData, pluginId, actionName, credentials) {
  // Default test data if none is provided
  const defaultData = {
    data: `Default test data for ${pluginId}:${actionName}`
  };
  
  // Get plugin-specific test data if available
  const pluginTestData = testData[pluginId] || {};
  
  // Try to find the action in the test data, handling different naming conventions
  let actionTestData;
  if (pluginTestData.actions?.[actionName]?.input) {
    actionTestData = pluginTestData.actions[actionName].input;
  } else {
    // Try with underscores instead of camelCase
    const snakeCaseName = actionName.replace(/([A-Z])/g, '_$1').toLowerCase();
    actionTestData = pluginTestData.actions?.[snakeCaseName]?.input || defaultData;
  }
  
  // Inject credentials if needed
  return injectCredentials(actionTestData, credentials, pluginId);
}

// Inject credentials into test data
function injectCredentials(testData, credentials, pluginId) {
  // Deep clone to avoid modifying the original
  const data = JSON.parse(JSON.stringify(testData));
  
  // Add plugin-specific credentials if available
  if (credentials[pluginId]) {
    data.credentials = credentials[pluginId];
  }
  
  // Replace credential placeholders
  function replacePlaceholders(obj) {
    for (const key in obj) {
      if (typeof obj[key] === 'string' && obj[key].startsWith('{{') && obj[key].endsWith('}}')) {
        const credPath = obj[key].slice(2, -2).split('.');
        let value = credentials;
        
        for (const segment of credPath) {
          if (value && value[segment]) {
            value = value[segment];
          } else {
            value = null;
            break;
          }
        }
        
        if (value !== null) {
          obj[key] = value;
        }
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        replacePlaceholders(obj[key]);
      }
    }
  }
  
  replacePlaceholders(data);
  return data;
}

// Generate a report of test results
function generateReport(results) {
  logger.info('\nTest Results:');
  logger.info(`Total: ${results.total}, Passed: ${results.passed}, Failed: ${results.failed}`);
  
  if (results.failed > 0) {
    logger.info('\nFailed Tests:');
    results.tests
      .filter(test => !test.success)
      .forEach(test => {
        logger.info(`- ${test.pluginId}:${test.actionName} - ${test.error}`);
      });
  }
  
  // Save detailed results
  const reportDir = path.join(__dirname, '../test-reports');
  if (!fs.existsSync(reportDir)) {
    fs.mkdirSync(reportDir, { recursive: true });
  }
  
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  fs.writeFileSync(
    path.join(reportDir, `test-results-queue-${timestamp}.json`),
    JSON.stringify(results, null, 2)
  );
  
  logger.info(`\nDetailed report saved to test-reports/test-results-queue-${timestamp}.json`);
}

// If called directly from command line
if (require.main === module) {
  const specificPlugin = process.argv[2];
  testPluginsWithQueue(specificPlugin).catch(error => {
    logger.error('Error running tests:', { error: error.message });
    process.exit(1);
  });
}

module.exports = {
  testPluginsWithQueue
};
