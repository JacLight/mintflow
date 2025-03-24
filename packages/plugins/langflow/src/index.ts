/**
 * Langflow Plugin for MintFlow
 * 
 * This plugin provides integration with Langflow, allowing you to use
 * LangChain components in your MintFlow workflows.
 */

// Export adapters
export { default as vectorStorePlugin } from './adapters/VectorStorePlugin.js';
export { default as langGraphPlugin } from './adapters/LangGraphPlugin.js';
export { default as agentPlugin } from './adapters/AgentPlugin.js';
export { default as documentPlugin } from './adapters/DocumentPlugin.js';

// Export types from adapters
export type { 
  VectorStoreConfig, 
  VectorStoreResult,
  SearchResult 
} from './adapters/VectorStorePlugin.js';

export type { 
  GraphConfig, 
  GraphNode, 
  GraphEdge, 
  GraphResult 
} from './adapters/LangGraphPlugin.js';

export type { 
  AgentConfig, 
  AgentTool, 
  AgentResult 
} from './adapters/AgentPlugin.js';

export type { 
  DocumentConfig, 
  DocumentResult, 
  SplitConfig 
} from './adapters/DocumentPlugin.js';

// Export utility functions
export { 
  getConfig, 
  getEnv, 
  getBooleanEnv, 
  getNumericEnv 
} from './utils/config.js';

export { 
  mintflowToLangflowConfig, 
  langflowToMintflowResult,
  mintflowToLangflowDocument,
  langflowToMintflowDocument,
  mintflowToLangflowMessage,
  langflowToMintflowMessage,
  mintflowToLangflowEmbedding,
  langflowToMintflowEmbedding,
  mintflowToLangflowTool,
  langflowToMintflowTool
} from './utils/conversion.js';

export { 
  createRunnerClient, 
  defaultRunnerClient, 
  LangflowRunnerClient 
} from './utils/runner.js';

// Export types from utilities
export type { LangflowConfig } from './utils/config.js';
export type { RunnerConfig } from './utils/runner.js';

// Export convenience functions for vector stores
export async function createVectorStore(config: {
  type: 'chroma' | 'faiss' | 'pinecone' | 'qdrant' | 'weaviate' | 'redis' | 'milvus';
  config?: Record<string, any>;
}): Promise<{ id: string; type: string; namespace: string; documentCount?: number; dimensions?: number; }> {
  const { result } = await vectorStorePlugin.actions[0].exec(config);
  return result;
}

export async function addDocuments(input: {
  vectorStoreId: string;
  documents: Array<{ content: string; metadata?: Record<string, any> }>;
  embeddings?: number[][];
}): Promise<{ count: number; ids: string[] }> {
  const { result } = await vectorStorePlugin.actions[1].exec(input);
  return result;
}

export async function searchDocuments(input: {
  vectorStoreId: string;
  query: string;
  k?: number;
  searchType?: 'similarity' | 'mmr' | 'hybrid';
  filter?: Record<string, any>;
}): Promise<SearchResult[]> {
  const { result } = await vectorStorePlugin.actions[2].exec(input);
  return result;
}

export async function deleteDocuments(input: {
  vectorStoreId: string;
  ids?: string[];
  filter?: Record<string, any>;
}): Promise<{ count: number }> {
  const { result } = await vectorStorePlugin.actions[3].exec(input);
  return result;
}

// Export convenience functions for LangGraph
export async function createGraph(input: {
  name: string;
  description?: string;
  entry_point?: string;
  nodes: GraphNode[];
  edges: GraphEdge[];
}): Promise<GraphResult> {
  const { result } = await langGraphPlugin.actions[0].exec(input);
  return result;
}

export async function runGraph(input: {
  graphId: string;
  input: Record<string, any>;
  max_iterations?: number;
  stream_output?: boolean;
}): Promise<any> {
  const { result } = await langGraphPlugin.actions[1].exec(input);
  return result;
}

export async function updateGraph(input: {
  graphId: string;
  name?: string;
  description?: string;
  nodes?: GraphNode[];
  edges?: GraphEdge[];
}): Promise<GraphResult> {
  const { result } = await langGraphPlugin.actions[2].exec(input);
  return result;
}

// Export convenience functions for agents
export async function createAgent(input: {
  name: string;
  description?: string;
  llm: {
    provider: 'openai' | 'anthropic' | 'google' | 'ollama' | 'local';
    model: string;
    temperature?: number;
    max_tokens?: number;
    [key: string]: any;
  };
  tools?: AgentTool[];
}): Promise<AgentResult> {
  const { result } = await agentPlugin.actions[0].exec(input);
  return result;
}

export async function runAgent(input: {
  agentId: string;
  input: {
    query: string;
    history?: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  };
}): Promise<any> {
  const { result } = await agentPlugin.actions[1].exec(input);
  return result;
}

export async function addTools(input: {
  agentId: string;
  tools: AgentTool[];
}): Promise<{ agentId: string; toolCount: number }> {
  const { result } = await agentPlugin.actions[2].exec(input);
  return result;
}

// Export convenience functions for documents
export async function loadDocument(input: DocumentConfig): Promise<DocumentResult> {
  const { result } = await documentPlugin.actions[0].exec(input);
  return result;
}

export async function splitDocument(input: {
  document: DocumentResult;
  chunkSize?: number;
  chunkOverlap?: number;
  separators?: string[];
}): Promise<DocumentResult[]> {
  const { result } = await documentPlugin.actions[1].exec(input);
  return result;
}

export async function transformDocument(input: {
  document: DocumentResult;
  transformation: 'html_to_text' | 'markdown_to_text' | 'translate' | 'summarize';
  options?: Record<string, any>;
}): Promise<DocumentResult> {
  const { result } = await documentPlugin.actions[2].exec(input);
  return result;
}

// Default export
export default {
  vectorStore: vectorStorePlugin,
  langGraph: langGraphPlugin,
  agent: agentPlugin,
  document: documentPlugin,
  
  // Convenience functions
  createVectorStore,
  addDocuments,
  searchDocuments,
  deleteDocuments,
  
  createGraph,
  runGraph,
  updateGraph,
  
  createAgent,
  runAgent,
  addTools,
  
  loadDocument,
  splitDocument,
  transformDocument
};
