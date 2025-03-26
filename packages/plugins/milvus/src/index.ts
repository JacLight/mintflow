import { createCollection } from './actions/create-collection.js';
import { deleteCollection } from './actions/delete-collection.js';
import { listCollections } from './actions/list-collections.js';
import { getCollectionInfo } from './actions/get-collection-info.js';
import { insertVectors } from './actions/insert-vectors.js';
import { searchVectors } from './actions/search-vectors.js';

const milvusPlugin = {
  name: "milvus",
  icon: "FaDatabase",
  description: "Connect to Milvus vector database for similarity search and vector operations",
    groups: ["data"],
    tags: ["data","storage","database","query","persistence"],
    version: '1.0.0',
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
    searchVectors
  ],
};

export default milvusPlugin;
