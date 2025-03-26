#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
const readdirAsync = promisify(fs.readdir);
const statAsync = promisify(fs.stat);

// Define plugin categories with appropriate groups and tags
const pluginCategories = {
  // AI and ML related plugins
  ai: {
    groups: ['ai'],
    tags: ['ai', 'nlp', 'ml', 'gpt', 'chatbot', 'image', 'text', 'embedding'],
  },
  // Email and communication related plugins
  email: {
    groups: ['communication'],
    tags: ['email', 'messaging', 'communication', 'notification'],
  },
  // Social media related plugins
  social: {
    groups: ['social'],
    tags: ['social', 'media', 'platform', 'network', 'sharing'],
  },
  // Data storage and database related plugins
  data: {
    groups: ['data'],
    tags: ['data', 'storage', 'database', 'query', 'persistence'],
  },
  // File and document related plugins
  file: {
    groups: ['file'],
    tags: ['file', 'document', 'storage', 'media', 'content'],
  },
  // Payment and finance related plugins
  payment: {
    groups: ['payment'],
    tags: ['payment', 'finance', 'money', 'transaction', 'billing'],
  },
  // CRM and marketing related plugins
  crm: {
    groups: ['crm'],
    tags: ['crm', 'marketing', 'customer', 'lead', 'sales'],
  },
  // Productivity and collaboration related plugins
  productivity: {
    groups: ['productivity'],
    tags: ['productivity', 'collaboration', 'organization', 'workflow', 'task'],
  },
  // Utility plugins
  utility: {
    groups: ['utility'],
    tags: ['utility', 'tool', 'helper', 'function', 'operation'],
  },
  // Integration plugins
  integration: {
    groups: ['integration'],
    tags: ['integration', 'connector', 'api', 'service', 'platform'],
  },
  // Communication and messaging plugins
  communication: {
    groups: ['communication'],
    tags: ['communication', 'messaging', 'chat', 'notification', 'alert'],
  },
  // Analytics and reporting plugins
  analytics: {
    groups: ['analytics'],
    tags: ['analytics', 'reporting', 'metrics', 'statistics', 'tracking'],
  },
  // E-commerce related plugins
  ecommerce: {
    groups: ['ecommerce'],
    tags: ['ecommerce', 'shop', 'store', 'product', 'order'],
  },
  // Development tools
  development: {
    groups: ['development'],
    tags: ['development', 'code', 'programming', 'debugging', 'testing'],
  }
};

  // Map plugin IDs to their categories
