import axios from 'axios';
import { MilvusConfig } from './list-collections';

export interface SearchVectorsProps {
  collectionName: string;
  partitionNames?: string[];
  vectorField: string;
  vectors: number[][];
  topK: number;
  outputFields?: string[];
  filter?: string;
  metricType?: string;
  params?: Record<string, any>;
}

export const searchVectors = {
  name: 'search-vectors',
  displayName: 'Search Vectors',
  description: 'Search for similar vectors in a Milvus collection',
  inputSchema: {
    type: 'object',
    properties: {
      collectionName: {
        type: 'string',
        description: 'The name of the collection to search in',
        required: true,
      },
      partitionNames: {
        type: 'array',
        description: 'The names of the partitions to search in (optional)',
        items: {
          type: 'string',
        },
        required: false,
      },
      vectorField: {
        type: 'string',
        description: 'The name of the vector field to search',
        required: true,
      },
      vectors: {
        type: 'array',
        description: 'The vectors to search with (array of vector arrays)',
        items: {
          type: 'array',
          items: {
            type: 'number',
          },
        },
        required: true,
      },
      topK: {
        type: 'number',
        description: 'The number of nearest neighbors to return',
        required: true,
      },
      outputFields: {
        type: 'array',
        description: 'The fields to include in the output (optional)',
        items: {
          type: 'string',
        },
        required: false,
      },
      filter: {
        type: 'string',
        description: 'Filter expression to apply to the search (optional)',
        required: false,
      },
      metricType: {
        type: 'string',
        description: 'The metric type to use for the search (optional)',
        enum: ['L2', 'IP', 'COSINE', 'HAMMING', 'JACCARD'],
        required: false,
      },
      params: {
        type: 'object',
        description: 'Additional search parameters (optional)',
        required: false,
      },
    },
  },
  outputSchema: {
    type: 'object',
    properties: {
      results: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            distance: { type: 'number' },
            entity: { type: 'object' },
          },
        },
      },
    },
  },
  async execute(input: SearchVectorsProps, config: { auth: MilvusConfig }) {
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
        vector_field: input.vectorField,
        vectors: input.vectors,
        topk: input.topK,
      };
      
      if (input.partitionNames && input.partitionNames.length > 0) {
        requestBody.partition_names = input.partitionNames;
      }
      
      if (input.outputFields && input.outputFields.length > 0) {
        requestBody.output_fields = input.outputFields;
      }
      
      if (input.filter) {
        requestBody.filter = input.filter;
      }
      
      if (input.metricType) {
        requestBody.metric_type = input.metricType;
      }
      
      if (input.params) {
        requestBody.params = input.params;
      }
      
      const response = await axios.post(`${baseUrl}/vectors/search`, requestBody, { headers });
      
      return {
        results: response.data.data.results,
      };
    } catch (error) {
      console.error(`Error searching vectors in Milvus collection ${input.collectionName}:`, error);
      throw error;
    }
  },
};
