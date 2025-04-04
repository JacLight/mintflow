const fs = require('fs');
const path = require('path');

// Configuration
const PLUGINS_DIR = path.join(__dirname, '../packages/plugins');
const TEST_DATA_DIR = path.join(__dirname, '../test-data');

// Main function
async function generateTestData() {
  console.log('Generating test data templates for all plugins...');
  
  // Create test data directory if it doesn't exist
  if (!fs.existsSync(TEST_DATA_DIR)) {
    fs.mkdirSync(TEST_DATA_DIR, { recursive: true });
  }
  
  // Discover plugins
  const plugins = discoverPlugins();
  console.log(`Discovered ${plugins.length} plugins`);
  
  // Generate test data for each plugin
  for (const plugin of plugins) {
    generatePluginTestData(plugin);
  }
  
  // Generate credentials template
  generateCredentialsTemplate(plugins);
  
  console.log(`\nTest data templates generated in ${TEST_DATA_DIR}`);
  console.log('Please edit these files to add your actual test data and credentials.');
}

// Discover all plugins
function discoverPlugins() {
  const pluginDirs = fs.readdirSync(PLUGINS_DIR)
    .filter(dir => fs.statSync(path.join(PLUGINS_DIR, dir)).isDirectory())
    .filter(dir => !dir.startsWith('.') && dir !== 'node_modules');
  
  const plugins = [];
  
  for (const pluginId of pluginDirs) {
    const indexFile = path.join(PLUGINS_DIR, pluginId, 'src', 'index.ts');
    if (!fs.existsSync(indexFile)) {
      console.log(`Skipping ${pluginId}: No index.ts found`);
      continue;
    }
    
    const pluginCode = fs.readFileSync(indexFile, 'utf8');
    const actions = extractActionsFromCode(pluginCode);
    const authRequirements = extractAuthRequirements(pluginCode, pluginId);
    
    if (actions.length === 0) {
      console.log(`Skipping ${pluginId}: No actions found`);
      continue;
    }
    
    plugins.push({
      pluginId,
      actions,
      authRequirements
    });
  }
  
  return plugins;
}

// Extract actions from plugin code
function extractActionsFromCode(code) {
  const actionRegex = /actions\s*:\s*{([^}]*)}/gs;
  const actionsMatch = actionRegex.exec(code);
  
  if (!actionsMatch) {
    return [];
  }
  
  const actionsBlock = actionsMatch[1];
  const actionNameRegex = /['"]([^'"]+)['"]\s*:/g;
  const actions = [];
  let match;
  
  while ((match = actionNameRegex.exec(actionsBlock)) !== null) {
    const actionName = match[1];
    
    // Try to extract input schema for this action
    const inputSchema = extractInputSchema(code, actionName);
    
    actions.push({
      name: actionName,
      inputSchema
    });
  }
  
  return actions;
}

// Extract input schema for an action
function extractInputSchema(code, actionName) {
  // This is a simplified approach - in a real implementation, you'd want to parse
  // the TypeScript code more thoroughly to extract the exact schema
  const actionRegex = new RegExp(`['"]${actionName}['"]\\s*:\\s*{([^}]*)}`, 'gs');
  const actionMatch = actionRegex.exec(code);
  
  if (!actionMatch) {
    return {};
  }
  
  const actionBlock = actionMatch[1];
  
  // Look for input parameters in the handler function
  const handlerRegex = /handler\s*:\s*async\s*\(\s*([^)]*)\s*\)/;
  const handlerMatch = handlerRegex.exec(actionBlock);
  
  if (!handlerMatch || !handlerMatch[1]) {
    return {};
  }
  
  // Parse parameter names
  const paramNames = handlerMatch[1].split(',').map(p => {
    const parts = p.trim().split(':');
    return parts[0].trim();
  });
  
  // Create a basic schema
  const schema = {};
  paramNames.forEach(param => {
    schema[param] = { type: 'any' };
  });
  
  return schema;
}

// Extract authentication requirements
function extractAuthRequirements(code, pluginId) {
  // This is a simplified approach - in a real implementation, you'd want to parse
  // the TypeScript code more thoroughly
  
  // Check for common auth patterns
  const hasOAuth = code.includes('oauth') || code.includes('OAuth');
  const hasApiKey = code.includes('apiKey') || code.includes('API_KEY');
  const hasToken = code.includes('token') || code.includes('TOKEN');
  const hasCredentials = code.includes('credentials') || code.includes('CREDENTIALS');
  
  // Determine auth type based on plugin ID and code analysis
  let authType = 'none';
  if (hasOAuth) {
    authType = 'oauth';
  } else if (hasApiKey) {
    authType = 'apiKey';
  } else if (hasToken) {
    authType = 'token';
  } else if (hasCredentials) {
    authType = 'credentials';
  }
  
  // Return auth requirements
  return {
    type: authType,
    required: authType !== 'none'
  };
}

// Generate test data for a plugin
function generatePluginTestData(plugin) {
  const { pluginId, actions, authRequirements } = plugin;
  console.log(`Generating test data for ${pluginId}...`);
  
  // Create test data object
  const testData = {
    pluginId,
    actions: {}
  };
  
  // Add actions
  for (const action of actions) {
    testData.actions[action.name] = {
      input: generateInputForAction(action, pluginId, authRequirements)
    };
  }
  
  // Save to file
  const outputFile = path.join(TEST_DATA_DIR, `${pluginId}.json`);
  
  // Don't overwrite existing test data
  if (fs.existsSync(outputFile)) {
    console.log(`  Test data for ${pluginId} already exists, skipping`);
    return;
  }
  
  fs.writeFileSync(outputFile, JSON.stringify(testData, null, 2));
  console.log(`  Created test data template for ${pluginId}`);
}

