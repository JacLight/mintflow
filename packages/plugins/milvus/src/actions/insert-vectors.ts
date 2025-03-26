import axios from 'axios';
import { MilvusConfig } from './list-collections.js';

export interface InsertVectorsProps {
  collectionName: string;
  partitionName?: string;
  data: Record<string, any>[];
}

export const insertVectors = {
  name: 'insert-vectors',
  displayName: 'Insert Vectors',
  description: 'Insert vectors into a Milvus collection',
  inputSchema: {
    type: 'object',
    properties: {
      collectionName: {
        type: 'string',
        description: 'The name of the collection to insert vectors into',
        required: true,
      },
      partitionName: {
        type: 'string',
        description: 'The name of the partition to insert vectors into (optional)',
        required: false,
      },
      data: {
        type: 'array',
        description: 'The data to insert (array of objects with field names as keys)',
        items: {
          type: 'object',
        },
        required: true,
      },
    },
  },
  outputSchema: {
    type: 'object',
    properties: {
      insertCount: { type: 'number' },
      ids: { 
        type: 'array',
        items: {
          type: 'string',
        },
      },
    },
  },
  async execute(input: InsertVectorsProps, config: { auth: MilvusConfig }) {
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
      
      // Prepare the request body
      const requestBody: any = {
        collection_name: input.collectionName,
        data: input.data,
      };
      
      if (input.partitionName) {
        requestBody.partition_name = input.partitionName;
      }
      
      const response = await axios.post(`${baseUrl}/vectors/insert`, requestBody, { headers });
      
      return {
        insertCount: input.data.length,
        ids: response.data.data.ids || [],
      };
    } catch (error) {
      console.error(`Error inserting vectors into Milvus collection ${input.collectionName}:`, error);
      throw error;
    }
  },
};
