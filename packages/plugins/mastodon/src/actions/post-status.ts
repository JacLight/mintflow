import { z } from 'zod';
import { MastodonClient } from '../utils/index.js';

export const postStatus = {
  name: 'post_status',
  displayName: 'Post Status',
  description: 'Post a status to Mastodon',
  inputSchema: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        description: 'The text of your status',
        required: true,
      },
      mediaBase64: {
        type: 'string',
        description: 'Base64-encoded media to attach to the status (optional)',
        required: false,
      },
      mediaFilename: {
        type: 'string',
        description: 'Filename for the media attachment (required if mediaBase64 is provided)',
        required: false,
      },
      mediaDescription: {
        type: 'string',
        description: 'Description of the media for accessibility (optional)',
        required: false,
      },
      visibility: {
        type: 'string',
        description: 'Visibility of the status',
        enum: ['public', 'unlisted', 'private', 'direct'],
        default: 'public',
        required: false,
      },
      sensitive: {
        type: 'boolean',
        description: 'Whether the status contains sensitive content',
        default: false,
        required: false,
      },
      spoilerText: {
        type: 'string',
        description: 'Text to be shown as a spoiler warning',
        required: false,
      },
    },
    required: ['status'],
  },
  outputSchema: {
    type: 'object',
    properties: {
      status: {
        type: 'object',
        description: 'The posted status',
      },
    },
  },
  exampleInput: {
    status: 'Hello, Mastodon!',
    visibility: 'public',
  },
  exampleOutput: {
    status: {
      id: '123456789',
      created_at: '2023-01-01T00:00:00.000Z',
      in_reply_to_id: null,
      in_reply_to_account_id: null,
      sensitive: false,
      spoiler_text: '',
      visibility: 'public',
      language: 'en',
      uri: 'https://mastodon.social/users/user/statuses/123456789',
      url: 'https://mastodon.social/@user/123456789',
      replies_count: 0,
      reblogs_count: 0,
      favourites_count: 0,
      content: '<p>Hello, Mastodon!</p>',
      account: {
        id: '123456789',
        username: 'user',
        acct: 'user',
        display_name: 'User Name',
      },
      media_attachments: [],
      mentions: [],
      tags: [],
      emojis: [],
    },
  },
  async execute(input: any, auth: any): Promise<any> {
    try {
      // Validate input
      const statusSchema = z.string().min(1);
      const visibilitySchema = z.enum(['public', 'unlisted', 'private', 'direct']).optional();
      const sensitiveSchema = z.boolean().optional();
      const spoilerTextSchema = z.string().optional();
      const mediaBase64Schema = z.string().optional();
      const mediaFilenameSchema = z.string().optional();
      const mediaDescriptionSchema = z.string().optional();
      
      try {
        statusSchema.parse(input.status);
        if (input.visibility) visibilitySchema.parse(input.visibility);
        if (input.sensitive !== undefined) sensitiveSchema.parse(input.sensitive);
        if (input.spoilerText) spoilerTextSchema.parse(input.spoilerText);
        if (input.mediaBase64) {
          mediaBase64Schema.parse(input.mediaBase64);
          // If media is provided, filename is required
          if (!input.mediaFilename) {
            throw new Error('mediaFilename is required when mediaBase64 is provided');
          }
          mediaFilenameSchema.parse(input.mediaFilename);
        }
        if (input.mediaDescription) mediaDescriptionSchema.parse(input.mediaDescription);
      } catch (error) {
        throw new Error(`Invalid input: ${(error as Error).message}`);
      }

      // Create Mastodon client
      const client = new MastodonClient({
        baseUrl: auth.baseUrl,
        accessToken: auth.accessToken,
      });

      // Handle media upload if provided
      let mediaIds: string[] | undefined;
      if (input.mediaBase64) {
        const fileBuffer = Buffer.from(input.mediaBase64, 'base64');
        const mediaResponse = await client.uploadMedia(
          fileBuffer,
          input.mediaFilename,
          input.mediaDescription
        );
        mediaIds = [mediaResponse.id];
      }

      // Post the status
      const status = await client.postStatus(
        input.status,
        mediaIds,
        input.visibility,
        input.sensitive,
        input.spoilerText
      );

      return {
        status,
      };
    } catch (error: any) {
      throw new Error(`Failed to post status: ${error.message}`);
    }
  },
};
