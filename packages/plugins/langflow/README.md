# MintFlow Langflow Plugin

This plugin provides integration with Langflow, allowing you to use Python-based LangChain components in your MintFlow workflows. It bridges the gap between JavaScript and Python, giving you access to the full power of LangChain, LangGraph, and other Python-based AI libraries.

## Features

- **Vector Stores**: Create and manage vector stores for semantic search (Chroma, FAISS, Pinecone, Qdrant, Weaviate, Redis, Milvus)
- **LangGraph**: Create and run LangGraph workflows with complex state management
- **Agents**: Create and run agents with various tools and capabilities
- **Documents**: Load, split, and transform documents from multiple sources

## Installation

```bash
# Using pnpm (recommended)
pnpm add @mintflow/plugin-langflow

# Using npm
npm install @mintflow/plugin-langflow

# Using yarn
yarn add @mintflow/plugin-langflow
```

## Requirements

- Node.js 18 or later
- Docker (for running the Langflow runner)
- Python 3.10 or later (if running without Docker)
- Redis (for communication between MintFlow and Langflow)

## Setup and Configuration

### 1. Docker Setup (Recommended)

The easiest way to get started is using Docker:

```bash
# Clone the repository if you haven't already
git clone https://github.com/mintflow/mintflow.git
cd mintflow

# Start the Langflow runner and required services
docker-compose up -d
```

This will start:
- Redis for communication
- Weaviate as a vector database
- MongoDB for document storage
- The Langflow runner service

### 2. Environment Variables

Configure the following environment variables:

```bash
# .env
# Required API keys
OPENAI_API_KEY=your-openai-api-key
ANTHROPIC_API_KEY=your-anthropic-api-key  # Optional
GOOGLE_API_KEY=your-google-api-key  # Optional
PINECONE_API_KEY=your-pinecone-api-key  # Optional

# Langflow configuration
LANGFLOW_API_BASE_URL=http://localhost:3000/api/langflow
LANGFLOW_API_TIMEOUT=30000  # Timeout in milliseconds
```

> **⚠️ Important Note**: API keys are passed to the Langflow runner container through environment variables. Make sure to keep your API keys secure and never commit them to version control.

### 3. Manual Setup (Without Docker)

If you prefer to run without Docker:

1. Install Python dependencies:
```bash
cd packages/python_runner
pip install -r requirements.txt
```

2. Start Redis:
```bash
# Install Redis if not already installed
# On macOS: brew install redis
# On Ubuntu: apt-get install redis-server
redis-server
```

3. Run the Langflow runner:
```bash
cd packages/python_runner
python langflow_runner.py
```

### 4. Build the Plugin (Development)

If you're developing or modifying the plugin:

```bash
cd packages/plugins/langflow
pnpm install
pnpm build
```

## Usage

### Vector Stores

```typescript
import { createVectorStore, addDocuments, searchDocuments } from '@mintflow/plugin-langflow';

// Create a vector store
const vectorStore = await createVectorStore({
  type: 'chroma',
  config: {
    namespace: 'my-collection'
  }
});

// Add documents
const result = await addDocuments({
  vectorStoreId: vectorStore.id,
  documents: [
    {
      content: 'This is a document about AI',
      metadata: { source: 'article', topic: 'AI' }
    },
    {
      content: 'This is a document about machine learning',
      metadata: { source: 'book', topic: 'ML' }
    }
  ]
});

// Search documents
const searchResults = await searchDocuments({
  vectorStoreId: vectorStore.id,
  query: 'What is AI?',
  k: 2,
  searchType: 'similarity'
});
```

### LangGraph

```typescript
import { createGraph, runGraph } from '@mintflow/plugin-langflow';

// Create a graph
const graph = await createGraph({
  name: 'My Graph',
  description: 'A simple graph',
  nodes: [
    {
      id: 'node1',
      type: 'llm',
      config: {
        model: 'gpt-3.5-turbo',
        temperature: 0.7
      }
    },
    {
      id: 'node2',
      type: 'tool',
      config: {
        name: 'calculator'
      }
    }
  ],
  edges: [
    {
      source: 'node1',
      target: 'node2'
    }
  ]
});

// Run the graph
const result = await runGraph({
  graphId: graph.graphId,
  input: {
    query: 'What is 2 + 2?'
  }
});
```

