import { QdrantClient } from '@qdrant/js-client-rest';
import { decodeEmbeddings, convertToFilter } from './utils.js';
import { randomUUID } from 'crypto';

interface QdrantConfig {
  serverAddress: string;
  apiKey: string;
}

interface QdrantResponse {
  data?: any;
  error?: string;
}

// Helper function to create a Qdrant client
function createQdrantClient(config: QdrantConfig): any {
  return new QdrantClient({
    url: config.serverAddress,
    apiKey: config.apiKey
  });
}

const qdrantPlugin = {
  name: "Qdrant",
  icon: "FaDatabase",
  description: "Connect to Qdrant vector database for similarity search and vector operations",
  id: "qdrant",
  runner: "node",
  inputSchema: {
    type: "object",
    properties: {
      serverAddress: {
        type: "string",
        title: "Server Address",
        description: "The URL of the Qdrant instance (e.g., https://your-cluster-url.qdrant.io or http://localhost:6333)"
      },
      apiKey: {
        type: "string",
        title: "API Key",
        description: "Your Qdrant API key",
        format: "password"
      }
    },
    required: ["serverAddress", "apiKey"]
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
    serverAddress: "https://your-cluster-url.qdrant.io",
    apiKey: "your-api-key"
  },
  exampleOutput: {
    data: {
      status: "ok"
    }
  },
  documentation: "https://github.com/mintflow/plugins/qdrant",
  method: "exec",
  actions: [
    {
      name: 'listCollections',
      displayName: 'List Collections',
      description: 'Get a list of all collections in the Qdrant instance',
      inputSchema: {
        type: "object",
        properties: {}
      },
      async execute(input: { data: {} }, config: { data: QdrantConfig }): Promise<QdrantResponse> {
        try {
          const client = createQdrantClient(config.data);
          const collections = await client.getCollections();
          
          return { data: collections };
        } catch (error: any) {
          return { error: error.message };
        }
      }
    },
    {
      name: 'getCollectionInfo',
      displayName: 'Get Collection Info',
      description: 'Get detailed information about a specific collection',
      inputSchema: {
        type: "object",
        properties: {
          collectionName: {
            type: "string",
            title: "Collection Name",
            description: "The name of the collection to get information about"
          }
        },
        required: ["collectionName"]
      },
      async execute(input: { data: { collectionName: string } }, config: { data: QdrantConfig }): Promise<QdrantResponse> {
        try {
          const client = createQdrantClient(config.data);
          const collectionInfo = await client.getCollection(input.data.collectionName);
          
          return { data: collectionInfo };
        } catch (error: any) {
          return { error: error.message };
        }
      }
    },
    {
      name: 'createCollection',
      displayName: 'Create Collection',
      description: 'Create a new collection in the Qdrant instance',
      inputSchema: {
        type: "object",
        properties: {
          collectionName: {
            type: "string",
            title: "Collection Name",
            description: "The name of the collection to create"
          },
          dimension: {
            type: "number",
            title: "Vector Dimension",
            description: "The dimension of the vectors to be stored in the collection"
          },
          distance: {
            type: "string",
            title: "Distance Metric",
            description: "The distance metric to use for similarity search",
            enum: ["Cosine", "Euclid", "Dot"],
            default: "Cosine"
          },
          onDisk: {
            type: "boolean",
            title: "Store on Disk",
            description: "Whether to store vectors on disk (true) or in memory (false)",
            default: true
          }
        },
        required: ["collectionName", "dimension"]
      },
      async execute(input: { 
        data: { 
          collectionName: string; 
          dimension: number; 
          distance?: string; 
          onDisk?: boolean;
        } 
      }, config: { data: QdrantConfig }): Promise<QdrantResponse> {
        try {
          const client = createQdrantClient(config.data);
          const { collectionName, dimension, distance = "Cosine", onDisk = true } = input.data;
          
          await client.createCollection(collectionName, {
            vectors: {
              size: dimension,
              distance: distance as "Cosine" | "Euclid" | "Dot",
              on_disk: onDisk
            },
            on_disk_payload: onDisk
          });
          
          return { data: { message: `Collection ${collectionName} created successfully` } };
        } catch (error: any) {
          return { error: error.message };
        }
      }
    },
    {
      name: 'deleteCollection',
      displayName: 'Delete Collection',
      description: 'Delete a collection from the Qdrant instance',
      inputSchema: {
        type: "object",
        properties: {
          collectionName: {
            type: "string",
            title: "Collection Name",
            description: "The name of the collection to delete"
          }
        },
        required: ["collectionName"]
      },
      async execute(input: { data: { collectionName: string } }, config: { data: QdrantConfig }): Promise<QdrantResponse> {
        try {
          const client = createQdrantClient(config.data);
          await client.deleteCollection(input.data.collectionName);
          
          return { data: { message: `Collection ${input.data.collectionName} deleted successfully` } };
        } catch (error: any) {
          return { error: error.message };
        }
      }
    },
    {
      name: 'addPoints',
      displayName: 'Add Points',
      description: 'Add vector points to a collection',
      inputSchema: {
        type: "object",
        properties: {
          collectionName: {
            type: "string",
            title: "Collection Name",
            description: "The name of the collection to add points to"
          },
          embeddings: {
            type: "array",
            title: "Embeddings",
            description: "The vector embeddings to add (array of arrays of numbers)",
            items: {
              type: "array",
              items: {
                type: "number"
              }
            }
          },
          ids: {
            type: "array",
            title: "IDs",
            description: "The IDs for the vectors (optional, will be generated if not provided)",
            items: {
              type: "string"
            }
          },
          payloads: {
            type: "array",
            title: "Payloads",
            description: "Additional metadata for each vector (optional)",
            items: {
              type: "object"
            }
          },
          wait: {
            type: "boolean",
            title: "Wait",
            description: "Whether to wait for the operation to complete",
            default: true
          }
        },
        required: ["collectionName", "embeddings"]
      },
      async execute(input: { 
        data: { 
          collectionName: string; 
          embeddings: number[][]; 
          ids?: string[]; 
          payloads?: Record<string, any>[]; 
          wait?: boolean;
        } 
      }, config: { data: QdrantConfig }): Promise<QdrantResponse> {
        try {
          const client = createQdrantClient(config.data);
          const { collectionName, embeddings, ids, payloads, wait = true } = input.data;
          
          // Process embeddings
          const processedEmbeddings = embeddings.map(embedding => Array.from(embedding));
          
          // Generate or use provided IDs
          const useIds = ids || processedEmbeddings.map(() => randomUUID());
          
          if (useIds.length !== processedEmbeddings.length) {
            return { error: "The number of IDs must match the number of embeddings" };
          }
          
          // Create points
          const points = processedEmbeddings.map((vector, index) => ({
            id: useIds[index],
            vector,
            payload: payloads && payloads[index] ? payloads[index] : {}
          }));
          
          // Add points to collection
          const response = await client.upsert(collectionName, {
            points,
            wait
          });
          
          return { data: response };
        } catch (error: any) {
          return { error: error.message };
        }
      }
    },
    {
      name: 'searchPoints',
      displayName: 'Search Points',
      description: 'Search for points closest to a given vector',
      inputSchema: {
        type: "object",
        properties: {
          collectionName: {
            type: "string",
            title: "Collection Name",
            description: "The name of the collection to search in"
          },
          vector: {
            type: "array",
            title: "Query Vector",
            description: "The vector to search for",
            items: {
              type: "number"
            }
          },
          limit: {
            type: "number",
            title: "Limit",
            description: "The maximum number of results to return",
            default: 10
          },
          filter: {
            type: "object",
            title: "Filter",
            description: "Filter to apply to the search",
            properties: {
              must: {
                type: "object",
                title: "Must Have",
                description: "Conditions that must be met"
              },
              must_not: {
                type: "object",
                title: "Must Not Have",
                description: "Conditions that must not be met"
              }
            }
          },
          withPayload: {
            type: "boolean",
            title: "With Payload",
            description: "Whether to include payload in the results",
            default: true
          },
          withVector: {
            type: "boolean",
            title: "With Vector",
            description: "Whether to include vector in the results",
            default: false
          }
        },
        required: ["collectionName", "vector"]
      },
      async execute(input: { 
        data: { 
          collectionName: string; 
          vector: number[]; 
          limit?: number; 
          filter?: { must?: any; must_not?: any }; 
          withPayload?: boolean; 
          withVector?: boolean;
        } 
      }, config: { data: QdrantConfig }): Promise<QdrantResponse> {
        try {
          const client = createQdrantClient(config.data);
          const { 
            collectionName, 
            vector, 
            limit = 10, 
            filter, 
            withPayload = true, 
            withVector = false 
          } = input.data;
          
          const searchParams: any = {
            vector,
            limit,
            with_payload: withPayload,
            with_vector: withVector
          };
          
          // Add filter if provided
          if (filter) {
            searchParams.filter = convertToFilter(filter);
          }
          
          const response = await client.search(collectionName, searchParams);
          
          return { data: response };
        } catch (error: any) {
          return { error: error.message };
        }
      }
    },
    {
      name: 'getPoints',
      displayName: 'Get Points',
      description: 'Retrieve points by their IDs',
      inputSchema: {
        type: "object",
        properties: {
          collectionName: {
            type: "string",
            title: "Collection Name",
            description: "The name of the collection to get points from"
          },
          ids: {
            type: "array",
            title: "Point IDs",
            description: "The IDs of the points to retrieve",
            items: {
              type: "string"
            }
          },
          withPayload: {
            type: "boolean",
            title: "With Payload",
            description: "Whether to include payload in the results",
            default: true
          },
          withVector: {
            type: "boolean",
            title: "With Vector",
            description: "Whether to include vector in the results",
            default: false
          }
        },
        required: ["collectionName", "ids"]
      },
      async execute(input: { 
        data: { 
          collectionName: string; 
          ids: string[]; 
          withPayload?: boolean; 
          withVector?: boolean;
        } 
      }, config: { data: QdrantConfig }): Promise<QdrantResponse> {
        try {
          const client = createQdrantClient(config.data);
          const { collectionName, ids, withPayload = true, withVector = false } = input.data;
          
          const response = await client.retrieve(collectionName, {
            ids,
            with_payload: withPayload,
            with_vector: withVector
          });
          
          return { data: response };
        } catch (error: any) {
          return { error: error.message };
        }
      }
    },
    {
      name: 'deletePoints',
      displayName: 'Delete Points',
      description: 'Delete points from a collection',
      inputSchema: {
        type: "object",
        properties: {
          collectionName: {
            type: "string",
            title: "Collection Name",
            description: "The name of the collection to delete points from"
          },
          points: {
            type: "object",
            title: "Points Selection",
            description: "Specify how to select points for deletion",
            properties: {
              ids: {
                type: "array",
                title: "Point IDs",
                description: "The IDs of the points to delete",
                items: {
                  type: "string"
                }
              },
              filter: {
                type: "object",
                title: "Filter",
                description: "Filter to select points for deletion",
                properties: {
                  must: {
                    type: "object",
                    title: "Must Have",
                    description: "Conditions that must be met"
                  },
                  must_not: {
                    type: "object",
                    title: "Must Not Have",
                    description: "Conditions that must not be met"
                  }
                }
              }
            }
          },
          wait: {
            type: "boolean",
            title: "Wait",
            description: "Whether to wait for the operation to complete",
            default: true
          }
        },
        required: ["collectionName", "points"]
      },
      async execute(input: { 
        data: { 
          collectionName: string; 
          points: { 
            ids?: string[]; 
            filter?: { must?: any; must_not?: any }; 
          }; 
          wait?: boolean;
        } 
      }, config: { data: QdrantConfig }): Promise<QdrantResponse> {
        try {
          const client = createQdrantClient(config.data);
          const { collectionName, points, wait = true } = input.data;
          
          if (!points.ids && !points.filter) {
            return { error: "Either IDs or filter must be provided" };
          }
          
          let response;
          
          if (points.ids && points.ids.length > 0) {
            // Delete by IDs
            response = await client.delete(collectionName, {
              points: points.ids,
              wait
            });
          } else if (points.filter) {
            // Delete by filter
            response = await client.delete(collectionName, {
              filter: convertToFilter(points.filter),
              wait
            });
          }
          
          return { data: response };
        } catch (error: any) {
          return { error: error.message };
        }
      }
    },
    {
      name: 'getCollectionStats',
      displayName: 'Get Collection Stats',
      description: 'Get statistics about a collection',
      inputSchema: {
        type: "object",
        properties: {
          collectionName: {
            type: "string",
            title: "Collection Name",
            description: "The name of the collection to get statistics for"
          }
        },
        required: ["collectionName"]
      },
      async execute(input: { data: { collectionName: string } }, config: { data: QdrantConfig }): Promise<QdrantResponse> {
        try {
          const client = createQdrantClient(config.data);
          const response = await client.getCollectionInfo(input.data.collectionName);
          
          return { data: response };
        } catch (error: any) {
          return { error: error.message };
        }
      }
    }
  ]
};

export default qdrantPlugin;
