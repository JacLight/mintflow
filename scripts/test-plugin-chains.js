const fs = require('fs');
const path = require('path');
const { runIsolatedCode } = require('../packages/node_runner/src/sandbox');

// Configuration
const CONFIG = {
  TEST_DATA_DIR: path.join(__dirname, '../test-data'),
  CHAIN_CONFIGS_DIR: path.join(__dirname, '../test-data/chains'),
  REPORT_DIR: path.join(__dirname, '../test-reports')
};

// Main function
async function testPluginChains(specificChain = null) {
  console.log('Testing plugin chains...');
  
  // Create directories if they don't exist
  ensureDirectoriesExist();
  
  // Load credentials
  const credentials = loadCredentials();
  
  // Discover chain configurations
  const chains = discoverChains(specificChain);
  console.log(`Discovered ${chains.length} chain configurations`);
  
  if (chains.length === 0) {
    console.log('No chain configurations found. Creating example chain...');
    createExampleChain();
    console.log('Please edit the example chain configuration and run again.');
    return;
  }
  
  // Test each chain
  const results = {
    total: chains.length,
    passed: 0,
    failed: 0,
    chains: []
  };
  
  for (const chain of chains) {
    console.log(`\nTesting chain: ${chain.name}`);
    
    try {
      const chainResult = await testChain(chain, credentials);
      
      if (chainResult.success) {
        console.log(`  Chain test passed: ${chain.name}`);
        results.passed++;
      } else {
        console.log(`  Chain test failed: ${chain.name}`);
        results.failed++;
      }
      
      results.chains.push(chainResult);
    } catch (error) {
      console.error(`  Error testing chain ${chain.name}:`, error.message);
      results.failed++;
      results.chains.push({
        name: chain.name,
        success: false,
        error: error.message
      });
    }
  }
  
  // Generate report
  generateReport(results);
  
  return results;
}

// Ensure all required directories exist
function ensureDirectoriesExist() {
  if (!fs.existsSync(CONFIG.TEST_DATA_DIR)) {
    fs.mkdirSync(CONFIG.TEST_DATA_DIR, { recursive: true });
  }
  
  if (!fs.existsSync(CONFIG.CHAIN_CONFIGS_DIR)) {
    fs.mkdirSync(CONFIG.CHAIN_CONFIGS_DIR, { recursive: true });
  }
  
  if (!fs.existsSync(CONFIG.REPORT_DIR)) {
    fs.mkdirSync(CONFIG.REPORT_DIR, { recursive: true });
  }
}

// Load credentials
function loadCredentials() {
  const credentialsFile = path.join(CONFIG.TEST_DATA_DIR, 'credentials.json');
  
  if (!fs.existsSync(credentialsFile)) {
    console.log('No credentials file found. Some tests may fail if they require authentication.');
    return {};
  }
  
  try {
    return JSON.parse(fs.readFileSync(credentialsFile, 'utf8'));
  } catch (error) {
    console.error('Error loading credentials:', error.message);
    return {};
  }
}

// Discover chain configurations
function discoverChains(specificChain = null) {
  if (!fs.existsSync(CONFIG.CHAIN_CONFIGS_DIR)) {
    return [];
  }
  
  let chainFiles = fs.readdirSync(CONFIG.CHAIN_CONFIGS_DIR)
    .filter(file => file.endsWith('.json'));
  
  if (specificChain) {
    const specificFile = `${specificChain}.json`;
    chainFiles = chainFiles.filter(file => file === specificFile);
    
    if (chainFiles.length === 0) {
      throw new Error(`Chain configuration not found: ${specificChain}`);
    }
  }
  
  const chains = [];
  
  for (const file of chainFiles) {
    try {
      const chainConfig = JSON.parse(fs.readFileSync(path.join(CONFIG.CHAIN_CONFIGS_DIR, file), 'utf8'));
      chainConfig.name = file.replace('.json', '');
      chains.push(chainConfig);
    } catch (error) {
      console.error(`Error loading chain configuration ${file}:`, error.message);
    }
  }
  
  return chains;
}

// Create an example chain configuration
function createExampleChain() {
  const exampleChain = {
    description: "Example chain that processes data through multiple plugins",
    nodes: [
      {
        id: "node1",
        pluginId: "json",
        action: "convert_text_to_json",
        input: {
          text: '{"name": "Test User", "email": "test@example.com"}'
        }
      },
      {
        id: "node2",
        pluginId: "data-bridge",
        action: "advanced_mapping",
        input: {
          data: "{{node1.output}}",
          mapping: {
            fullName: "{{data.name}}",
            contactEmail: "{{data.email}}",
            timestamp: "{{now}}"
          }
        }
      },
      {
        id: "node3",
        pluginId: "csv",
        action: "json_to_csv",
        input: {
          data: "{{node2.output}}",
          includeHeader: true
        }
      }
    ]
  };
  
  const outputFile = path.join(CONFIG.CHAIN_CONFIGS_DIR, 'example-chain.json');
  fs.writeFileSync(outputFile, JSON.stringify(exampleChain, null, 2));
}

