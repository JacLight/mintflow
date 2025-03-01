import axios from 'axios';
import { JotformAuth, jotformUtils } from '../utils/index.js';

export const customApiCall = {
  name: 'custom_api_call',
  displayName: 'Custom API Call',
  description: 'Make a custom API call to the JotForm API',
  inputSchema: {
    type: 'object',
    properties: {
      method: {
        type: 'string',
        description: 'HTTP method',
        enum: ['GET', 'POST', 'PUT', 'DELETE'],
        required: true,
      },
      path: {
        type: 'string',
        description: 'API endpoint path (e.g., "user/forms" or "form/{formId}")',
        required: true,
      },
      queryParams: {
        type: 'object',
        description: 'Query parameters to include in the request',
        required: false,
      },
      body: {
        type: 'object',
        description: 'Request body for POST and PUT requests',
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
    path: 'user/forms',
    queryParams: {
      limit: 10,
      offset: 0,
    },
  },
  exampleOutput: {
    responseCode: 200,
    message: 'success',
    content: [
      {
        id: '230583697150159',
        username: 'user_name',
        title: 'Sample Form',
        height: '539',
        status: 'ENABLED',
        created_at: '2023-03-15 10:30:45',
        updated_at: '2023-03-15 10:30:45',
        last_submission: '2023-03-15 10:30:45',
        new: '0',
        count: '1',
        type: 'LEGACY',
        favorite: '0',
        archived: '0',
        url: 'https://form.jotform.com/230583697150159',
      },
    ],
  },
  async execute(input: any, auth: JotformAuth): Promise<any> {
    const { method, path, queryParams, body } = input;
    
    // Ensure path doesn't start with a slash
    const normalizedPath = path.startsWith('/') ? path.substring(1) : path;
    
    // Construct the full URL
    const url = `${jotformUtils.baseUrl(auth.region)}/${normalizedPath}`;
    
    try {
      const response = await axios({
        method: method,
        url: url,
        headers: {
          APIKEY: auth.apiKey,
          'Content-Type': 'application/json',
        },
        params: queryParams,
        data: body,
      });
      
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(`JotForm API error: ${error.response.status} - ${error.response.data.message || error.response.statusText}`);
      }
      throw new Error(`Failed to make custom API call to JotForm: ${error.message}`);
    }
  },
};