// Generate input data for an action
function generateInputForAction(action, pluginId, authRequirements) {
  const { name, inputSchema } = action;
  
  // Start with empty input
  const input = {};
  
  // Add auth if required
  if (authRequirements.required) {
    switch (authRequirements.type) {
      case 'oauth':
        input.credentials = {
          accessToken: `{{${pluginId}.accessToken}}`,
          refreshToken: `{{${pluginId}.refreshToken}}`
        };
        break;
      case 'apiKey':
        input.credentials = {
          apiKey: `{{${pluginId}.apiKey}}`
        };
        break;
      case 'token':
        input.credentials = {
          token: `{{${pluginId}.token}}`
        };
        break;
      case 'credentials':
        input.credentials = {
          username: `{{${pluginId}.username}}`,
          password: `{{${pluginId}.password}}`
        };
        break;
    }
  }
  
  // Add parameters based on schema and plugin type
  addParametersBasedOnPluginType(input, pluginId, name);
  
  return input;
}

// Add parameters based on plugin type and action name
function addParametersBasedOnPluginType(input, pluginId, actionName) {
  // Social media plugins
  if (['facebook', 'twitter', 'instagram', 'linkedin', 'pinterest'].includes(pluginId)) {
    if (actionName.includes('post') || actionName.includes('create')) {
      input.message = 'Test message from automated testing';
      input.media = 'https://example.com/test-image.jpg';
    } else if (actionName.includes('get') || actionName.includes('list')) {
      input.limit = 5;
    }
  }
  
  // Email plugins
  else if (['mail', 'sendgrid', 'mailchimp'].includes(pluginId)) {
    if (actionName.includes('send')) {
      input.to = 'test@example.com';
      input.subject = 'Test email from automated testing';
      input.body = 'This is a test email from the automated plugin testing system.';
    } else if (actionName.includes('subscribe')) {
      input.email = 'test@example.com';
      input.listId = 'your-list-id';
    }
  }
  
  // Database plugins
  else if (['mysql', 'postgres', 'redis', 'mongodb'].includes(pluginId)) {
    if (actionName.includes('query') || actionName.includes('execute')) {
      input.query = 'SELECT 1';
    } else if (actionName.includes('insert')) {
      input.table = 'test_table';
      input.data = { test_column: 'test_value' };
    }
  }
  
  // File plugins
  else if (['file', 's3', 'dropbox', 'google-drive'].includes(pluginId)) {
    if (actionName.includes('read') || actionName.includes('get')) {
      input.path = '/test/file.txt';
    } else if (actionName.includes('write') || actionName.includes('upload')) {
      input.path = '/test/file.txt';
      input.content = 'Test content';
    }
  }
  
  // AI plugins
  else if (['ai', 'llm', 'google-ai', 'stability-ai'].includes(pluginId)) {
    if (actionName.includes('complete') || actionName.includes('generate')) {
      input.prompt = 'Write a short test message';
      input.maxTokens = 100;
    }
  }
  
  // Default for other plugins
  else {
    input.testParam = `Test value for ${pluginId}:${actionName}`;
  }
}

// Generate credentials template
function generateCredentialsTemplate(plugins) {
  console.log('Generating credentials template...');
  
  const credentialsFile = path.join(TEST_DATA_DIR, 'credentials.json');
  
  // Don't overwrite existing credentials
  if (fs.existsSync(credentialsFile)) {
    console.log('  Credentials file already exists, skipping');
    return;
  }
  
  // Create credentials template
  const credentials = {
    "_comment": "Replace placeholder values with actual credentials. Never commit this file to version control."
  };
  
  // Add credentials for each plugin with auth requirements
  for (const plugin of plugins) {
    if (plugin.authRequirements.required) {
      switch (plugin.authRequirements.type) {
        case 'oauth':
          credentials[plugin.pluginId] = {
            accessToken: "YOUR_ACCESS_TOKEN",
            refreshToken: "YOUR_REFRESH_TOKEN",
            clientId: "YOUR_CLIENT_ID",
            clientSecret: "YOUR_CLIENT_SECRET"
          };
          break;
        case 'apiKey':
          credentials[plugin.pluginId] = {
            apiKey: "YOUR_API_KEY"
          };
          break;
        case 'token':
          credentials[plugin.pluginId] = {
            token: "YOUR_TOKEN"
          };
          break;
        case 'credentials':
          credentials[plugin.pluginId] = {
            username: "YOUR_USERNAME",
            password: "YOUR_PASSWORD"
          };
          break;
      }
    }
  }
  
  // Add common service credentials
  credentials.google = {
    clientId: "YOUR_GOOGLE_CLIENT_ID",
    clientSecret: "YOUR_GOOGLE_CLIENT_SECRET",
    refreshToken: "YOUR_GOOGLE_REFRESH_TOKEN"
  };
  
  credentials.slack = {
    token: "YOUR_SLACK_BOT_TOKEN"
  };
  
  credentials.aws = {
    accessKeyId: "YOUR_AWS_ACCESS_KEY_ID",
    secretAccessKey: "YOUR_AWS_SECRET_ACCESS_KEY",
    region: "YOUR_AWS_REGION"
  };
  
  // Save to file
  fs.writeFileSync(credentialsFile, JSON.stringify(credentials, null, 2));
  console.log('  Created credentials template');
}

// Run if called directly
if (require.main === module) {
  generateTestData().catch(error => {
    console.error('Error generating test data:', error);
    process.exit(1);
  });
}

module.exports = {
  generateTestData
};