### Agents

```typescript
import { createAgent, runAgent, addTools } from '@mintflow/plugin-langflow';

// Create an agent
const agent = await createAgent({
  name: 'My Agent',
  description: 'A helpful assistant',
  llm: {
    provider: 'openai',
    model: 'gpt-3.5-turbo',
    temperature: 0.7
  },
  tools: [
    {
      name: 'calculator',
      description: 'Useful for performing calculations',
      type: 'function',
      config: {}
    }
  ]
});

// Run the agent
const result = await runAgent({
  agentId: agent.agentId,
  input: {
    query: 'What is 2 + 2?'
  }
});

// Add tools to the agent
const toolResult = await addTools({
  agentId: agent.agentId,
  tools: [
    {
      name: 'weather',
      description: 'Get the weather for a location',
      type: 'function',
      config: {}
    }
  ]
});
```

### Documents

```typescript
import { loadDocument, splitDocument, transformDocument } from '@mintflow/plugin-langflow';

// Load a document
const document = await loadDocument({
  source: '/path/to/document.pdf',
  type: 'pdf'
});

// Split the document
const chunks = await splitDocument({
  document,
  chunkSize: 1000,
  chunkOverlap: 200
});

// Transform the document
const transformedDocument = await transformDocument({
  document,
  transformation: 'summarize'
});
```

## API Reference

### Vector Stores

#### `createVectorStore(config)`

Create a new vector store.

```typescript
const vectorStore = await createVectorStore({
  type: 'chroma' | 'faiss' | 'pinecone' | 'qdrant' | 'weaviate' | 'redis' | 'milvus',
  config?: {
    apiKey?: string;
    url?: string;
    namespace?: string;
    collectionName?: string;
    [key: string]: any;
  }
});
```

#### `addDocuments(input)`

Add documents to a vector store.

```typescript
const result = await addDocuments({
  vectorStoreId: string;
  documents: Array<{
    content: string;
    metadata?: Record<string, any>;
  }>;
  embeddings?: number[][];
});
```

#### `searchDocuments(input)`

Search for documents in a vector store.

```typescript
const results = await searchDocuments({
  vectorStoreId: string;
  query: string;
  k?: number;
  searchType?: 'similarity' | 'mmr' | 'hybrid';
  filter?: Record<string, any>;
});
```

#### `deleteDocuments(input)`

Delete documents from a vector store.

```typescript
const result = await deleteDocuments({
  vectorStoreId: string;
  ids?: string[];
  filter?: Record<string, any>;
});
```

### LangGraph

#### `createGraph(input)`

Create a new LangGraph workflow.

```typescript
const graph = await createGraph({
  name: string;
  description?: string;
  entry_point?: string;
  nodes: Array<{
    id: string;
    type: 'llm' | 'tool' | 'custom';
    config: Record<string, any>;
  }>;
  edges: Array<{
    source: string;
    target: string;
    condition?: string;
  }>;
});
```

#### `runGraph(input)`

Run a LangGraph workflow.

```typescript
const result = await runGraph({
  graphId: string;
  input: Record<string, any>;
  max_iterations?: number;
  stream_output?: boolean;
});
```

#### `updateGraph(input)`

Update a LangGraph workflow.

```typescript
const graph = await updateGraph({
  graphId: string;
  name?: string;
  description?: string;
  nodes?: Array<{
    id: string;
    type: 'llm' | 'tool' | 'custom';
    config: Record<string, any>;
  }>;
  edges?: Array<{
    source: string;
    target: string;
    condition?: string;
  }>;
});
```

### Agents

#### `createAgent(input)`

Create a new agent.

```typescript
const agent = await createAgent({
  name: string;
  description?: string;
  llm: {
    provider: 'openai' | 'anthropic' | 'google' | 'ollama' | 'local';
    model: string;
    temperature?: number;
    max_tokens?: number;
    [key: string]: any;
  };
  tools?: Array<{
    name: string;
    description: string;
    type: 'function' | 'retrieval' | 'web' | 'custom';
    config: Record<string, any>;
  }>;
});
```

#### `runAgent(input)`

Run an agent with a query.

