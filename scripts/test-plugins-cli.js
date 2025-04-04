#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { testPlugins } = require('./plugin-tester');
const { generateTestData } = require('./generate-test-data');
const { testPluginChains } = require('./test-plugin-chains');
const { testPluginsWithQueue } = require('./test-plugins-queue');

// Parse command line arguments
const args = process.argv.slice(2);
const command = args[0] || 'help';
const options = parseOptions(args.slice(1));

// Main function
async function main() {
  console.log('Starting MintFlow Plugin Testing CLI...');
  console.log('Command:', command);
  console.log('Options:', options);
  
  try {
    switch (command) {
      case 'generate-data':
        await generateTestData();
        break;
        
      case 'test-direct':
        process.env.TEST_MODE = 'direct';
        await testPlugins(options.plugin);
        break;
        
      case 'test-node-runner':
        process.env.TEST_MODE = 'node-runner';
        await testPlugins(options.plugin);
        break;
        
      case 'test-queue':
        console.log('Testing plugins with Bull queue...');
        await testPluginsWithQueue(options.plugin);
        break;
        
      case 'test-chain':
        await testPluginChains(options.chain);
        break;
        
      case 'test-all':
        console.log('Running all tests...\n');
        
        console.log('1. Testing plugins directly:');
        process.env.TEST_MODE = 'direct';
        await testPlugins();
        
        console.log('\n2. Testing plugins via Node Runner:');
        process.env.TEST_MODE = 'node-runner';
        await testPlugins();
        
        console.log('\n3. Testing plugins with Bull queue:');
        await testPluginsWithQueue();
        
        console.log('\n4. Testing plugin chains:');
        await testPluginChains();
        break;
        
      case 'help':
      default:
        showHelp();
        break;
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

// Parse command line options
function parseOptions(args) {
  const options = {};
  
  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg.startsWith('--')) {
      const [key, value] = arg.slice(2).split('=');
      options[key] = value || true;
    } else if (arg.startsWith('-')) {
      const key = arg.slice(1);
      const nextArg = args[i + 1];
      
      if (nextArg && !nextArg.startsWith('-')) {
        options[key] = nextArg;
        i++;
      } else {
        options[key] = true;
      }
    } else {
      // Positional argument
      if (!options.plugin && !options.chain) {
        if (command === 'test-chain') {
          options.chain = arg;
        } else {
          options.plugin = arg;
        }
      }
    }
  }
  
  return options;
}

// Show help message
function showHelp() {
  console.log(`
MintFlow Plugin Testing CLI

Usage:
  node scripts/test-plugins-cli.js <command> [options]

Commands:
  generate-data       Generate test data templates for all plugins
  test-direct         Test plugins directly using the sandbox
  test-node-runner    Test plugins via the Node Runner API
  test-queue          Test plugins using Bull queue for asynchronous processing
  test-chain          Test plugin chains
  test-all            Run all tests
  help                Show this help message

Options:
  --plugin=<name>     Test a specific plugin
  --chain=<name>      Test a specific chain
  
Examples:
  # Generate test data templates
  node scripts/test-plugins-cli.js generate-data
  
  # Test a specific plugin directly
  node scripts/test-plugins-cli.js test-direct --plugin=json
  
  # Test all plugins via Node Runner
  node scripts/test-plugins-cli.js test-node-runner
  
  # Test a specific plugin with Bull queue
  node scripts/test-plugins-cli.js test-queue --plugin=json
  
  # Test a specific chain
  node scripts/test-plugins-cli.js test-chain --chain=example-chain
  
  # Run all tests
  node scripts/test-plugins-cli.js test-all
  `);
}

// Run the main function
main().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
