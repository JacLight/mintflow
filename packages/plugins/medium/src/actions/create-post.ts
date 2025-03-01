import { z } from 'zod';
import { MediumClient } from '../utils/index.js';

export const createPost = {
  name: 'create_post',
  displayName: 'Create Post',
  description: 'Create a new post on Medium',
  inputSchema: {
    type: 'object',
    properties: {
      title: {
        type: 'string',
        description: 'The title of the post',
        required: true,
      },
      content: {
        type: 'string',
        description: 'The content of the post',
        required: true,
      },
      contentFormat: {
        type: 'string',
        description: 'The format of the content',
        enum: ['html', 'markdown'],
        default: 'markdown',
        required: true,
      },
      tags: {
        type: 'array',
        description: 'Tags for the post',
        items: {
          type: 'string',
        },
        required: false,
      },
      canonicalUrl: {
        type: 'string',
        description: 'The canonical URL of the post, if it was originally published elsewhere',
        required: false,
      },
      publishStatus: {
        type: 'string',
        description: 'The publish status of the post',
        enum: ['public', 'draft', 'unlisted'],
        default: 'public',
        required: false,
      },
      notifyFollowers: {
        type: 'boolean',
        description: 'Whether to notify followers that the post was published',
        default: true,
        required: false,
      },
      publicationId: {
        type: 'string',
        description: 'The ID of the publication to publish to. If not provided, the post will be published to the user\'s profile.',
        required: false,
      },
    },
    required: ['title', 'content', 'contentFormat'],
  },
  outputSchema: {
    type: 'object',
    properties: {
      post: {
        type: 'object',
        description: 'The created post',
        properties: {
          id: {
            type: 'string',
            description: 'The post ID',
          },
          title: {
            type: 'string',
            description: 'The post title',
          },
          authorId: {
            type: 'string',
            description: 'The author ID',
          },
          url: {
            type: 'string',
            description: 'The post URL',
          },
          canonicalUrl: {
            type: 'string',
            description: 'The canonical URL',
          },
          publishStatus: {
            type: 'string',
            description: 'The publish status',
          },
          publishedAt: {
            type: 'string',
            description: 'The publication date',
          },
          license: {
            type: 'string',
            description: 'The license',
          },
          licenseUrl: {
            type: 'string',
            description: 'The license URL',
          },
        },
      },
    },
  },
  exampleInput: {
    title: 'My First Post',
    content: '# Hello World\n\nThis is my first post on Medium!',
    contentFormat: 'markdown',
    tags: ['test', 'first-post'],
    publishStatus: 'draft',
  },
  exampleOutput: {
    post: {
      id: '1234567890abcdef',
      title: 'My First Post',
      authorId: '1234567890abcdef',
      url: 'https://medium.com/@username/my-first-post-1234567890ab',
      canonicalUrl: '',
      publishStatus: 'draft',
      publishedAt: '2025-02-28T12:34:56.789Z',
      license: 'all-rights-reserved',
      licenseUrl: 'https://medium.com/policy/9db0094a1e0f',
    },
  },
  async execute(input: any, auth: any): Promise<any> {
    try {
      // Validate input
      const titleSchema = z.string().min(1);
      const contentSchema = z.string().min(1);
      const contentFormatSchema = z.enum(['html', 'markdown']);
      const publishStatusSchema = z.enum(['public', 'draft', 'unlisted']).optional();
      const tagsSchema = z.array(z.string()).optional();
      const canonicalUrlSchema = z.string().url().optional();
      const notifyFollowersSchema = z.boolean().optional();
      const publicationIdSchema = z.string().optional();
      
      try {
        titleSchema.parse(input.title);
        contentSchema.parse(input.content);
        contentFormatSchema.parse(input.contentFormat);
        
        if (input.publishStatus) {
          publishStatusSchema.parse(input.publishStatus);
        }
        
        if (input.tags) {
          tagsSchema.parse(input.tags);
        }
        
        if (input.canonicalUrl) {
          canonicalUrlSchema.parse(input.canonicalUrl);
        }
        
        if (input.notifyFollowers !== undefined) {
          notifyFollowersSchema.parse(input.notifyFollowers);
        }
        
        if (input.publicationId) {
          publicationIdSchema.parse(input.publicationId);
        }
      } catch (error) {
        throw new Error(`Invalid input: ${(error as Error).message}`);
      }

      // Create Medium client
      const client = new MediumClient({
        integrationToken: auth.integrationToken,
      });

      // Get the user ID
      const userResponse = await client.getMe();
      const userId = userResponse.data.id;

      // Create the post
      const postData = {
        title: input.title,
        contentFormat: input.contentFormat,
        content: input.content,
        tags: input.tags,
        canonicalUrl: input.canonicalUrl,
        publishStatus: input.publishStatus,
        notifyFollowers: input.notifyFollowers,
        publicationId: input.publicationId,
      };

      const response = await client.createPost(userId, postData);

      return {
        post: response.data,
      };
    } catch (error: any) {
      throw new Error(`Failed to create post: ${error.message}`);
    }
  },
};
