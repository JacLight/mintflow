import { z } from 'zod';
import axios from 'axios';

export const customApiCall = {
  name: 'custom_api_call',
  displayName: 'Custom API Call',
  description: 'Make a custom API call to Snowflake REST API',
  props: {
    baseUrl: {
      type: 'string',
      displayName: 'Base URL',
      description: 'Snowflake API base URL (e.g., https://account.snowflakecomputing.com/api/v2)',
      required: true,
    },
    endpoint: {
      type: 'string',
      displayName: 'Endpoint',
      description: 'API endpoint path (e.g., /statements)',
      required: true,
    },
    method: {
      type: 'string',
      displayName: 'HTTP Method',
      description: 'HTTP method (GET, POST, PUT, DELETE)',
      required: true,
    },
    headers: {
      type: 'object',
      displayName: 'Headers',
      description: 'HTTP headers',
      required: false,
    },
    queryParams: {
      type: 'object',
      displayName: 'Query Parameters',
      description: 'Query parameters',
      required: false,
    },
    body: {
      type: 'object',
      displayName: 'Request Body',
      description: 'Request body for POST/PUT requests',
      required: false,
    },
    authToken: {
      type: 'string',
      displayName: 'Auth Token',
      description: 'Authentication token for Snowflake API',
      required: true,
    },
  },
  
  async run(context: any) {
    const { baseUrl, endpoint, method, headers, queryParams, body, authToken } = context.propsValue;
    
    try {
      const response = await axios({
        method,
        url: `${baseUrl}${endpoint}`,
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
          ...headers,
        },
        params: queryParams,
        data: body,
      });
      
      return {
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        headers: response.headers,
      };
    } catch (error: any) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        return {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          headers: error.response.headers,
        };
      } else if (error.request) {
        // The request was made but no response was received
        throw new Error(`No response received: ${error.message}`);
      } else {
        // Something happened in setting up the request that triggered an Error
        throw new Error(`Error setting up request: ${error.message}`);
      }
    }
  },
};

export default customApiCall;