const pluginCategoryMap = {
  // AI and ML related plugins
  'ai': 'ai',
  'google-ai': 'ai',
  'perplexity-ai': 'ai',
  'stability-ai': 'ai',
  'stable-diffusion': 'ai',
  'groq': 'ai',
  'llm': 'ai',
  'langchain': 'ai',
  'langflow': 'ai',
  'speech': 'ai',
  'photoroom': 'ai',
  'assemblyai': 'ai',
  
  // Email and communication related plugins
  'mail': 'email',
  'sendgrid': 'email',
  'mailchimp': 'email',
  'convertkit': 'email',
  
  // Social media related plugins
  'facebook': 'social',
  'instagram': 'social',
  'linkedin': 'social',
  'twitter': 'social',
  'pinterest': 'social',
  'tiktok': 'social',
  'youtube': 'social',
  'reddit': 'social',
  'mastodon': 'social',
  'snapchat': 'social',
  'medium': 'social',
  
  // Data storage and database related plugins
  'mysql': 'data',
  'postgres': 'data',
  'redis': 'data',
  'supabase': 'data',
  'pinecone': 'data',
  'milvus': 'data',
  'qdrant': 'data',
  'snowflake': 'data',
  
  // File and document related plugins
  'file': 'file',
  'pdf': 'file',
  's3-storage': 'file',
  'dropbox': 'file',
  'google-drive': 'file',
  
  // Payment and finance related plugins
  'stripe': 'payment',
  'paypal': 'payment',
  'square': 'payment',
  'razorpay': 'payment',
  'quickbooks': 'payment',
  'quickbooks-migrate': 'payment',
  'xero': 'payment',
  'freshbooks': 'payment',
  'invoiceninja': 'payment',
  
  // CRM and marketing related plugins
  'hubspot': 'crm',
  'salesforce': 'crm',
  'activecampaign': 'crm',
  'klaviyo': 'crm',
  'intercom': 'crm',
  'pipedrive': 'crm',
  'google-business': 'crm',
  
  // Productivity and collaboration related plugins
  'asana': 'productivity',
  'trello': 'productivity',
  'notion': 'productivity',
  'clickup': 'productivity',
  'monday': 'productivity',
  'basecamp': 'productivity',
  'jira-cloud': 'productivity',
  'confluence': 'productivity',
  'google-sheets': 'productivity',
  'microsoft-office': 'productivity',
  'airtable': 'productivity',
  'google-workspace': 'productivity',
  'figma': 'productivity',
  'range': 'productivity',
  'tally': 'productivity',
  'typeform': 'productivity',
  'jotform': 'productivity',
  'surveymonkey': 'productivity',
  'calendly': 'productivity',
  'calcom': 'productivity',
  
  // Utility plugins
  'array': 'utility',
  'crypto': 'utility',
  'csv': 'utility',
  'json': 'utility',
  'xml': 'utility',
  'text-parser': 'utility',
  'qrcode': 'utility',
  'delay': 'utility',
  'timer': 'utility',
  'switch': 'utility',
  'modify': 'utility',
  'start': 'utility',
  'queue': 'utility',
  'inject': 'utility',
  'translation': 'utility',
  'media-processor': 'utility',
  
  // Integration plugins
  'fetch': 'integration',
  'webhook': 'integration',
  'soap': 'integration',
  'apollo': 'integration',
  'data-bridge': 'integration',
  'exec': 'integration',
  'mqtt': 'integration',
  'sns': 'integration',
  'sqs': 'integration',
  
  // Communication and messaging plugins
  'slack': 'communication',
  'discord': 'communication',
  'teams': 'communication',
  'telegram': 'communication',
  'whatsapp': 'communication',
  'twilio': 'communication',
  'mattermost': 'communication',
  'zoom': 'communication',
  'krisp-call': 'communication',
  
  // Analytics and reporting plugins
  'google-search': 'analytics',
  
  // E-commerce related plugins
  'shopify': 'ecommerce',
  'woocommerce': 'ecommerce',
  'webflow': 'ecommerce',
  
  // Development tools
  'github': 'development',
  
  // Customer support and service plugins
  'zendesk': 'crm',
  'freshdesk': 'crm',
  
  // CMS plugins
  'wordpress': 'integration',
  
  // Authentication plugins
  'authorize': 'utility',
  
  // Default category for any plugins not explicitly mapped
  'default': 'utility'
};

// Function to recursively find all index.ts files in the plugins directory
async function findIndexFiles(dir) {
  const files = await readdirAsync(dir);
  const indexFiles = [];

  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = await statAsync(filePath);

    if (stat.isDirectory()) {
      // Skip node_modules and other non-plugin directories
      if (file === 'node_modules' || file === 'build' || file === 'dist') {
        continue;
      }
      
      // Recursively search subdirectories
      const subDirFiles = await findIndexFiles(filePath);
      indexFiles.push(...subDirFiles);
    } else if (file === 'index.ts' && dir.includes('/src')) {
      indexFiles.push(filePath);
    }
  }

  return indexFiles;
}

// Function to get the plugin ID from the file path
function getPluginIdFromPath(filePath) {
  // Extract the plugin ID from the file path
  // Example: /plugins/google-sheets/src/index.ts -> google-sheets
  const match = filePath.match(/\/plugins\/([^/]+)\/src\/index\.ts$/);
  return match ? match[1] : null;
}

