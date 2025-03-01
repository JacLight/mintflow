import { z } from 'zod';
import { MediumClient } from '../utils/index.js';

export const getUser = {
  name: 'get_user',
  displayName: 'Get User',
  description: 'Get information about the authenticated Medium user',
  inputSchema: {
    type: 'object',
    properties: {},
    required: [],
  },
  outputSchema: {
    type: 'object',
    properties: {
      user: {
        type: 'object',
        description: 'The user information',
        properties: {
          id: {
            type: 'string',
            description: 'The user ID',
          },
          username: {
            type: 'string',
            description: 'The user username',
          },
          name: {
            type: 'string',
            description: 'The user display name',
          },
          url: {
            type: 'string',
            description: 'The user profile URL',
          },
          imageUrl: {
            type: 'string',
            description: 'The user profile image URL',
          },
        },
      },
    },
  },
  exampleInput: {},
  exampleOutput: {
    user: {
      id: '1234567890abcdef',
      username: 'username',
      name: 'User Name',
      url: 'https://medium.com/@username',
      imageUrl: 'https://cdn-images-1.medium.com/fit/c/200/200/1*abcdefg.jpeg',
    },
  },
  async execute(input: any, auth: any): Promise<any> {
    try {
      // Create Medium client
      const client = new MediumClient({
        integrationToken: auth.integrationToken,
      });

      // Get the user
      const response = await client.getMe();

      return {
        user: response.data,
      };
    } catch (error: any) {
      throw new Error(`Failed to get user: ${error.message}`);
    }
  },
};
