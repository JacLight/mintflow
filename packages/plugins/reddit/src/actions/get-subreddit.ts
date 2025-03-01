import { z } from 'zod';
import { RedditClient } from '../utils/index.js';

export const getSubreddit = {
  name: 'get_subreddit',
  displayName: 'Get Subreddit',
  description: 'Get information about a subreddit',
  inputSchema: {
    type: 'object',
    properties: {
      subreddit: {
        type: 'string',
        description: 'The name of the subreddit to get information about',
        required: true,
      },
    },
    required: ['subreddit'],
  },
  outputSchema: {
    type: 'object',
    properties: {
      subreddit: {
        type: 'object',
        description: 'The subreddit information',
      },
    },
  },
  exampleInput: {
    subreddit: 'programming',
  },
  exampleOutput: {
    subreddit: {
      kind: 't5',
      data: {
        display_name: 'programming',
        title: 'Programming',
        subscribers: 5000000,
        description: 'Computer Programming',
        created_utc: 1201233135.0,
      },
    },
  },
  async execute(input: any, auth: any): Promise<any> {
    try {
      // Validate input
      const subredditSchema = z.string().min(1);
      
      try {
        subredditSchema.parse(input.subreddit);
      } catch (error) {
        throw new Error(`Invalid input: ${(error as Error).message}`);
      }

      // Create Reddit client
      const client = new RedditClient({
        clientId: auth.clientId,
        clientSecret: auth.clientSecret,
        username: auth.username,
        password: auth.password,
        userAgent: auth.userAgent,
      });

      // Get the subreddit
      const subreddit = await client.getSubreddit(input.subreddit);

      return {
        subreddit,
      };
    } catch (error: any) {
      throw new Error(`Failed to get subreddit: ${error.message}`);
    }
  },
};