// Function to update a plugin schema file
async function updatePluginSchema(filePath) {
  try {
    let content = await readFileAsync(filePath, 'utf8');
    
    // Get the plugin ID from the file path
    const pluginId = getPluginIdFromPath(filePath);
    if (!pluginId) {
      console.log(`Skipping ${filePath} - could not determine plugin ID`);
      return false;
    }
    
    // Get the category for this plugin
    const category = pluginCategoryMap[pluginId] || 'default';
    const { groups, tags } = pluginCategories[category];
    
    // Format the properties to add
    const propertiesToAdd = `
    groups: ${JSON.stringify(groups)},
    tags: ${JSON.stringify(tags)},
    version: '1.0.0',`;
    
    // Skip if the file already has the properties
    if (content.includes(`groups: ${JSON.stringify(groups)}`) && 
        content.includes(`tags: ${JSON.stringify(tags)}`) && 
        content.includes("version: '1.0.0'")) {
      console.log(`Skipping ${filePath} - already has the required properties`);
      return false;
    }
    
    // Find the plugin schema object
    const pluginRegex = /const\s+(\w+Plugin)\s*=\s*{[^}]*?(?:actions|triggers|runner|id)[^}]*?}/s;
    const pluginMatch = content.match(pluginRegex);
    if (!pluginMatch) {
      console.log(`Skipping ${filePath} - could not find plugin schema`);
      return false;
    }
    
    const pluginVarName = pluginMatch[1];
    const pluginSchema = pluginMatch[0];
    
    // Find where to insert the properties
    let modifiedSchema = pluginSchema;
    
    // Check if the schema already has any of the properties we want to add
    const hasGroups = /groups\s*:/.test(pluginSchema);
    const hasTags = /tags\s*:/.test(pluginSchema);
    const hasVersion = /version\s*:/.test(pluginSchema);
    
    if (hasGroups || hasTags || hasVersion) {
      // If any of the properties already exist, we need to update them individually
      if (hasGroups) {
        modifiedSchema = modifiedSchema.replace(/groups\s*:\s*\[[^\]]*\],?/s, `groups: ${JSON.stringify(groups)},`);
      }
      if (hasTags) {
        modifiedSchema = modifiedSchema.replace(/tags\s*:\s*\[[^\]]*\],?/s, `tags: ${JSON.stringify(tags)},`);
      }
      if (hasVersion) {
        modifiedSchema = modifiedSchema.replace(/version\s*:\s*['"][^'"]*['"],?/s, `version: '1.0.0',`);
      }
    } else {
      // If none of the properties exist, insert them after description or documentation
      const insertAfterRegex = /(documentation\s*:|description\s*:)\s*['"][^'"]*['"],?/;
      const insertAfterMatch = modifiedSchema.match(insertAfterRegex);
      
      if (insertAfterMatch) {
        const insertPosition = insertAfterMatch.index + insertAfterMatch[0].length;
        modifiedSchema = modifiedSchema.slice(0, insertPosition) + propertiesToAdd + modifiedSchema.slice(insertPosition);
      } else {
        // If no description or documentation, insert after name or id
        const insertAfterNameRegex = /(name\s*:|id\s*:)\s*['"][^'"]*['"],?/;
        const insertAfterNameMatch = modifiedSchema.match(insertAfterNameRegex);
        
        if (insertAfterNameMatch) {
          const insertPosition = insertAfterNameMatch.index + insertAfterNameMatch[0].length;
          modifiedSchema = modifiedSchema.slice(0, insertPosition) + propertiesToAdd + modifiedSchema.slice(insertPosition);
        } else {
          console.log(`Skipping ${filePath} - could not find insertion point`);
          return false;
        }
      }
    }
    
    // Replace the original schema with the modified one
    const modifiedContent = content.replace(pluginSchema, modifiedSchema);
    
    // Write the modified content back to the file
    await writeFileAsync(filePath, modifiedContent, 'utf8');
    console.log(`Updated ${filePath}`);
    return true;
  } catch (error) {
    console.error(`Error updating ${filePath}:`, error);
    return false;
  }
}

// Main function
async function main() {
  try {
    // Find all plugin index files
    const indexFiles = await findIndexFiles(path.resolve(__dirname));
    console.log(`Found ${indexFiles.length} plugin index files`);
    
    // Update each plugin schema
    let updatedCount = 0;
    for (const filePath of indexFiles) {
      const updated = await updatePluginSchema(filePath);
      if (updated) {
        updatedCount++;
      }
    }
    
    console.log(`Updated ${updatedCount} plugin schemas`);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

// Run the main function
main();
