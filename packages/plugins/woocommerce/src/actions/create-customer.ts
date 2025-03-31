import { wooCommon } from '../common/index.js';

export const wooCreateCustomer = {
  name: 'create_customer',
  displayName: 'Create Customer',
  description: 'Creates a new customer in WooCommerce',
  
  inputSchema: {
    type: 'object',
    required: ['email'],
    properties: {
      email: {
        type: 'string',
        description: 'The email address of the customer',
      },
      first_name: {
        type: 'string',
        description: 'The first name of the customer',
      },
      last_name: {
        type: 'string',
        description: 'The last name of the customer',
      },
      username: {
        type: 'string',
        description: 'The username of the customer',
      },
      password: {
        type: 'string',
        description: 'The password of the customer',
      },
      billing: {
        type: 'object',
        description: 'The billing information of the customer',
        properties: {
          first_name: {
            type: 'string',
            description: 'The first name for billing',
          },
          last_name: {
            type: 'string',
            description: 'The last name for billing',
          },
          company: {
            type: 'string',
            description: 'The company name for billing',
          },
          address_1: {
            type: 'string',
            description: 'The first line of the address for billing',
          },
          address_2: {
            type: 'string',
            description: 'The second line of the address for billing',
          },
          city: {
            type: 'string',
            description: 'The city for billing',
          },
          state: {
            type: 'string',
            description: 'The state for billing',
          },
          postcode: {
            type: 'string',
            description: 'The postcode for billing',
          },
          country: {
            type: 'string',
            description: 'The country for billing (2-letter ISO code)',
          },
          email: {
            type: 'string',
            description: 'The email address for billing',
          },
          phone: {
            type: 'string',
            description: 'The phone number for billing',
          },
        },
      },
      shipping: {
        type: 'object',
        description: 'The shipping information of the customer',
        properties: {
          first_name: {
            type: 'string',
            description: 'The first name for shipping',
          },
          last_name: {
            type: 'string',
            description: 'The last name for shipping',
          },
          company: {
            type: 'string',
            description: 'The company name for shipping',
          },
          address_1: {
            type: 'string',
            description: 'The first line of the address for shipping',
          },
          address_2: {
            type: 'string',
            description: 'The second line of the address for shipping',
          },
          city: {
            type: 'string',
            description: 'The city for shipping',
          },
          state: {
            type: 'string',
            description: 'The state for shipping',
          },
          postcode: {
            type: 'string',
            description: 'The postcode for shipping',
          },
          country: {
            type: 'string',
            description: 'The country for shipping (2-letter ISO code)',
          },
        },
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
        description: 'The created customer data',
      },
      error: {
        type: 'string',
        description: 'The error message if the operation failed',
      },
    },
  },
  
  async execute(input: any, auth: any) {
    return await wooCommon.makeRequest(
      'POST',
      '/wp-json/wc/v3/customers',
      auth,
      input
    );
  },
};
