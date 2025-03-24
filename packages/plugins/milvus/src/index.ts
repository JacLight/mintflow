import { createCollection } from './actions/create-collection';
import { deleteCollection } from './actions/delete-collection';
import { listCollections } from './actions/list-collections';
import { getCollectionInfo } from './actions/get-collection-info';
import { insertVectors } from './actions/insert-vectors';
import { searchVectors } from './actions/search-vectors';
import { getVectors } from './actions/get-vectors';
import { deleteVectors } from './actions/delete-vectors';
import { getCollectionStats } from './actions/get-collection-stats';
import { createPartition } from './actions/create-partition';
import { dropPartition } from './actions/drop-partition';
import { listPartitions } from './actions/list-partitions';

const milvusPlugin = {
  name: "milvus",
  icon: "FaDatabase",
  description: "Connect to Milvus vector database for similarity search and vector operations",
  id: "milvus",
  runner: "node",
  auth: {
    required: true,
    schema: {
      type: "object",
      properties: {
        host: {
          type: "string",
          description: "Milvus server host",
          required: true,
        },
        port: {
          type: "string",
          description: "Milvus server port",
          required: true,
        },
        username: {
          type: "string",
          description: "Milvus username (if authentication is enabled)",
          required: false,
        },
        password: {
          type: "string",
          description: "Milvus password (if authentication is enabled)",
          format: "password",
          required: false,
        },
        ssl: {
          type: "boolean",
          description: "Whether to use SSL for connection",
          required: false,
        }
      },
    },
  },
  inputSchema: {
    type: "object",
    properties: {},
  },
  outputSchema: {
    type: "object",
    properties: {},
  },
  exampleInput: {},
  exampleOutput: {},
  documentation: "https://milvus.io/docs",
  method: "exec",
  actions: [
    listCollections,
    getCollectionInfo,
    createCollection,
    deleteCollection,
    insertVectors,
    searchVectors,
    getVectors,
    deleteVectors,
    getCollectionStats,
    createPartition,
    dropPartition,
    listPartitions
  ],
};

export default milvusPlugin;
