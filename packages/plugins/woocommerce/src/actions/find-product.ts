import { wooCommon } from '../common/index.js';

export const wooFindProduct = {
  name: 'find_product',
  displayName: 'Find Product',
  description: 'Finds a product in WooCommerce by ID or SKU',
  
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'number',
        description: 'The ID of the product to find',
      },
      sku: {
        type: 'string',
        description: 'The SKU of the product to find',
      },
    },
    oneOf: [
      { required: ['id'] },
      { required: ['sku'] },
    ],
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
        description: 'The product data if found',
      },
      error: {
        type: 'string',
        description: 'The error message if the operation failed',
      },
    },
  },
  
  async execute(input: any, auth: any) {
    if (input.id) {
      return await wooCommon.makeRequest(
        'GET',
        `/wp-json/wc/v3/products/${input.id}`,
        auth
      );
    } else if (input.sku) {
      const response = await wooCommon.makeRequest(
        'GET',
        '/wp-json/wc/v3/products',
        auth,
        undefined,
        { sku: input.sku }
      );
      
      if (response.success && Array.isArray(response.data) && response.data.length > 0) {
        return {
          success: true,
          data: response.data[0],
        };
      } else if (response.success && Array.isArray(response.data) && response.data.length === 0) {
        return {
          success: false,
          error: 'Product not found',
        };
      }
      
      return response;
    }
    
    return {
      success: false,
      error: 'Either id or sku must be provided',
    };
  },
};