// Test a single chain
async function testChain(chain, credentials) {
  console.log(`  Chain: ${chain.name}`);
  console.log(`  Description: ${chain.description || 'No description'}`);
  console.log(`  Nodes: ${chain.nodes.length}`);
  
  const result = {
    name: chain.name,
    success: true,
    nodes: [],
    error: null
  };
  
  // Context to store outputs from each node
  const context = {
    now: new Date().toISOString()
  };
  
  // Process each node in sequence
  for (let i = 0; i < chain.nodes.length; i++) {
    const node = chain.nodes[i];
    console.log(`    Testing node ${i + 1}/${chain.nodes.length}: ${node.pluginId}:${node.action}`);
    
    try {
      // Prepare input with variable substitution
      const input = prepareNodeInput(node.input, context, credentials);
      
      // Execute the node
      const output = await executeNode(node.pluginId, node.action, input);
      
      // Store output in context
      context[node.id] = {
        output
      };
      
      console.log(`      Success: ${node.pluginId}:${node.action}`);
      result.nodes.push({
        id: node.id,
        pluginId: node.pluginId,
        action: node.action,
        success: true,
        output
      });
    } catch (error) {
      console.error(`      Failed: ${node.pluginId}:${node.action} - ${error.message}`);
      result.success = false;
      result.error = `Error in node ${node.id} (${node.pluginId}:${node.action}): ${error.message}`;
      
      result.nodes.push({
        id: node.id,
        pluginId: node.pluginId,
        action: node.action,
        success: false,
        error: error.message
      });
      
      // Stop processing the chain on first failure
      break;
    }
  }
  
  return result;
}

// Prepare node input with variable substitution
function prepareNodeInput(input, context, credentials) {
  // Deep clone to avoid modifying the original
  const clonedInput = JSON.parse(JSON.stringify(input));
  
  // Replace variables in the input
  return replaceVariables(clonedInput, context, credentials);
}

// Replace variables in an object
function replaceVariables(obj, context, credentials) {
  if (typeof obj === 'string') {
    return replaceVariableInString(obj, context, credentials);
  } else if (Array.isArray(obj)) {
    return obj.map(item => replaceVariables(item, context, credentials));
  } else if (typeof obj === 'object' && obj !== null) {
    const result = {};
    for (const key in obj) {
      result[key] = replaceVariables(obj[key], context, credentials);
    }
    return result;
  }
  
  return obj;
}

// Replace variables in a string
function replaceVariableInString(str, context, credentials) {
  if (typeof str !== 'string') {
    return str;
  }
  
  // Check if the entire string is a variable reference
  if (str.match(/^{{[^{}]+}}$/)) {
    const varName = str.slice(2, -2);
    return resolveVariable(varName, context, credentials);
  }
  
  // Replace multiple variables in the string
  return str.replace(/{{([^{}]+)}}/g, (match, varName) => {
    const value = resolveVariable(varName, context, credentials);
    return typeof value === 'object' ? JSON.stringify(value) : String(value);
  });
}

// Resolve a variable from context or credentials
function resolveVariable(varName, context, credentials) {
  // Handle nested properties (e.g., "node1.output.data")
  const parts = varName.trim().split('.');
  
  // Special case for credentials
  if (parts[0] === 'credentials') {
    let value = credentials;
    for (let i = 1; i < parts.length; i++) {
      if (!value || typeof value !== 'object') {
        return null;
      }
      value = value[parts[i]];
    }
    return value;
  }
  
  // Regular context variables
  let value = context;
  for (const part of parts) {
    if (!value || typeof value !== 'object') {
      return null;
    }
    value = value[part];
  }
  
  return value;
}

// Execute a node
async function executeNode(pluginId, actionName, input) {
  // Get plugin code
  const pluginFile = path.join(__dirname, '../packages/plugins', pluginId, 'src', 'index.ts');
  
  if (!fs.existsSync(pluginFile)) {
    throw new Error(`Plugin file not found: ${pluginFile}`);
  }
  
  const pluginCode = fs.readFileSync(pluginFile, 'utf8');
  
  // Create wrapper code
  const wrapperCode = `
    ${pluginCode}
    
    function main(input) {
      const plugin = ${pluginId}Plugin;
      if (!plugin.actions || !plugin.actions.${actionName}) {
        throw new Error('Action not found: ${actionName}');
      }
      return plugin.actions.${actionName}.handler(input);
    }
  `;
  
  // Execute in sandbox
  return await runIsolatedCode(wrapperCode, 'main', input);
}

// Generate a report of test results
function generateReport(results) {
  console.log('\nChain Test Results:');
  console.log(`Total: ${results.total}, Passed: ${results.passed}, Failed: ${results.failed}`);
  
  if (results.failed > 0) {
    console.log('\nFailed Chains:');
    results.chains
      .filter(chain => !chain.success)
      .forEach(chain => {
        console.log(`- ${chain.name}: ${chain.error}`);
      });
  }
  
  // Save detailed results
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  fs.writeFileSync(
    path.join(CONFIG.REPORT_DIR, `chain-test-results-${timestamp}.json`),
    JSON.stringify(results, null, 2)
  );
  
  console.log(`\nDetailed report saved to test-reports/chain-test-results-${timestamp}.json`);
}

// If called directly from command line
if (require.main === module) {
  const specificChain = process.argv[2];
  testPluginChains(specificChain).catch(error => {
    console.error('Error testing plugin chains:', error);
    process.exit(1);
  });
}

module.exports = {
  testPluginChains
};
