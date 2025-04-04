# Plugin Testing Guide

This guide explains how to test plugins in the MintFlow platform using the structured test data approach.

## Test Data Structure

Test data for plugins is organized in a structured directory hierarchy:

```
test-data/
  ├── {plugin-name}/
  │   ├── {action-name}.json
  │   ├── {another-action}.json
  │   └── ...
  ├── {another-plugin}/
  │   └── ...
  └── credentials.json (optional)
```

Each plugin has its own directory, and each action within that plugin has its own JSON file. This structure makes it easy to organize and maintain test data for all plugins and their actions.

## Test Data Format

Each test data file follows this format:

```json
{
  "input": {
    // Input parameters for the action
    "param1": "value1",
    "param2": "value2",
    // ...
  },
  "expected": {
    // Expected output from the action
    // This can be an object, array, string, number, etc.
  }
}
```

The `input` object contains the parameters that will be passed to the action. The `expected` object contains the expected output from the action, which can be used for validation.

## Creating Test Data

To create test data for a plugin:

1. Create a directory for the plugin in the `test-data` directory:
   ```bash
   mkdir -p test-data/{plugin-name}
   ```

2. For each action in the plugin, create a JSON file with the action name:
   ```bash
   touch test-data/{plugin-name}/{action-name}.json
   ```

3. Edit the JSON file to include the input parameters and expected output:
   ```json
   {
     "input": {
       // Input parameters
     },
     "expected": {
       // Expected output
     }
   }
   ```

## Running Tests

You can use the `test-plugin-data.js` script to run tests:

```bash
# Test all utility plugins
node scripts/test-plugin-data.js

# Test a specific plugin
node scripts/test-plugin-data.js --plugin=array

# Test a specific action
node scripts/test-plugin-data.js --plugin=array --action=filter
```

The script will:
1. Load the test data for the specified plugin(s) and action(s)
2. Execute each action with its test data
3. Compare the results with the expected output
4. Generate a comprehensive report of the results

Alternatively, you can use the `test-plugins-real-world.js` script, which tests plugins in a more integrated way:

```bash
# Test all utility plugins
node scripts/test-plugins-real-world.js

# Test a specific plugin
node scripts/test-plugins-real-world.js --plugin=array

# Test a specific action
node scripts/test-plugins-real-world.js --plugin=array --action=filter
```

## Test Reports

Test reports are generated in the `plugin-test-reports` directory. Two types of reports are generated:

1. JSON report: Contains detailed information about the test results
2. HTML report: A user-friendly visualization of the test results

The HTML report includes:
- A summary of the test results
- A navigation section to quickly jump to specific plugins
- Detailed information about each plugin and its actions
- The output and any errors from each test

## Adding New Plugins

When adding a new plugin, follow these steps to ensure it's properly tested:

1. Create a directory for the plugin in the `test-data` directory
2. Create test data files for each action in the plugin
3. Add the plugin to the `UTILITY_PLUGINS` list in `scripts/test-plugins-real-world.js` if it's a utility plugin
4. Run the tests to verify that the plugin works as expected

## Best Practices

- Create comprehensive test data that covers various scenarios and edge cases
- Include both valid and invalid inputs to test error handling
- Keep test data files small and focused on a single action
- Use descriptive names for test data files
- Document any special requirements or dependencies for the tests
- Regularly run tests to catch regressions early
