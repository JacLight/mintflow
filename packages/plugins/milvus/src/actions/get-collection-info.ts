import axios from 'axios';
import { MilvusConfig } from './list-collections';

export interface GetCollectionInfoProps {
  collectionName: string;
}

export const getCollectionInfo = {
  name: 'get-collection-info',
  displayName: 'Get Collection Info',
  description: 'Get detailed information about a specific collection',
  inputSchema: {
    type: 'object',
    properties: {
      collectionName: {
        type: 'string',
        description: 'The name of the collection to get information about',
        required: true,
      },
    },
  },
  outputSchema: {
    type: 'object',
    properties: {
      collectionInfo: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          id: { type: 'string' },
          fields: { type: 'array' },
          autoID: { type: 'boolean' },
          description: { type: 'string' },
          createdTime: { type: 'string' },
          shardNum: { type: 'number' },
          replicaNum: { type: 'number' },
        },
      },
    },
  },
  async execute(input: GetCollectionInfoProps, config: { auth: MilvusConfig }) {
    try {
      const { host, port, username, password, ssl } = config.auth;
      const protocol = ssl ? 'https' : 'http';
      const baseUrl = `${protocol}://${host}:${port}/api/v1`;
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      // Add authentication if provided
      if (username && password) {
        const authString = Buffer.from(`${username}:${password}`).toString('base64');
        headers['Authorization'] = `Basic ${authString}`;
      }
      
      const response = await axios.get(`${baseUrl}/collections/${input.collectionName}`, { headers });
      
      return {
        collectionInfo: response.data.data,
      };
    } catch (error) {
      console.error(`Error getting Milvus collection info for ${input.collectionName}:`, error);
      throw error;
    }
  },
};
