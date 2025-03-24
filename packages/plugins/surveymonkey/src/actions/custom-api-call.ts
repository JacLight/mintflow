import axios from 'axios';
import { SurveyMonkeyAuth, smUtils } from '../utils/index.js';

export const customApiCall = {
  name: 'custom_api_call',
  displayName: 'Custom API Call',
  description: 'Make a custom API call to the SurveyMonkey API',
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
        description: 'API endpoint path (e.g., "surveys" or "surveys/{survey_id}/responses")',
        required: true,
      },
      queryParams: {
        type: 'object',
        description: 'Query parameters to include in the request',
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
    path: 'surveys',
    queryParams: {
      page: 1,
      per_page: 10,
    },
  },
  exampleOutput: {
    data: [
      {
        id: '123456789',
        title: 'Customer Satisfaction Survey',
        nickname: '',
        language: 'en',
        folder_id: '0',
        category: 'customer_feedback',
        question_count: 10,
        page_count: 2,
        response_count: 25,
        date_created: '2023-03-15T10:30:45+00:00',
        date_modified: '2023-03-15T10:30:45+00:00',
        buttons_text: {
          next_button: 'Next',
          prev_button: 'Prev',
          done_button: 'Done',
          exit_button: 'Exit',
        },
        is_owner: true,
        footer: true,
        theme_id: '123456',
        custom_variables: {},
        href: 'https://api.surveymonkey.com/v3/surveys/123456789',
      },
    ],
    per_page: 10,
    page: 1,
    total: 1,
    links: {
      self: 'https://api.surveymonkey.com/v3/surveys?page=1&per_page=10',
    },
  },
  async execute(input: any, auth: SurveyMonkeyAuth): Promise<any> {
    const { method, path, queryParams, body } = input;
    
    // Ensure path doesn't start with a slash
    const normalizedPath = path.startsWith('/') ? path.substring(1) : path;
    
    // Construct the full URL
    const url = `${smUtils.baseUrl}/${normalizedPath}`;
    
    try {
      const response = await axios({
        method: method,
        url: url,
        headers: {
          Authorization: `Bearer ${auth.access_token}`,
          'Content-Type': 'application/json',
        },
        params: queryParams,
        data: body,
      });
      
      return response.data;
    } catch (error: any) {
      if (error.response) {
        throw new Error(`SurveyMonkey API error: ${error.response.status} - ${error.response.data.error?.message || error.response.statusText}`);
      }
      throw new Error(`Failed to make custom API call to SurveyMonkey: ${error.message}`);
    }
  },
};
