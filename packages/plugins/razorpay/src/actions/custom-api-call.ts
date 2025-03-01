import axios from 'axios';
import { generateRazorpayAuthHeader, RazorpayCredentials, razorpayURL } from '../utils/index.js';

export const customApiCall = {
  name: 'custom_api_call',
  displayName: 'Custom API Call',
  description: 'Make a custom API call to Razorpay API',
  inputSchema: {
    type: 'object',
    properties: {
      method: {
        type: 'string',
        description: 'HTTP method',
        enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        required: true,
      },
      path: {
        type: 'string',
        description: 'Path to append to the base URL (e.g., "payment_links" or "orders")',
        required: true,
      },
      queryParams: {
        type: 'object',
        description: 'Query parameters',
        required: false,
      },
      body: {
        type: 'object',
        description: 'Request body for POST, PUT, and PATCH requests',
        required: false,
      },
    },
    required: ['method', 'path'],
  },
  outputSchema: {
    type: 'object',
    properties: {},
  },
  exampleInput: {
    method: 'GET',
    path: 'payment_links',
    queryParams: {
      count: 10,
    },
  },
  exampleOutput: {
    entity: 'collection',
    count: 1,
    items: [
      {
        id: 'plink_EXdKy9nT9ywKY4',
        entity: 'payment_link',
        amount: 100000,
        currency: 'INR',
        status: 'created',
        description: 'Payment for Order #123',
        short_url: 'https://rzp.io/i/nxrHnLJ',
        created_at: 1591097057,
        expire_by: 1591183457,
      },
    ],
  },
  async execute(input: any, auth: RazorpayCredentials): Promise<any> {
    const { method, path, queryParams, body } = input;
    
    // Ensure path doesn't start with a slash
    const normalizedPath = path.startsWith('/') ? path.substring(1) : path;
    
    // Construct the full URL
    const url = `${razorpayURL.apiURL}${normalizedPath}`;
    
    const authHeader = generateRazorpayAuthHeader(auth);
    
    try {
      const response = await axios({
        method: method,
        url: url,
        headers: {
          ...authHeader,
          'Content-Type': 'application/json',
        },
        params: queryParams,
        data: body,
      });
      
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(`Razorpay API error: ${error.response.status} - ${error.response.data.error?.description || error.response.statusText}`);
      }
      throw new Error(`Failed to make custom API call to Razorpay: ${error.message}`);
    }
  },
};
