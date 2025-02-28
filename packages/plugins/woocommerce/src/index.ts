import { wooCommon } from './common/index.js';
import { wooCreateCustomer } from './actions/create-customer.js';
import { wooFindCustomer } from './actions/find-customer.js';
import { wooCreateProduct } from './actions/create-product.js';
import { wooFindProduct } from './actions/find-product.js';
import { wooCreateCoupon } from './actions/create-coupon.js';
import { triggers } from './triggers/index.js';

export const wooAuth = {
  type: 'custom',
  displayName: 'WooCommerce Authentication',
  description: `
To generate your API credentials, follow the steps below:
1. Go to WooCommerce -> Settings -> Advanced tab -> REST API.
2. Click on Add Key to create a new key.
3. Enter the key description and change the permissions to Read/Write.
4. Click Generate Key.
5. Copy the Consumer Key and Consumer Secret into the fields below. You will not be able to view the Consumer Secret after exiting the page.

Note that the base URL of your WooCommerce instance needs to be on a secure (HTTPS) connection, or the plugin will not work even on local instances on the same device.
`,
  required: true,
  properties: {
    baseUrl: {
      type: 'string',
      displayName: 'Base URL',
      description: 'The base URL of your app (e.g https://mystore.com) and it should start with HTTPS only',
      required: true,
    },
    consumerKey: {
      type: 'string',
      displayName: 'Consumer Key',
      description: 'The consumer key generated from your app',
      required: true,
    },
    consumerSecret: {
      type: 'string',
      displayName: 'Consumer Secret',
      description: 'The consumer secret generated from your app',
      required: true,
      secret: true,
    },
  },
  validate: async ({ auth }: { auth: any }) => {
    const baseUrl = auth.baseUrl;
    if (!baseUrl.match(/^(https):\/\//)) {
      return {
        valid: false,
        error: 'Base URL must start with https (e.g https://mystore.com)',
      };
    }
    return { valid: true };
  },
};

export const customApiCall = {
  name: 'custom_api_call',
  displayName: 'Custom API Call',
  description: 'Make a custom API call to the WooCommerce API',
  
  inputSchema: {
    type: 'object',
    required: ['method', 'path'],
    properties: {
      method: {
        type: 'string',
        enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
        description: 'HTTP method',
        default: 'GET',
      },
      path: {
        type: 'string',
        description: 'Path to append to the base URL (e.g., /wp-json/wc/v3/products)',
      },
      queryParams: {
        type: 'object',
        description: 'Query parameters',
        additionalProperties: true,
      },
      body: {
        type: 'object',
        description: 'Request body for POST, PUT, and PATCH requests',
        additionalProperties: true,
      },
    },
  },
  
  outputSchema: {
    type: 'object',
    properties: {
      success: {
        type: 'boolean',
        description: 'Whether the operation was successful',
      },
      data: {
        type: 'object',
        description: 'Response data',
      },
      error: {
        type: 'string',
        description: 'The error message if the operation failed',
      },
    },
  },
  
  async execute(input: any, auth: any) {
    return await wooCommon.makeRequest(
      input.method,
      input.path,
      auth,
      input.body,
      input.queryParams
    );
  },
};

export default {
  name: 'woocommerce',
  displayName: 'WooCommerce',
  description: 'E-commerce platform built on WordPress',
  logoUrl: 'https://cdn.activepieces.com/pieces/woocommerce.png',
  auth: wooAuth,
  actions: [
    wooCreateCustomer,
    wooFindCustomer,
    wooCreateProduct,
    wooFindProduct,
    wooCreateCoupon,
    customApiCall,
  ],
  triggers,
};
