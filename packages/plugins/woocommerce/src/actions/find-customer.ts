import { wooCommon } from '../common/index.js';

export const wooFindCustomer = {
  name: 'find_customer',
  displayName: 'Find Customer',
  description: 'Finds a customer in WooCommerce by email or ID',
  
  inputSchema: {
    type: 'object',
    properties: {
      id: {
        type: 'number',
        description: 'The ID of the customer to find',
      },
      email: {
        type: 'string',
        description: 'The email address of the customer to find',
      },
    },
    oneOf: [
      { required: ['id'] },
      { required: ['email'] },
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
        description: 'The customer data if found',
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
        `/wp-json/wc/v3/customers/${input.id}`,
        auth
      );
    } else if (input.email) {
      const response = await wooCommon.makeRequest(
        'GET',
        '/wp-json/wc/v3/customers',
        auth,
        undefined,
        { email: input.email }
      );
      
      if (response.success && Array.isArray(response.data) && response.data.length > 0) {
        return {
          success: true,
          data: response.data[0],
        };
      } else if (response.success && Array.isArray(response.data) && response.data.length === 0) {
        return {
          success: false,
          error: 'Customer not found',
        };
      }
      
      return response;
    }
    
    return {
      success: false,
      error: 'Either id or email must be provided',
    };
  },
};
