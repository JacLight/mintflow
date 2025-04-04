# MintFlow Plugin Testing Framework

This document describes the plugin testing framework for MintFlow, which allows you to test plugins in isolation and in real-world conditions.

## Overview

The testing framework provides several ways to test plugins:

1. **Direct Testing**: Test plugins directly in a sandbox environment
2. **Node Runner Testing**: Test plugins via the Node Runner API
3. **Chain Testing**: Test plugins in a chain of connected nodes

## Prerequisites

- Node.js v16 or higher
- Redis (for queue-based testing)
- Isolated-VM package for sandboxed execution

## Installation

```bash
# Install dependencies
pnpm install

# Install isolated-vm (if not already installed)
pnpm install isolated-vm
```

## Test Data

Test data for plugins is stored in the `test-data` directory. Each plugin should have its own JSON file with the following structure:

```json
{
  "pluginId": "plugin-name",
  "actions": {
    "action_name": {
      "input": {
        // Input data for the action
      }
    }
  }
}
```

For example, the JSON plugin test data might look like:

```json
{
  "pluginId": "json",
  "actions": {
    "convert_text_to_json": {
      "input": {
        "text": "{\"name\": \"Test User\", \"email\": \"test@example.com\"}"
      }
    },
    "convert_json_to_text": {
      "input": {
        "data": {
          "name": "Test User",
          "email": "test@example.com"
        },
        "pretty": true
      }
    }
  }
}
```

## Credentials

For plugins that require credentials, you can store them in `test-data/credentials.json`:

```json
{
  "google": {
    "clientId": "YOUR_CLIENT_ID",
    "clientSecret": "YOUR_CLIENT_SECRET",
    "refreshToken": "YOUR_REFRESH_TOKEN"
  },
  "slack": {
    "token": "YOUR_SLACK_TOKEN"
  }
}
```

You can reference these credentials in your test data using placeholders:

```json
{
  "input": {
    "apiKey": "{{google.clientId}}"
  }
}
```

## Running Tests

### Testing a Specific Plugin

```bash
# Test a specific plugin directly
node scripts/test-plugins-cli.js test-direct --plugin=json

# Test a specific plugin via Node Runner
node scripts/test-plugins-cli.js test-node-runner --plugin=json

# Test a specific plugin with Bull queue
node scripts/test-plugins-cli.js test-queue --plugin=json
```

### Testing All Plugins

```bash
# Test all plugins
node scripts/test-plugins-cli.js test-all
```

### Testing Plugin Chains

```bash
# Test a specific chain
node scripts/test-plugins-cli.js test-chain --chain=data-processing-chain
```

## Test Reports

Test reports are saved in the `test-reports` directory with timestamps. Each report includes:

- Total number of tests
- Number of passed tests
- Number of failed tests
- Detailed results for each test

The detailed results for each test include:

```json
{
  "pluginId": "json",                // The ID of the plugin
  "actionName": "convertTextToJson", // The name of the action
  "nodeType": "json",                // The type of node
  "action": "Convert Text to JSON",  // Human-readable description of the action
  "success": true,                   // Whether the test passed or failed
  "input": {                         // The input data
    "text": "{\"name\": \"Test User\", \"email\": \"test@example.com\"}"
  },
  "output": {                        // The output data
    "result": {
      "name": "Test User",
      "email": "test@example.com"
    }
  }
}
```

This comprehensive test report format allows you to see exactly what was tested, with what input, and what the expected output was.

## Adding New Tests

To add tests for a new plugin:

1. Create a test data file in `test-data/<plugin-name>.json`
2. Add test inputs for each action in the plugin
3. Run the tests using the CLI

## Testing in Real Conditions with Bull Queue

For testing plugins in real-world conditions with asynchronous processing, the framework uses Bull queue. This approach simulates how plugins would be executed in a production environment with distributed processing.

### Benefits of Queue-Based Testing

- **Asynchronous Processing**: Tests run asynchronously, allowing for parallel execution
- **Concurrency Control**: Limit the number of concurrent tests to avoid overloading the system
- **Retry Mechanism**: Automatically retry failed tests with exponential backoff
- **Job Monitoring**: Track the progress of tests in real-time
- **Distributed Testing**: Run tests across multiple workers or machines

### How It Works

1. The framework discovers plugins and their actions
2. For each action, a job is added to the Bull queue
3. Worker processes pick up jobs and execute the plugin actions
4. Results are collected and a report is generated

### Example Implementation

```javascript
// Create a Bull queue for plugin testing
const testQueue = new Queue('plugin-tests', {
  redis: {
    host: CONFIG.REDIS_HOST,
    port: CONFIG.REDIS_PORT
  },
  defaultJobOptions: {
    attempts: 3,         // Retry failed jobs up to 3 times
    backoff: {
      type: 'exponential',
      delay: 1000        // Start with 1 second delay, then increase exponentially
    },
    timeout: 30000       // 30 seconds timeout
  }
});

// Add jobs to the queue
for (const plugin of plugins) {
  for (const actionName of plugin.actions) {
    await testQueue.add('test-plugin', {
      pluginId: plugin.pluginId,
      actionName,
      pluginCode,
      actionTestData
    });
  }
}

// Process jobs with controlled concurrency
testQueue.process('test-plugin', 5, async (job) => {
  const { pluginId, actionName, pluginCode, actionTestData } = job.data;
  
  // Execute the plugin action
  const result = await runIsolatedCode(wrapperCode, 'main', actionTestData);
  
  return {
    pluginId,
    actionName,
    nodeType: pluginId,
    action: actionDescription,
    success: true,
    input: actionTestData,
    output: result
  };
});

// Listen for completed jobs
testQueue.on('completed', (job, result) => {
  // Update test results
});

// Listen for failed jobs
testQueue.on('failed', (job, error) => {
  // Handle failures
});
```

### Running Queue-Based Tests

To run tests using the Bull queue:

```bash
# Make sure Redis is running
redis-server

# Run tests for a specific plugin
node scripts/test-plugins-cli.js test-queue --plugin=json

# Run tests for all plugins
node scripts/test-plugins-cli.js test-queue
```

## Troubleshooting

### Common Issues

- **Module not found**: Make sure all dependencies are installed
- **Redis connection error**: Check that Redis is running
- **Sandbox errors**: Check that isolated-vm is properly installed
- **Plugin not found**: Verify the plugin ID is correct
- **Action not found**: Check that the action name matches the plugin's implementation

### Debugging

Set the `DEBUG` environment variable to enable debug logging:

```bash
DEBUG=true node scripts/test-plugins-cli.js test-direct --plugin=json
```

## Contributing

When adding new features to the testing framework:

1. Update the documentation
2. Add tests for the new features
3. Ensure backward compatibility

## License

This testing framework is part of the MintFlow project and is subject to the same license terms.
