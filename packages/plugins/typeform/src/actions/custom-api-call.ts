import axios from 'axios';

export const customApiCall = {
  name: 'custom_api_call',
  displayName: 'Custom API Call',
  description: 'Make a custom API call to the Typeform API',
  inputSchema: {
    type: 'object',
    properties: {
      method: {
        type: 'string',
        enum: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        description: 'HTTP method',
        default: 'GET',
      },
      path: {
        type: 'string',
        description: 'Path to append to the base URL (e.g., /forms)',
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
    required: ['method', 'path'],
  },
  outputSchema: {
    type: 'object',
    properties: {
      data: {
        type: 'object',
        description: 'Response data',
      },
      status: {
        type: 'number',
        description: 'HTTP status code',
      },
    },
  },
  async execute(input: any, auth: any) {
    try {
      const baseUrl = 'https://api.typeform.com';
      const url = `${baseUrl}${input.path}`;
      
      const response = await axios({
        method: input.method.toLowerCase(),
        url,
        params: input.queryParams,
        data: ['POST', 'PUT', 'PATCH'].includes(input.method) ? input.body : undefined,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${auth.access_token}`,
        },
      });
      
      return {
        data: response.data,
        status: response.status,
      };
    } catch (error: any) {
      if (error.response) {
        return {
          error: `Error making request: ${error.message}`,
          status: error.response.status,
          details: error.response.data,
        };
      } else {
        return {
          error: `Unexpected error: ${error.message}`,
        };
      }
    }
  },
};