```typescript
const result = await runAgent({
  agentId: string;
  input: {
    query: string;
    history?: Array<{
      role: 'user' | 'assistant' | 'system';
      content: string;
    }>;
  };
});
```

#### `addTools(input)`

Add tools to an agent.

```typescript
const result = await addTools({
  agentId: string;
  tools: Array<{
    name: string;
    description: string;
    type: 'function' | 'retrieval' | 'web' | 'custom';
    config: Record<string, any>;
  }>;
});
```

### Documents

#### `loadDocument(input)`

Load a document from a file or URL.

```typescript
const document = await loadDocument({
  source: string;
  type: 'pdf' | 'docx' | 'txt' | 'csv' | 'json' | 'html' | 'url';
  options?: Record<string, any>;
});
```

#### `splitDocument(input)`

Split a document into chunks.

```typescript
const chunks = await splitDocument({
  document: {
    id: string;
    content: string;
    metadata: Record<string, any>;
  };
  chunkSize?: number;
  chunkOverlap?: number;
  separators?: string[];
});
```

#### `transformDocument(input)`

Apply a transformation to a document.

```typescript
const transformedDocument = await transformDocument({
  document: {
    id: string;
    content: string;
    metadata: Record<string, any>;
  };
  transformation: 'html_to_text' | 'markdown_to_text' | 'translate' | 'summarize';
  options?: Record<string, any>;
});
```

## Advanced Usage

### Vector Store Options by Type

Each vector store type has specific configuration options:

#### Chroma
```typescript
const chromaStore = await createVectorStore({
  type: 'chroma',
  config: {
    namespace: 'my-collection',
    url: './chroma_db',  // Local directory path
    collectionName: 'my-documents'
  }
});
```

#### FAISS
```typescript
const faissStore = await createVectorStore({
  type: 'faiss',
  config: {
    namespace: 'my-collection',
    // FAISS stores in memory by default, but can be persisted
    url: './faiss_index'  // Optional path to save the index
  }
});
```

#### Pinecone
```typescript
const pineconeStore = await createVectorStore({
  type: 'pinecone',
  config: {
    apiKey: 'your-pinecone-api-key',  // Can also use environment variable
    environment: 'us-west1-gcp',
    index_name: 'my-pinecone-index',
    namespace: 'my-namespace',
    text_key: 'text'  // Field name for the text content
  }
});
```

#### Weaviate
```typescript
const weaviateStore = await createVectorStore({
  type: 'weaviate',
  config: {
    url: 'http://localhost:8080',  // Weaviate server URL
    index_name: 'Document',  // Class name in Weaviate
    text_key: 'content'  // Property name for the text content
  }
});
```

### LangGraph Advanced Features

#### Conditional Edges

You can create conditional edges in your graph:

```typescript
const graph = await createGraph({
  name: 'Conditional Flow',
  nodes: [
    {
      id: 'start',
      type: 'llm',
      config: { model: 'gpt-3.5-turbo' }
    },
    {
      id: 'branch_a',
      type: 'tool',
      config: { name: 'tool_a' }
    },
    {
      id: 'branch_b',
      type: 'tool',
      config: { name: 'tool_b' }
    }
  ],
  edges: [
    {
      source: 'start',
      target: 'branch_a',
      condition: 'state.response && state.response.includes("option a")'
    },
    {
      source: 'start',
      target: 'branch_b',
      condition: 'state.response && state.response.includes("option b")'
    }
  ]
});
```

#### Streaming Output

You can stream the output of a graph execution:

```typescript
const result = await runGraph({
  graphId: graph.graphId,
  input: { query: 'Process this step by step' },
  stream_output: true,
  max_iterations: 10  // Limit the number of iterations
});

// Result will include steps that can be processed one by one
console.log(result.steps);
```

### Agent Tools

Agents can use various types of tools:

#### Function Tools
```typescript
const agent = await createAgent({
  name: 'Function Agent',
  llm: { provider: 'openai', model: 'gpt-3.5-turbo' },
  tools: [
    {
      name: 'calculator',
      description: 'Useful for performing calculations',
      type: 'function',
      config: {}
    }
  ]
});
```

