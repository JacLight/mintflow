import axios from 'axios';
import { MilvusConfig } from './list-collections.js';

export interface DeleteCollectionProps {
  collectionName: string;
}

export const deleteCollection = {
  name: 'delete-collection',
  displayName: 'Delete Collection',
  description: 'Delete a collection from Milvus',
  inputSchema: {
    type: 'object',
    properties: {
      collectionName: {
        type: 'string',
        description: 'The name of the collection to delete',
        required: true,
      },
    },
  },
  outputSchema: {
    type: 'object',
    properties: {
      message: { type: 'string' },
    },
  },
  async execute(input: DeleteCollectionProps, config: { auth: MilvusConfig }) {
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
      
      await axios.delete(`${baseUrl}/collections/${input.collectionName}`, { headers });
      
      return {
        message: `Collection ${input.collectionName} deleted successfully`,
      };
    } catch (error) {
      console.error(`Error deleting Milvus collection ${input.collectionName}:`, error);
      throw error;
    }
  },
};
