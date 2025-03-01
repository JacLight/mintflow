import { z } from 'zod';
import { RedditClient } from '../utils/index.js';

export const submitPost = {
  name: 'submit_post',
  displayName: 'Submit Post',
  description: 'Submit a new post to a subreddit',
  inputSchema: {
    type: 'object',
    properties: {
      subreddit: {
        type: 'string',
        description: 'The name of the subreddit to submit to',
        required: true,
      },
      title: {
        type: 'string',
        description: 'The title of the post',
        required: true,
      },
      content: {
        type: 'string',
        description: 'The content of the post (text or URL)',
        required: true,
      },
      kind: {
        type: 'string',
        description: 'The kind of post to submit',
        enum: ['self', 'link'],
        default: 'self',
        required: true,
      },
    },
    required: ['subreddit', 'title', 'content', 'kind'],
  },
  outputSchema: {
    type: 'object',
    properties: {
      post: {
        type: 'object',
        description: 'The submitted post',
      },
    },
  },
  exampleInput: {
    subreddit: 'test',
    title: 'Test Post',
    content: 'This is a test post',
    kind: 'self',
  },
  exampleOutput: {
    post: {
      json: {
        errors: [],
        data: {
          url: 'https://www.reddit.com/r/test/comments/abcdef/test_post/',
          id: 'abcdef',
          name: 't3_abcdef',
        },
      },
    },
  },
  async execute(input: any, auth: any): Promise<any> {
    try {
      // Validate input
      const subredditSchema = z.string().min(1);
      const titleSchema = z.string().min(1);
      const contentSchema = z.string().min(1);
      const kindSchema = z.enum(['self', 'link']);
      
      try {
        subredditSchema.parse(input.subreddit);
        titleSchema.parse(input.title);
        contentSchema.parse(input.content);
        kindSchema.parse(input.kind);
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

      // Submit the post
      const post = await client.submitPost(
        input.subreddit,
        input.title,
        input.content,
        input.kind
      );

      return {
        post,
      };
    } catch (error: any) {
      throw new Error(`Failed to submit post: ${error.message}`);
    }
  },
};