#### Retrieval Tools
```typescript
// First create a vector store
const vectorStore = await createVectorStore({
  type: 'chroma',
  config: { namespace: 'knowledge-base' }
});

// Add documents to the vector store
await addDocuments({
  vectorStoreId: vectorStore.id,
  documents: [/* your documents */]
});

// Create an agent with a retrieval tool
const agent = await createAgent({
  name: 'Retrieval Agent',
  llm: { provider: 'openai', model: 'gpt-3.5-turbo' },
  tools: [
    {
      name: 'knowledge_base',
      description: 'Search the knowledge base for information',
      type: 'retrieval',
      config: {
        vectorStoreId: vectorStore.id,
        k: 3  // Number of results to return
      }
    }
  ]
});
```

#### Custom Tools
```typescript
const agent = await createAgent({
  name: 'Custom Tool Agent',
  llm: { provider: 'openai', model: 'gpt-3.5-turbo' },
  tools: [
    {
      name: 'custom_tool',
      description: 'A custom tool that does something special',
      type: 'custom',
      config: {
        code: `
          def tool_func(input_str):
              # This is Python code that will run on the server
              return f"Processed: {input_str}"
        `
      }
    }
  ]
});
```

### Document Transformations

#### HTML to Text
```typescript
const transformedDoc = await transformDocument({
  document: myHtmlDocument,
  transformation: 'html_to_text'
});
```

#### Markdown to Text
```typescript
const transformedDoc = await transformDocument({
  document: myMarkdownDocument,
  transformation: 'markdown_to_text'
});
```

#### Translation
```typescript
const translatedDoc = await transformDocument({
  document: myDocument,
  transformation: 'translate',
  options: {
    language: 'fr'  // Target language
  }
});
```

#### Summarization
```typescript
const summary = await transformDocument({
  document: myLongDocument,
  transformation: 'summarize'
});
```

## Nuances and Limitations

### Vector Store Considerations

- **Chroma**: Works best for local development. Persists to disk by default.
- **FAISS**: Fast in-memory vector store. Good for quick prototyping but doesn't persist by default.
- **Pinecone**: Requires an account and API key. Best for production use cases.
- **Weaviate**: Offers hybrid search capabilities but requires more setup.

### LangGraph Limitations

- **State Management**: The state is passed between nodes as a dictionary. Make sure your nodes return the expected state format.
- **Error Handling**: If a node fails, the entire graph execution will fail. Consider adding error handling in your node functions.
- **Conditional Edges**: Conditions are evaluated as JavaScript strings, which are converted to Python code. Keep them simple to avoid syntax issues.

### Agent Considerations

- **Tool Selection**: Agents may not always choose the most appropriate tool. Provide clear descriptions to help the agent make better decisions.
- **Token Limits**: Complex agent runs can hit token limits. Consider using a model with higher context limits for complex tasks.
- **Statelessness**: By default, agents don't maintain state between runs. Use the history parameter to provide conversation context.

### Document Processing

- **Large Files**: Very large files may cause memory issues. Consider splitting them before processing.
- **Supported Formats**: While many formats are supported, some may require additional dependencies.
- **Embedding Limits**: There are token limits for embedding generation. Very long documents should be split first.

## Troubleshooting

### Common Issues

#### Connection Problems
```
Error: Langflow runner is not responding
```
- Check if the Docker containers are running: `docker-compose ps`
- Verify Redis is running and accessible
- Check the Langflow runner logs: `docker-compose logs langflow-runner`

#### API Key Issues
```
Error: Failed to create vector store: OpenAI API key not found
```
- Ensure you've set the required API keys in your environment variables
- Check if the API keys are being passed correctly to the Docker container

#### Memory Issues
```
Error: Process out of memory
```
- Reduce batch sizes when adding documents
- Split large documents into smaller chunks
- Increase container memory limits in docker-compose.yml

### Debugging

To enable debug logging:

```typescript
// In your application
import { getConfig } from '@mintflow/plugin-langflow';

// Enable debug mode
process.env.LANGFLOW_DEBUG = 'true';

// Or configure via the API
const config = getConfig({
  debug: true,
  apiTimeout: 60000  // Increase timeout for debugging
});
```

In the Python runner:
```bash
# Set environment variable before starting
LANGFLOW_LOG_LEVEL=DEBUG python langflow_runner.py
```

## License

MIT
