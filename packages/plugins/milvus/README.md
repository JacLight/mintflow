# Milvus Plugin for MintFlow

This plugin provides integration with Milvus, an open-source vector database built to power embedding similarity search and AI applications.

## Features

- Create, manage, and delete collections in Milvus
- Insert and search vectors with customizable parameters
- Support for partitions and advanced search options
- Comprehensive collection management capabilities

## Authentication

To use this plugin, you need a running Milvus instance. You can:

1. Set up Milvus locally or in the cloud by following the instructions at [milvus.io](https://milvus.io/docs/install_standalone-docker.md)
2. Provide the host, port, and optional authentication credentials

## Actions

### List Collections

List all collections in your Milvus instance.

**Output:**

- `collections`: Array of collection names

### Get Collection Info

Get detailed information about a specific collection.

**Input Parameters:**

- `collectionName` (required): The name of the collection to get information about

**Output:**

- `collectionInfo`: Detailed information about the collection including fields, schema, and configuration

### Create Collection

Create a new collection in Milvus.

**Input Parameters:**

- `collectionName` (required): The name of the collection to create
- `description` (optional): Description of the collection
- `fields` (required): Array of field schemas for the collection
  - `name` (required): Field name
  - `description` (optional): Field description
  - `dataType` (required): Data type of the field (Int64, Float, String, Bool, VectorFloat, VectorBinary)
  - `isPrimaryKey` (optional): Whether this field is the primary key
  - `autoID` (optional): Whether to automatically generate IDs for this field
  - `dimensions` (optional): Dimensions for vector fields
- `shardNum` (optional): Number of shards for the collection
- `replicaNum` (optional): Number of replicas for the collection

**Output:**

- `message`: Success message

### Delete Collection

Delete a collection from Milvus.

**Input Parameters:**

- `collectionName` (required): The name of the collection to delete

**Output:**

- `message`: Success message

### Insert Vectors

Insert vectors into a Milvus collection.

**Input Parameters:**

- `collectionName` (required): The name of the collection to insert vectors into
- `partitionName` (optional): The name of the partition to insert vectors into
- `data` (required): Array of objects with field names as keys and values to insert

**Output:**

- `insertCount`: Number of vectors inserted
- `ids`: Array of inserted vector IDs

### Search Vectors

Search for similar vectors in a Milvus collection.

**Input Parameters:**

- `collectionName` (required): The name of the collection to search in
- `partitionNames` (optional): Array of partition names to search in
- `vectorField` (required): The name of the vector field to search
- `vectors` (required): Array of vector arrays to search with
- `topK` (required): Number of nearest neighbors to return
- `outputFields` (optional): Array of field names to include in the output
- `filter` (optional): Filter expression to apply to the search
- `metricType` (optional): Metric type to use for the search (L2, IP, COSINE, HAMMING, JACCARD)
- `params` (optional): Additional search parameters

**Output:**

- `results`: Array of search results with IDs, distances, and entity data

### Get Vectors

Retrieve vectors by ID from a Milvus collection.

**Input Parameters:**

- `collectionName` (required): The name of the collection to get vectors from
- `partitionName` (optional): The name of the partition to get vectors from
- `ids` (required): Array of vector IDs to retrieve
- `outputFields` (optional): Array of field names to include in the output

**Output:**

- `vectors`: Array of retrieved vectors with their data

### Delete Vectors

Delete vectors from a Milvus collection.

**Input Parameters:**

- `collectionName` (required): The name of the collection to delete vectors from
- `partitionName` (optional): The name of the partition to delete vectors from
- `ids` (required): Array of vector IDs to delete

**Output:**

- `deleteCount`: Number of vectors deleted

### Get Collection Stats

Get statistics about a Milvus collection.

**Input Parameters:**

- `collectionName` (required): The name of the collection to get statistics for

**Output:**

- `stats`: Statistics about the collection including row count and index information

### Create Partition

Create a new partition in a Milvus collection.

**Input Parameters:**

- `collectionName` (required): The name of the collection to create a partition in
- `partitionName` (required): The name of the partition to create

**Output:**

- `message`: Success message

### Drop Partition

Drop a partition from a Milvus collection.

**Input Parameters:**

- `collectionName` (required): The name of the collection to drop a partition from
- `partitionName` (required): The name of the partition to drop

**Output:**

- `message`: Success message

### List Partitions

List all partitions in a Milvus collection.

**Input Parameters:**

- `collectionName` (required): The name of the collection to list partitions for

**Output:**

- `partitions`: Array of partition names

## Example Usage

```javascript
// List all collections in Milvus
const collections = await mintflow.execute('milvus', 'list-collections', {}, {
  auth: {
    host: 'localhost',
    port: '19530'
  }
});

// Create a new collection with a vector field
const createResult = await mintflow.execute('milvus', 'create-collection', {
  collectionName: 'my_collection',
  description: 'A collection for storing document embeddings',
  fields: [
    {
      name: 'id',
      dataType: 'Int64',
      isPrimaryKey: true,
      autoID: true
    },
    {
      name: 'title',
      dataType: 'String'
    },
    {
      name: 'embedding',
      dataType: 'VectorFloat',
      dimensions: 768
    }
  ],
  shardNum: 2
}, {
  auth: {
    host: 'localhost',
    port: '19530'
  }
});

// Insert vectors into the collection
const insertResult = await mintflow.execute('milvus', 'insert-vectors', {
  collectionName: 'my_collection',
  data: [
    {
      title: 'Document 1',
      embedding: [0.1, 0.2, 0.3, /* ... more dimensions */]
    },
    {
      title: 'Document 2',
      embedding: [0.4, 0.5, 0.6, /* ... more dimensions */]
    }
  ]
}, {
  auth: {
    host: 'localhost',
    port: '19530'
  }
});

// Search for similar vectors
const searchResult = await mintflow.execute('milvus', 'search-vectors', {
  collectionName: 'my_collection',
  vectorField: 'embedding',
  vectors: [[0.2, 0.3, 0.4, /* ... more dimensions */]],
  topK: 5,
  outputFields: ['title']
}, {
  auth: {
    host: 'localhost',
    port: '19530'
  }
});
```

## API Documentation

For more information about the Milvus API, refer to the [official documentation](https://milvus.io/docs).
