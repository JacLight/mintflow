import axios from 'axios';

export const customApiCall = {
  name: 'custom_api_call',
  displayName: 'Custom API Call',
  description: 'Make a custom API call to the Groq API.',
  inputSchema: {
    type: 'object',
    properties: {
      endpoint: {
        type: 'string',
        description: 'The Groq API endpoint to call (without the base URL)',
        required: true,
      },
      method: {
        type: 'string',
        description: 'The HTTP method to use',
        enum: ['GET', 'POST', 'PUT', 'DELETE'],
        default: 'GET',
        required: true,
      },
      body: {
        type: 'object',
        description: 'The request body (for POST, PUT methods)',
        required: false,
      },
      queryParams: {
        type: 'object',
        description: 'Query parameters to include in the request',
        required: false,
      },
      headers: {
        type: 'object',
        description: 'Additional headers to include in the request',
        required: false,
      },
    },
    required: ['endpoint', 'method'],
  },
  outputSchema: {
    type: 'object',
    properties: {
      data: {
        type: 'object',
        description: 'The response data from the API',
      },
      status: {
        type: 'number',
        description: 'The HTTP status code of the response',
      },
      headers: {
        type: 'object',
        description: 'The response headers',
      },
    },
  },
  exampleInput: {
    endpoint: 'models',
    method: 'GET',
    queryParams: {
      limit: 10,
    },
  },
  exampleOutput: {
    data: {
      object: 'list',
      data: [
        {
          id: 'llama-3.1-70b-versatile',
          object: 'model',
          created: 1717027200,
          owned_by: 'groq',
        },
        {
          id: 'llama-3.1-8b-versatile',
          object: 'model',
          created: 1717027200,
          owned_by: 'groq',
        },
      ],
    },
    status: 200,
    headers: {
      'content-type': 'application/json',
    },
  },
  async execute(input: any, auth: { apiKey: string }): Promise<any> {
    const { endpoint, method, body, queryParams, headers } = input;
    const baseUrl = 'https://api.groq.com/openai/v1';
    
    try {
      const response = await axios({
        method,
        url: `${baseUrl}/${endpoint.replace(/^\//, '')}`,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${auth.apiKey}`,
          ...headers,
        },
        params: queryParams,
        data: body,
      });

      return {
        data: response.data,
        status: response.status,
        headers: response.headers,
      };
    } catch (error: any) {
      if (error.response) {
        throw new Error(`Groq API error: ${error.response.status} - ${error.response.data.error?.message || error.response.statusText}`);
      }
      throw new Error(`Failed to make request to Groq: ${error.message}`);
    }
  },
};
