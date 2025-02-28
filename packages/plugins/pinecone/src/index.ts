import { Pinecone } from '@pinecone-database/pinecone';

interface PineconeConfig {
  apiKey: string;
  environment?: string;
  projectId?: string;
}

interface PineconeResponse {
  data?: any;
  error?: string;
}

// Helper function to create a Pinecone client
async function createPineconeClient(config: PineconeConfig): Promise<any> {
  const { apiKey, environment, projectId } = config;
  
  const clientConfig: any = {
    apiKey
  };
  
  if (environment) {
    clientConfig.environment = environment;
  }
  
  if (projectId) {
    clientConfig.projectId = projectId;
  }
  
  return new Pinecone(clientConfig);
}

const pineconePlugin = {
  name: "Pinecone",
  icon: "FaDatabase",
  description: "Connect to Pinecone vector database for similarity search and vector operations",
  id: "pinecone",
  runner: "node",
  inputSchema: {
    type: "object",
    properties: {
      apiKey: {
        type: "string",
        title: "API Key",
        description: "Your Pinecone API key",
        format: "password"
      },
      environment: {
        type: "string",
        title: "Environment",
        description: "The Pinecone environment (e.g., us-west1-gcp, us-east1-aws)"
      },
      projectId: {
        type: "string",
        title: "Project ID",
        description: "Your Pinecone project ID"
      }
    },
    required: ["apiKey"]
  },
  outputSchema: {
    type: "object",
    properties: {
      data: {
        type: "object"
      },
      error: {
        type: "string"
      }
    }
  },
  exampleInput: {
    apiKey: "your-api-key",
    environment: "us-west1-gcp",
    projectId: "your-project-id"
  },
  exampleOutput: {
    data: {
      matches: [
        {
          id: "vec1",
          score: 0.9,
          values: [0.1, 0.2, 0.3]
        }
      ]
    }
  },
  documentation: "https://github.com/mintflow/plugins/pinecone",
  method: "exec",
  actions: [
    {
      name: 'listIndexes',
      displayName: 'List Indexes',
      description: 'List all indexes in your Pinecone project',
      inputSchema: {
        type: "object",
        properties: {}
      },
      async execute(input: { data: {} }, config: { data: PineconeConfig }): Promise<PineconeResponse> {
        try {
          const pinecone = await createPineconeClient(config.data);
          const indexes = await pinecone.listIndexes();
          
          return { data: indexes };
        } catch (error: any) {
          return { error: error.message };
        }
      }
    },
    {
      name: 'describeIndex',
      displayName: 'Describe Index',
      description: 'Get details about a specific index',
      inputSchema: {
        type: "object",
        properties: {
          indexName: {
            type: "string",
            title: "Index Name",
            description: "The name of the index to describe"
          }
        },
        required: ["indexName"]
      },
      async execute(input: { data: { indexName: string } }, config: { data: PineconeConfig }): Promise<PineconeResponse> {
        try {
          const pinecone = await createPineconeClient(config.data);
          const index = pinecone.index(input.data.indexName);
          const description = await index.describeIndex();
          
          return { data: description };
        } catch (error: any) {
          return { error: error.message };
        }
      }
    },
    {
      name: 'createIndex',
      displayName: 'Create Index',
      description: 'Create a new vector index',
      inputSchema: {
        type: "object",
        properties: {
          name: {
            type: "string",
            title: "Index Name",
            description: "The name of the index to create"
          },
          dimension: {
            type: "number",
            title: "Dimension",
            description: "The dimension of the vectors to be stored in the index"
          },
          metric: {
            type: "string",
            title: "Distance Metric",
            description: "The distance metric to use for similarity search",
            enum: ["cosine", "euclidean", "dotproduct"],
            default: "cosine"
          },
          spec: {
            type: "object",
            title: "Index Specification",
            description: "Additional specifications for the index",
            properties: {
              serverless: {
                type: "object",
                title: "Serverless Configuration",
                description: "Configuration for serverless indexes",
                properties: {
                  cloud: {
                    type: "string",
                    title: "Cloud Provider",
                    description: "The cloud provider for the serverless index",
                    enum: ["aws", "gcp", "azure"]
                  },
                  region: {
                    type: "string",
                    title: "Region",
                    description: "The region for the serverless index"
                  }
                }
              },
              pod: {
                type: "object",
                title: "Pod Configuration",
                description: "Configuration for pod-based indexes",
                properties: {
                  environment: {
                    type: "string",
                    title: "Environment",
                    description: "The environment for the pod-based index"
                  },
                  replicas: {
                    type: "number",
                    title: "Replicas",
                    description: "The number of replicas for the pod-based index",
                    default: 1
                  },
                  shards: {
                    type: "number",
                    title: "Shards",
                    description: "The number of shards for the pod-based index",
                    default: 1
                  },
                  podType: {
                    type: "string",
                    title: "Pod Type",
                    description: "The pod type for the pod-based index",
                    enum: ["s1", "p1", "p2"]
                  }
                }
              }
            }
          }
        },
        required: ["name", "dimension", "metric"]
      },
      async execute(input: { 
        data: { 
          name: string; 
          dimension: number; 
          metric: string;
          spec?: {
            serverless?: {
              cloud?: string;
              region?: string;
            };
            pod?: {
              environment?: string;
              replicas?: number;
              shards?: number;
              podType?: string;
            };
          };
        } 
      }, config: { data: PineconeConfig }): Promise<PineconeResponse> {
        try {
          const pinecone = await createPineconeClient(config.data);
          
          await pinecone.createIndex({
            name: input.data.name,
            dimension: input.data.dimension,
            metric: input.data.metric as any,
            spec: input.data.spec as any
          });
          
          return { data: { message: `Index ${input.data.name} created successfully` } };
        } catch (error: any) {
          return { error: error.message };
        }
      }
    },
    {
      name: 'deleteIndex',
      displayName: 'Delete Index',
      description: 'Delete a vector index',
      inputSchema: {
        type: "object",
        properties: {
          indexName: {
            type: "string",
            title: "Index Name",
            description: "The name of the index to delete"
          }
        },
        required: ["indexName"]
      },
      async execute(input: { data: { indexName: string } }, config: { data: PineconeConfig }): Promise<PineconeResponse> {
        try {
          const pinecone = await createPineconeClient(config.data);
          await pinecone.deleteIndex(input.data.indexName);
          
          return { data: { message: `Index ${input.data.indexName} deleted successfully` } };
        } catch (error: any) {
          return { error: error.message };
        }
      }
    },
    {
      name: 'upsertVectors',
      displayName: 'Upsert Vectors',
      description: 'Insert or update vectors in an index',
      inputSchema: {
        type: "object",
        properties: {
          indexName: {
            type: "string",
            title: "Index Name",
            description: "The name of the index to upsert vectors into"
          },
          namespace: {
            type: "string",
            title: "Namespace",
            description: "The namespace to upsert vectors into (optional)"
          },
          vectors: {
            type: "array",
            title: "Vectors",
            description: "The vectors to upsert",
            items: {
              type: "object",
              properties: {
                id: {
                  type: "string",
                  title: "ID",
                  description: "The ID of the vector"
                },
                values: {
                  type: "array",
                  title: "Values",
                  description: "The vector values",
                  items: {
                    type: "number"
                  }
                },
                metadata: {
                  type: "object",
                  title: "Metadata",
                  description: "Additional metadata for the vector (optional)"
                }
              },
              required: ["id", "values"]
            }
          }
        },
        required: ["indexName", "vectors"]
      },
      async execute(input: { 
        data: { 
          indexName: string; 
          namespace?: string; 
          vectors: Array<{
            id: string;
            values: number[];
            metadata?: Record<string, any>;
          }>;
        } 
      }, config: { data: PineconeConfig }): Promise<PineconeResponse> {
        try {
          const pinecone = await createPineconeClient(config.data);
          const index = pinecone.index(input.data.indexName);
          
          const upsertRequest: any = {
            vectors: input.data.vectors
          };
          
          if (input.data.namespace) {
            upsertRequest.namespace = input.data.namespace;
          }
          
          const response = await index.upsert(upsertRequest);
          
          return { data: response };
        } catch (error: any) {
          return { error: error.message };
        }
      }
    },
    {
      name: 'queryVectors',
      displayName: 'Query Vectors',
      description: 'Query vectors in an index for similarity search',
      inputSchema: {
        type: "object",
        properties: {
          indexName: {
            type: "string",
            title: "Index Name",
            description: "The name of the index to query"
          },
          namespace: {
            type: "string",
            title: "Namespace",
            description: "The namespace to query (optional)"
          },
          topK: {
            type: "number",
            title: "Top K",
            description: "The number of results to return",
            default: 10
          },
          filter: {
            type: "object",
            title: "Filter",
            description: "Filter to apply to the query (optional)"
          },
          includeValues: {
            type: "boolean",
            title: "Include Values",
            description: "Whether to include vector values in the response",
            default: false
          },
          includeMetadata: {
            type: "boolean",
            title: "Include Metadata",
            description: "Whether to include metadata in the response",
            default: true
          },
          vector: {
            type: "array",
            title: "Query Vector",
            description: "The vector to query with",
            items: {
              type: "number"
            }
          },
          id: {
            type: "string",
            title: "Vector ID",
            description: "The ID of a vector to query with (alternative to providing a vector)"
          }
        },
        required: ["indexName"]
      },
      async execute(input: { 
        data: { 
          indexName: string; 
          namespace?: string; 
          topK?: number; 
          filter?: Record<string, any>; 
          includeValues?: boolean; 
          includeMetadata?: boolean;
          vector?: number[];
          id?: string;
        } 
      }, config: { data: PineconeConfig }): Promise<PineconeResponse> {
        try {
          const pinecone = await createPineconeClient(config.data);
          const index = pinecone.index(input.data.indexName);
          
          if (!input.data.vector && !input.data.id) {
            return { error: "Either vector or id must be provided" };
          }
          
          const queryRequest: any = {
            topK: input.data.topK || 10,
            includeValues: input.data.includeValues || false,
            includeMetadata: input.data.includeMetadata !== false
          };
          
          if (input.data.namespace) {
            queryRequest.namespace = input.data.namespace;
          }
          
          if (input.data.filter) {
            queryRequest.filter = input.data.filter;
          }
          
          if (input.data.vector) {
            queryRequest.vector = input.data.vector;
          } else if (input.data.id) {
            queryRequest.id = input.data.id;
          }
          
          const response = await index.query(queryRequest);
          
          return { data: response };
        } catch (error: any) {
          return { error: error.message };
        }
      }
    },
    {
      name: 'deleteVectors',
      displayName: 'Delete Vectors',
      description: 'Delete vectors from an index',
      inputSchema: {
        type: "object",
        properties: {
          indexName: {
            type: "string",
            title: "Index Name",
            description: "The name of the index to delete vectors from"
          },
          namespace: {
            type: "string",
            title: "Namespace",
            description: "The namespace to delete vectors from (optional)"
          },
          ids: {
            type: "array",
            title: "Vector IDs",
            description: "The IDs of the vectors to delete",
            items: {
              type: "string"
            }
          },
          deleteAll: {
            type: "boolean",
            title: "Delete All",
            description: "Whether to delete all vectors in the namespace",
            default: false
          },
          filter: {
            type: "object",
            title: "Filter",
            description: "Filter to apply to the deletion (optional)"
          }
        },
        required: ["indexName"]
      },
      async execute(input: { 
        data: { 
          indexName: string; 
          namespace?: string; 
          ids?: string[]; 
          deleteAll?: boolean;
          filter?: Record<string, any>;
        } 
      }, config: { data: PineconeConfig }): Promise<PineconeResponse> {
        try {
          const pinecone = await createPineconeClient(config.data);
          const index = pinecone.index(input.data.indexName);
          
          const deleteRequest: any = {};
          
          if (input.data.namespace) {
            deleteRequest.namespace = input.data.namespace;
          }
          
          if (input.data.deleteAll) {
            deleteRequest.deleteAll = true;
          } else if (input.data.ids && input.data.ids.length > 0) {
            deleteRequest.ids = input.data.ids;
          } else if (input.data.filter) {
            deleteRequest.filter = input.data.filter;
          } else {
            return { error: "Either ids, deleteAll, or filter must be provided" };
          }
          
          const response = await index.deleteMany(deleteRequest);
          
          return { data: response };
        } catch (error: any) {
          return { error: error.message };
        }
      }
    },
    {
      name: 'fetchVectors',
      displayName: 'Fetch Vectors',
      description: 'Fetch vectors by ID from an index',
      inputSchema: {
        type: "object",
        properties: {
          indexName: {
            type: "string",
            title: "Index Name",
            description: "The name of the index to fetch vectors from"
          },
          namespace: {
            type: "string",
            title: "Namespace",
            description: "The namespace to fetch vectors from (optional)"
          },
          ids: {
            type: "array",
            title: "Vector IDs",
            description: "The IDs of the vectors to fetch",
            items: {
              type: "string"
            }
          },
          includeValues: {
            type: "boolean",
            title: "Include Values",
            description: "Whether to include vector values in the response",
            default: true
          },
          includeMetadata: {
            type: "boolean",
            title: "Include Metadata",
            description: "Whether to include metadata in the response",
            default: true
          }
        },
        required: ["indexName", "ids"]
      },
      async execute(input: { 
        data: { 
          indexName: string; 
          namespace?: string; 
          ids: string[]; 
          includeValues?: boolean; 
          includeMetadata?: boolean;
        } 
      }, config: { data: PineconeConfig }): Promise<PineconeResponse> {
        try {
          const pinecone = await createPineconeClient(config.data);
          const index = pinecone.index(input.data.indexName);
          
          const fetchRequest: any = {
            ids: input.data.ids,
            includeValues: input.data.includeValues !== false,
            includeMetadata: input.data.includeMetadata !== false
          };
          
          if (input.data.namespace) {
            fetchRequest.namespace = input.data.namespace;
          }
          
          const response = await index.fetch(fetchRequest);
          
          return { data: response };
        } catch (error: any) {
          return { error: error.message };
        }
      }
    },
    {
      name: 'updateVector',
      displayName: 'Update Vector',
      description: 'Update a vector in an index',
      inputSchema: {
        type: "object",
        properties: {
          indexName: {
            type: "string",
            title: "Index Name",
            description: "The name of the index to update a vector in"
          },
          namespace: {
            type: "string",
            title: "Namespace",
            description: "The namespace to update a vector in (optional)"
          },
          id: {
            type: "string",
            title: "Vector ID",
            description: "The ID of the vector to update"
          },
          values: {
            type: "array",
            title: "Values",
            description: "The new vector values (optional)",
            items: {
              type: "number"
            }
          },
          setMetadata: {
            type: "object",
            title: "Set Metadata",
            description: "Metadata to set on the vector (optional)"
          }
        },
        required: ["indexName", "id"]
      },
      async execute(input: { 
        data: { 
          indexName: string; 
          namespace?: string; 
          id: string; 
          values?: number[]; 
          setMetadata?: Record<string, any>;
        } 
      }, config: { data: PineconeConfig }): Promise<PineconeResponse> {
        try {
          const pinecone = await createPineconeClient(config.data);
          const index = pinecone.index(input.data.indexName);
          
          const updateRequest: any = {
            id: input.data.id
          };
          
          if (input.data.namespace) {
            updateRequest.namespace = input.data.namespace;
          }
          
          if (input.data.values) {
            updateRequest.values = input.data.values;
          }
          
          if (input.data.setMetadata) {
            updateRequest.setMetadata = input.data.setMetadata;
          }
          
          if (!input.data.values && !input.data.setMetadata) {
            return { error: "Either values or setMetadata must be provided" };
          }
          
          const response = await index.update(updateRequest);
          
          return { data: response };
        } catch (error: any) {
          return { error: error.message };
        }
      }
    },
    {
      name: 'describeIndexStats',
      displayName: 'Describe Index Stats',
      description: 'Get statistics about an index',
      inputSchema: {
        type: "object",
        properties: {
          indexName: {
            type: "string",
            title: "Index Name",
            description: "The name of the index to get statistics for"
          },
          filter: {
            type: "object",
            title: "Filter",
            description: "Filter to apply to the statistics (optional)"
          }
        },
        required: ["indexName"]
      },
      async execute(input: { 
        data: { 
          indexName: string; 
          filter?: Record<string, any>;
        } 
      }, config: { data: PineconeConfig }): Promise<PineconeResponse> {
        try {
          const pinecone = await createPineconeClient(config.data);
          const index = pinecone.index(input.data.indexName);
          
          const statsRequest: any = {};
          
          if (input.data.filter) {
            statsRequest.filter = input.data.filter;
          }
          
          const response = await index.describeIndexStats(statsRequest);
          
          return { data: response };
        } catch (error: any) {
          return { error: error.message };
        }
      }
    }
  ]
};

export default pineconePlugin;
