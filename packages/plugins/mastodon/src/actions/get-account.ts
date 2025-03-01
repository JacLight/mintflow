import { z } from 'zod';
import { MastodonClient } from '../utils/index.js';

export const getAccount = {
  name: 'get_account',
  displayName: 'Get Account',
  description: 'Get a Mastodon account by ID',
  inputSchema: {
    type: 'object',
    properties: {
      accountId: {
        type: 'string',
        description: 'The ID of the account to retrieve',
        required: true,
      },
    },
    required: ['accountId'],
  },
  outputSchema: {
    type: 'object',
    properties: {
      account: {
        type: 'object',
        description: 'The account data',
      },
    },
  },
  exampleInput: {
    accountId: '123456789',
  },
  exampleOutput: {
    account: {
      id: '123456789',
      username: 'user',
      acct: 'user',
      display_name: 'User Name',
      locked: false,
      bot: false,
      created_at: '2023-01-01T00:00:00.000Z',
      note: 'User bio',
      url: 'https://mastodon.social/@user',
      avatar: 'https://mastodon.social/avatars/original/missing.png',
      avatar_static: 'https://mastodon.social/avatars/original/missing.png',
      header: 'https://mastodon.social/headers/original/missing.png',
      header_static: 'https://mastodon.social/headers/original/missing.png',
      followers_count: 100,
      following_count: 100,
      statuses_count: 100,
      last_status_at: '2023-01-01',
      emojis: [],
      fields: []
    },
  },
  async execute(input: any, auth: any): Promise<any> {
    try {
      // Validate input
      const accountIdSchema = z.string().min(1);
      
      try {
        accountIdSchema.parse(input.accountId);
      } catch (error) {
        throw new Error(`Invalid input: ${(error as Error).message}`);
      }

      // Create Mastodon client
      const client = new MastodonClient({
        baseUrl: auth.baseUrl,
        accessToken: auth.accessToken,
      });

      // Get the account
      const account = await client.getAccount(input.accountId);

      return {
        account,
      };
    } catch (error: any) {
      throw new Error(`Failed to get account: ${error.message}`);
    }
  },
};
