import axios from 'axios';
import { MilvusConfig } from './list-collections';

export interface FieldSchema {
  name: string;
  description?: string;
  dataType: string;
  isPrimaryKey?: boolean;
  autoID?: boolean;
  dimensions?: number;
}

export interface CreateCollectionProps {
  collectionName: string;
  description?: string;
  fields: FieldSchema[];
  shardNum?: number;
  replicaNum?: number;
}

export const createCollection = {
  name: 'create-collection',
  displayName: 'Create Collection',
  description: 'Create a new collection in Milvus',
  inputSchema: {
    type: 'object',
    properties: {
      collectionName: {
        type: 'string',
        description: 'The name of the collection to create',
        required: true,
      },
      description: {
        type: 'string',
        description: 'Description of the collection',
        required: false,
      },
      fields: {
        type: 'array',
        description: 'Field schemas for the collection',
        items: {
          type: 'object',
          properties: {
            name: {
              type: 'string',
              description: 'Field name',
              required: true,
            },
            description: {
              type: 'string',
              description: 'Field description',
              required: false,
            },
            dataType: {
              type: 'string',
              description: 'Data type of the field',
              enum: ['Int64', 'Float', 'String', 'Bool', 'VectorFloat', 'VectorBinary'],
              required: true,
            },
            isPrimaryKey: {
              type: 'boolean',
              description: 'Whether this field is the primary key',
              required: false,
            },
            autoID: {
              type: 'boolean',
              description: 'Whether to automatically generate IDs for this field',
              required: false,
            },
            dimensions: {
              type: 'number',
              description: 'Dimensions for vector fields',
              required: false,
            },
          },
        },
        required: true,
      },
      shardNum: {
        type: 'number',
        description: 'Number of shards for the collection',
        required: false,
      },
      replicaNum: {
        type: 'number',
        description: 'Number of replicas for the collection',
        required: false,
      },
    },
  },
  outputSchema: {
    type: 'object',
    properties: {
      message: { type: 'string' },
    },
  },
  async execute(input: CreateCollectionProps, config: { auth: MilvusConfig }) {
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
        fields: input.fields.map(field => ({
          name: field.name,
          description: field.description || '',
          data_type: field.dataType,
          is_primary_key: field.isPrimaryKey || false,
          autoID: field.autoID || false,
          ...(field.dimensions ? { dimensions: field.dimensions } : {}),
        })),
      };
      
      if (input.description) {
        requestBody.description = input.description;
      }
      
      if (input.shardNum) {
        requestBody.shard_num = input.shardNum;
      }
      
      if (input.replicaNum) {
        requestBody.replica_num = input.replicaNum;
      }
      
      await axios.post(`${baseUrl}/collections`, requestBody, { headers });
      
      return {
        message: `Collection ${input.collectionName} created successfully`,
      };
    } catch (error) {
      console.error(`Error creating Milvus collection ${input.collectionName}:`, error);
      throw error;
    }
  },
};
