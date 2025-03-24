/**
 * Vector Store Plugin for Langflow integration
 * 
 * This plugin provides actions for working with vector stores in Langflow.
 */

import { defaultRunnerClient } from '../utils/runner.js';
import { mintflowToLangflowConfig, langflowToMintflowResult } from '../utils/conversion.js';

// Type definitions
export interface VectorStoreConfig {
  type: 'chroma' | 'faiss' | 'pinecone' | 'qdrant' | 'weaviate' | 'redis' | 'milvus';
  config: {
    apiKey?: string;
    url?: string;
    namespace?: string;
    collectionName?: string;
    [key: string]: any;
  };
}

export interface VectorStoreResult {
  id: string;
  type: string;
  namespace: string;
  documentCount?: number;
  dimensions?: number;
  [key: string]: any;
}

export interface SearchResult {
  content: string;
  metadata: Record<string, any>;
  score: number;
  id?: string;
}

/**
 * Vector Store Plugin
 */
const vectorStorePlugin = {
  name: 'Vector Store',
  icon: 'GiDatabase',
  description: 'Vector store operations for Langflow',
  id: 'vectorStore',
  runner: 'python',
  inputSchema: {
    type: 'object',
    properties: {
      type: { type: 'string' },
      config: { type: 'object' }
    }
  },
  outputSchema: {
    type: 'object',
    properties: {
      result: { type: 'object' }
    }
  },
  documentation: 'https://github.com/mintflow/plugin-langflow',
  method: 'exec',
  actions: [
    {
      name: 'Create Vector Store',
      description: 'Create a new vector store',
      id: 'createVectorStore',
      inputSchema: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['chroma', 'faiss', 'pinecone', 'qdrant', 'weaviate', 'redis', 'milvus'],
            description: 'The type of vector store to create'
          },
          config: {
            type: 'object',
            properties: {
              apiKey: { type: 'string', description: 'API key for the vector store' },
              url: { type: 'string', description: 'URL or path for the vector store' },
              namespace: { type: 'string', description: 'Namespace or collection name' },
              collectionName: { type: 'string', description: 'Collection name (for some vector stores)' }
            }
          }
        },
        required: ['type']
      },
      outputSchema: {
        type: 'object',
        properties: {
          result: {
            type: 'object',
            properties: {
              id: { type: 'string', description: 'The ID of the created vector store' },
              type: { type: 'string', description: 'The type of vector store' },
              namespace: { type: 'string', description: 'The namespace of the vector store' }
            }
          }
        }
      },
      async exec(input: VectorStoreConfig): Promise<{ result: VectorStoreResult }> {
        try {
          // Convert MintFlow config to Langflow config
          const langflowConfig = mintflowToLangflowConfig(input.config);
          
          // Execute the task
          const result = await defaultRunnerClient.executeVectorStoreTask<VectorStoreResult>(
            'create_vector_store',
            {
              type: input.type,
              ...langflowConfig
            },
            {}
          );
          
          // Return the result
          return { result };
        } catch (error: any) {
          throw new Error(`Failed to create vector store: ${error?.message || 'Unknown error'}`);
        }
      }
    },
    {
      name: 'Add Documents',
      description: 'Add documents to a vector store',
      id: 'addDocuments',
      inputSchema: {
        type: 'object',
        properties: {
          vectorStoreId: { type: 'string', description: 'The ID of the vector store' },
          documents: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                content: { type: 'string', description: 'The content of the document' },
                metadata: { type: 'object', description: 'Metadata for the document' }
              },
              required: ['content']
            },
            description: 'The documents to add'
          },
          embeddings: {
            type: 'array',
            items: {
              type: 'array',
              items: { type: 'number' }
            },
            description: 'Pre-computed embeddings for the documents'
          }
        },
        required: ['vectorStoreId', 'documents']
      },
      outputSchema: {
        type: 'object',
        properties: {
          result: {
            type: 'object',
            properties: {
              count: { type: 'number', description: 'The number of documents added' },
              ids: { type: 'array', items: { type: 'string' }, description: 'The IDs of the added documents' }
            }
          }
        }
      },
      async exec(input: {
        vectorStoreId: string;
        documents: Array<{ content: string; metadata?: Record<string, any> }>;
        embeddings?: number[][];
      }): Promise<{ result: { count: number; ids: string[] } }> {
        try {
          // Execute the task
          const result = await defaultRunnerClient.executeVectorStoreTask<{ count: number; ids: string[] }>(
            'add_documents',
            {
              vectorStoreId: input.vectorStoreId
            },
            {
              documents: input.documents,
              embeddings: input.embeddings
            }
          );
          
          // Return the result
          return { result };
        } catch (error: any) {
          throw new Error(`Failed to add documents: ${error?.message || 'Unknown error'}`);
        }
      }
    },
    {
      name: 'Search Documents',
      description: 'Search for documents in a vector store',
      id: 'searchDocuments',
      inputSchema: {
        type: 'object',
        properties: {
          vectorStoreId: { type: 'string', description: 'The ID of the vector store' },
          query: { type: 'string', description: 'The search query' },
          k: { type: 'number', description: 'The number of results to return', default: 4 },
          searchType: {
            type: 'string',
            enum: ['similarity', 'mmr', 'hybrid'],
            description: 'The type of search to perform',
            default: 'similarity'
          },
          filter: { type: 'object', description: 'Filter criteria for the search' }
        },
        required: ['vectorStoreId', 'query']
      },
      outputSchema: {
        type: 'object',
        properties: {
          result: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                content: { type: 'string', description: 'The content of the document' },
                metadata: { type: 'object', description: 'Metadata for the document' },
                score: { type: 'number', description: 'The similarity score' }
              }
            }
          }
        }
      },
      async exec(input: {
        vectorStoreId: string;
        query: string;
        k?: number;
        searchType?: 'similarity' | 'mmr' | 'hybrid';
        filter?: Record<string, any>;
      }): Promise<{ result: SearchResult[] }> {
        try {
          // Execute the task
          const result = await defaultRunnerClient.executeVectorStoreTask<SearchResult[]>(
            'search_documents',
            {
              vectorStoreId: input.vectorStoreId
            },
            {
              query: input.query,
              k: input.k || 4,
              searchType: input.searchType || 'similarity',
              filter: input.filter
            }
          );
          
          // Return the result
          return { result };
        } catch (error: any) {
          throw new Error(`Failed to search documents: ${error?.message || 'Unknown error'}`);
        }
      }
    },
    {
      name: 'Delete Documents',
      description: 'Delete documents from a vector store',
      id: 'deleteDocuments',
      inputSchema: {
        type: 'object',
        properties: {
          vectorStoreId: { type: 'string', description: 'The ID of the vector store' },
          ids: {
            type: 'array',
            items: { type: 'string' },
            description: 'The IDs of the documents to delete'
          },
          filter: { type: 'object', description: 'Filter criteria for deletion' }
        },
        required: ['vectorStoreId']
      },
      outputSchema: {
        type: 'object',
        properties: {
          result: {
            type: 'object',
            properties: {
              count: { type: 'number', description: 'The number of documents deleted' }
            }
          }
        }
      },
      async exec(input: {
        vectorStoreId: string;
        ids?: string[];
        filter?: Record<string, any>;
      }): Promise<{ result: { count: number } }> {
        try {
          // Execute the task
          const result = await defaultRunnerClient.executeVectorStoreTask<{ count: number }>(
            'delete_documents',
            {
              vectorStoreId: input.vectorStoreId
            },
            {
              ids: input.ids,
              filter: input.filter
            }
          );
          
          // Return the result
          return { result };
        } catch (error: any) {
          throw new Error(`Failed to delete documents: ${error?.message || 'Unknown error'}`);
        }
      }
    }
  ]
};

export default vectorStorePlugin;
