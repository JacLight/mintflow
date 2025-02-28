# MintFlow Pinecone Plugin

A MintFlow plugin for connecting to Pinecone vector database for similarity search and vector operations.

## Features

- **Index Management**: Create, describe, and delete vector indexes
- **Vector Operations**: Upsert, query, fetch, update, and delete vectors
- **Namespace Support**: Organize vectors within namespaces
- **Metadata Management**: Store and query additional metadata alongside vectors
- **Statistics**: Get detailed statistics about indexes

## Installation

This plugin is included in the MintFlow package. No additional installation is required.

## Configuration

The Pinecone plugin requires the following configuration:

```json
{
  "apiKey": "your-api-key",
  "environment": "us-west1-gcp",
  "projectId": "your-project-id"
}
```

| Parameter | Description | Required |
|-----------|-------------|----------|
| apiKey | Your Pinecone API key | Yes |
| environment | The Pinecone environment (e.g., us-west1-gcp, us-east1-aws) | No |
| projectId | Your Pinecone project ID | No |

You can find your API key and project ID in the Pinecone console.

## Usage

### Index Management

#### List Indexes

List all indexes in your Pinecone project.

```javascript
const result = await mintflow.execute('pinecone', {
  action: 'listIndexes'
});

console.log(result.data); // Array of index names
```

#### Describe Index

Get details about a specific index.

```javascript
const result = await mintflow.execute('pinecone', {
  action: 'describeIndex',
  indexName: 'my-index'
});

console.log(result.data); // Index details including dimension, metric, etc.
```

#### Create Index

Create a new vector index.

```javascript
const result = await mintflow.execute('pinecone', {
  action: 'createIndex',
  name: 'my-new-index',
  dimension: 1536,
  metric: 'cosine',
  spec: {
    serverless: {
      cloud: 'aws',
      region: 'us-west-2'
    }
  }
});

console.log(result.data.message); // "Index my-new-index created successfully"
```

#### Delete Index

Delete a vector index.

```javascript
const result = await mintflow.execute('pinecone', {
  action: 'deleteIndex',
  indexName: 'my-index'
});

console.log(result.data.message); // "Index my-index deleted successfully"
```

#### Describe Index Stats

Get statistics about an index.

```javascript
const result = await mintflow.execute('pinecone', {
  action: 'describeIndexStats',
  indexName: 'my-index',
  filter: { // Optional
    genre: { $eq: 'sci-fi' }
  }
});

console.log(result.data.namespaces); // Namespace statistics
console.log(result.data.dimension); // Vector dimension
console.log(result.data.totalVectorCount); // Total number of vectors
```

### Vector Operations

#### Upsert Vectors

Insert or update vectors in an index.

```javascript
const result = await mintflow.execute('pinecone', {
  action: 'upsertVectors',
  indexName: 'my-index',
  namespace: 'books', // Optional
  vectors: [
    {
      id: 'vec1',
      values: [0.1, 0.2, 0.3, 0.4], // Vector values
      metadata: { // Optional
        title: 'The Great Gatsby',
        author: 'F. Scott Fitzgerald',
        year: 1925
      }
    },
    {
      id: 'vec2',
      values: [0.2, 0.3, 0.4, 0.5],
      metadata: {
        title: 'To Kill a Mockingbird',
        author: 'Harper Lee',
        year: 1960
      }
    }
  ]
});

console.log(result.data.upsertedCount); // Number of vectors upserted
```

#### Query Vectors

Query vectors in an index for similarity search.

```javascript
const result = await mintflow.execute('pinecone', {
  action: 'queryVectors',
  indexName: 'my-index',
  namespace: 'books', // Optional
  topK: 5, // Optional, default: 10
  filter: { // Optional
    year: { $gte: 1950 }
  },
  includeValues: true, // Optional, default: false
  includeMetadata: true, // Optional, default: true
  vector: [0.1, 0.2, 0.3, 0.4] // Query vector
  // Alternatively, you can query by ID:
  // id: 'vec1'
});

console.log(result.data.matches); // Array of matching vectors with scores
```

#### Fetch Vectors

Fetch vectors by ID from an index.

```javascript
const result = await mintflow.execute('pinecone', {
  action: 'fetchVectors',
  indexName: 'my-index',
  namespace: 'books', // Optional
  ids: ['vec1', 'vec2'],
  includeValues: true, // Optional, default: true
  includeMetadata: true // Optional, default: true
});

console.log(result.data.vectors); // Object mapping IDs to vector data
```

#### Update Vector

Update a vector in an index.

```javascript
const result = await mintflow.execute('pinecone', {
  action: 'updateVector',
  indexName: 'my-index',
  namespace: 'books', // Optional
  id: 'vec1',
  values: [0.2, 0.3, 0.4, 0.5], // Optional
  setMetadata: { // Optional
    rating: 4.5,
    tags: ['classic', 'fiction']
  }
});

console.log(result.data); // Update result
```

#### Delete Vectors

Delete vectors from an index.

```javascript
const result = await mintflow.execute('pinecone', {
  action: 'deleteVectors',
  indexName: 'my-index',
  namespace: 'books', // Optional
  ids: ['vec1', 'vec2'] // Optional
  // Alternatively, you can delete all vectors:
  // deleteAll: true
  // Or delete by filter:
  // filter: { year: { $lt: 1950 } }
});

console.log(result.data); // Deletion result
```

## Error Handling

All actions will return an error property if the operation fails. You can check for this property to handle errors gracefully.

```javascript
const result = await mintflow.execute('pinecone', {
  action: 'queryVectors',
  indexName: 'non_existent_index',
  vector: [0.1, 0.2, 0.3, 0.4]
});

if (result.error) {
  console.error('Pinecone error:', result.error);
  // Handle the error appropriately
} else {
  console.log('Query results:', result.data.matches);
}
```

## Example Workflow

Here's an example of how to use the Pinecone plugin in a MintFlow workflow for semantic search:

```javascript
// First, get embeddings for the search query using an AI model
const embeddingResult = await mintflow.execute('ai', {
  action: 'generateEmbedding',
  text: input.data.searchQuery,
  model: 'text-embedding-ada-002'
});

if (embeddingResult.error) {
  return {
    success: false,
    message: `Failed to generate embeddings: ${embeddingResult.error}`
  };
}

// Then, search for similar vectors in Pinecone
const searchResult = await mintflow.execute('pinecone', {
  action: 'queryVectors',
  indexName: 'document-embeddings',
  namespace: 'knowledge-base',
  topK: 5,
  includeMetadata: true,
  vector: embeddingResult.data.embedding
});

if (searchResult.error) {
  return {
    success: false,
    message: `Failed to search Pinecone: ${searchResult.error}`
  };
}

// Process the results
const searchResults = searchResult.data.matches.map(match => ({
  title: match.metadata.title,
  content: match.metadata.content,
  url: match.metadata.url,
  similarity: match.score
}));

return {
  success: true,
  results: searchResults
};
```

## Security Considerations

- The plugin uses the official Pinecone client library which handles authentication securely
- API keys are stored securely and never exposed in client-side code
- All operations are performed using the Pinecone client's methods, which handle input validation

## Limitations

- The plugin requires a valid Pinecone API key
- Some operations may be limited by your Pinecone plan's quotas and limits
- Vector dimensions must match the dimension of the index

## Development

### Building the Plugin

```bash
cd packages/plugins/pinecone
pnpm build
```

### Running Tests

```bash
cd packages/plugins/pinecone
pnpm test
```

## License

This plugin is part of the MintFlow project and is subject to the same license terms.
