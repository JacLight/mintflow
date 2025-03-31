# MintFlow Qdrant Plugin

A MintFlow plugin for connecting to Qdrant vector database for similarity search and vector operations.

## Features

- **Collection Management**: Create, list, get info, and delete collections
- **Vector Operations**: Add, search, retrieve, and delete vectors
- **Metadata Support**: Store and query additional metadata alongside vectors
- **Filtering**: Filter search results based on metadata
- **Statistics**: Get detailed statistics about collections

## Installation

This plugin is included in the MintFlow package. No additional installation is required.

## Configuration

The Qdrant plugin requires the following configuration:

```json
{
  "serverAddress": "https://your-cluster-url.qdrant.io",
  "apiKey": "your-api-key"
}
```

| Parameter | Description | Required |
|-----------|-------------|----------|
| serverAddress | The URL of the Qdrant instance (e.g., https://your-cluster-url.qdrant.io or http://localhost:6333) | Yes |
| apiKey | Your Qdrant API key | Yes |

## Usage

### Collection Management

#### List Collections

Get a list of all collections in the Qdrant instance.

```javascript
const result = await mintflow.execute('qdrant', {
  action: 'listCollections'
});

console.log(result.data.collections); // Array of collection objects
```

#### Get Collection Info

Get detailed information about a specific collection.

```javascript
const result = await mintflow.execute('qdrant', {
  action: 'getCollectionInfo',
  collectionName: 'my-collection'
});

console.log(result.data); // Collection details
```

#### Create Collection

Create a new collection in the Qdrant instance.

```javascript
const result = await mintflow.execute('qdrant', {
  action: 'createCollection',
  collectionName: 'my-new-collection',
  dimension: 1536, // The dimension of your vectors
  distance: 'Cosine', // Distance metric: 'Cosine', 'Euclid', or 'Dot'
  onDisk: true // Whether to store vectors on disk (true) or in memory (false)
});

console.log(result.data.message); // "Collection my-new-collection created successfully"
```

#### Delete Collection

Delete a collection from the Qdrant instance.

```javascript
const result = await mintflow.execute('qdrant', {
  action: 'deleteCollection',
  collectionName: 'my-collection'
});

console.log(result.data.message); // "Collection my-collection deleted successfully"
```

#### Get Collection Stats

Get statistics about a collection.

```javascript
const result = await mintflow.execute('qdrant', {
  action: 'getCollectionStats',
  collectionName: 'my-collection'
});

console.log(result.data.vectors_count); // Number of vectors in the collection
console.log(result.data.segments_count); // Number of segments in the collection
```

### Vector Operations

#### Add Points

Add vector points to a collection.

```javascript
const result = await mintflow.execute('qdrant', {
  action: 'addPoints',
  collectionName: 'my-collection',
  embeddings: [
    [0.1, 0.2, 0.3, 0.4], // First vector
    [0.2, 0.3, 0.4, 0.5]  // Second vector
  ],
  ids: ['vec1', 'vec2'], // Optional, will be generated if not provided
  payloads: [
    { title: 'Document 1', category: 'article' }, // Metadata for first vector
    { title: 'Document 2', category: 'blog' }     // Metadata for second vector
  ],
  wait: true // Whether to wait for the operation to complete
});

console.log(result.data.operation_id); // Operation ID
console.log(result.data.status); // Operation status
```

#### Search Points

Search for points closest to a given vector.

```javascript
const result = await mintflow.execute('qdrant', {
  action: 'searchPoints',
  collectionName: 'my-collection',
  vector: [0.1, 0.2, 0.3, 0.4], // Query vector
  limit: 5, // Maximum number of results to return
  filter: { // Optional filter
    must: {
      category: 'article'
    },
    must_not: {
      is_deleted: true
    }
  },
  withPayload: true, // Whether to include payload in the results
  withVector: false // Whether to include vector in the results
});

console.log(result.data); // Array of matching points with scores
```

#### Get Points

Retrieve points by their IDs.

```javascript
const result = await mintflow.execute('qdrant', {
  action: 'getPoints',
  collectionName: 'my-collection',
  ids: ['vec1', 'vec2'],
  withPayload: true, // Whether to include payload in the results
  withVector: false // Whether to include vector in the results
});

console.log(result.data); // Array of points
```

#### Delete Points

Delete points from a collection.

```javascript
const result = await mintflow.execute('qdrant', {
  action: 'deletePoints',
  collectionName: 'my-collection',
  points: {
    ids: ['vec1', 'vec2'] // Delete by IDs
    // Alternatively, delete by filter:
    // filter: {
    //   must: {
    //     category: 'article'
    //   }
    // }
  },
  wait: true // Whether to wait for the operation to complete
});

console.log(result.data); // Deletion result
```

## Error Handling

All actions will return an error property if the operation fails. You can check for this property to handle errors gracefully.

```javascript
const result = await mintflow.execute('qdrant', {
  action: 'getPoints',
  collectionName: 'non_existent_collection',
  ids: ['vec1']
});

if (result.error) {
  console.error('Qdrant error:', result.error);
  // Handle the error appropriately
} else {
  console.log('Points:', result.data);
}
```

## Example Workflow

Here's an example of how to use the Qdrant plugin in a MintFlow workflow for semantic search:

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

// Then, search for similar vectors in Qdrant
const searchResult = await mintflow.execute('qdrant', {
  action: 'searchPoints',
  collectionName: 'document-embeddings',
  vector: embeddingResult.data.embedding,
  limit: 5,
  withPayload: true,
  filter: {
    must: {
      is_public: true
    }
  }
});

if (searchResult.error) {
  return {
    success: false,
    message: `Failed to search Qdrant: ${searchResult.error}`
  };
}

// Process the results
const searchResults = searchResult.data.map(match => ({
  title: match.payload.title,
  content: match.payload.content,
  url: match.payload.url,
  similarity: match.score
}));

return {
  success: true,
  results: searchResults
};
```

## Security Considerations

- The plugin uses the official Qdrant client library which handles authentication securely
- API keys are stored securely and never exposed in client-side code
- All operations are performed using the Qdrant client's methods, which handle input validation

## Limitations

- The plugin requires a valid Qdrant API key
- Some operations may be limited by your Qdrant plan's quotas and limits
- Vector dimensions must match the dimension of the collection

## Development

### Building the Plugin

```bash
cd packages/plugins/qdrant
pnpm build
```

### Running Tests

```bash
cd packages/plugins/qdrant
pnpm test
```

## License

This plugin is part of the MintFlow project and is subject to the same license terms.
