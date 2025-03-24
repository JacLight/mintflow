/**
 * Utilities for converting between MintFlow and Langflow data formats
 */

/**
 * Convert MintFlow configuration to Langflow configuration
 * 
 * @param config MintFlow configuration
 * @returns Langflow configuration
 */
export function mintflowToLangflowConfig(config: Record<string, any> = {}): Record<string, any> {
  const langflowConfig: Record<string, any> = {};
  
  // Map common fields
  if ('apiKey' in config) {
    langflowConfig.api_key = config.apiKey;
  }
  
  if ('namespace' in config) {
    langflowConfig.collection_name = config.namespace;
  }
  
  if ('collectionName' in config) {
    langflowConfig.collection_name = config.collectionName;
  }
  
  // Vector store specific mappings
  if ('url' in config) {
    langflowConfig.persist_directory = config.url;
  }
  
  // LLM specific mappings
  if ('model' in config) {
    langflowConfig.model_name = config.model;
  }
  
  if ('temperature' in config) {
    langflowConfig.temperature = config.temperature;
  }
  
  if ('maxTokens' in config) {
    langflowConfig.max_tokens = config.maxTokens;
  }
  
  // Document specific mappings
  if ('chunkSize' in config) {
    langflowConfig.chunk_size = config.chunkSize;
  }
  
  if ('chunkOverlap' in config) {
    langflowConfig.chunk_overlap = config.chunkOverlap;
  }
  
  // Copy any other fields as-is
  for (const key in config) {
    if (!['apiKey', 'namespace', 'collectionName', 'url', 'model', 'temperature', 'maxTokens', 'chunkSize', 'chunkOverlap'].includes(key)) {
      langflowConfig[key] = config[key];
    }
  }
  
  return langflowConfig;
}

/**
 * Convert Langflow result to MintFlow result
 * 
 * @param result Langflow result
 * @returns MintFlow result
 */
export function langflowToMintflowResult(result: Record<string, any> = {}): Record<string, any> {
  const mintflowResult: Record<string, any> = { ...result };
  
  // Convert snake_case to camelCase
  for (const key in result) {
    if (key.includes('_')) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      mintflowResult[camelKey] = result[key];
      delete mintflowResult[key];
    }
  }
  
  return mintflowResult;
}

/**
 * Convert MintFlow document to Langflow document
 * 
 * @param document MintFlow document
 * @returns Langflow document
 */
export function mintflowToLangflowDocument(document: {
  id: string;
  content: string;
  metadata: Record<string, any>;
}): Record<string, any> {
  return {
    id: document.id,
    page_content: document.content,
    metadata: document.metadata
  };
}

/**
 * Convert Langflow document to MintFlow document
 * 
 * @param document Langflow document
 * @returns MintFlow document
 */
export function langflowToMintflowDocument(document: {
  id: string;
  page_content: string;
  metadata: Record<string, any>;
}): Record<string, any> {
  return {
    id: document.id,
    content: document.page_content,
    metadata: document.metadata
  };
}

/**
 * Convert MintFlow message to Langflow message
 * 
 * @param message MintFlow message
 * @returns Langflow message
 */
export function mintflowToLangflowMessage(message: {
  role: 'user' | 'assistant' | 'system';
  content: string;
}): Record<string, any> {
  return {
    type: message.role,
    data: {
      content: message.content,
      additional_kwargs: {}
    }
  };
}

/**
 * Convert Langflow message to MintFlow message
 * 
 * @param message Langflow message
 * @returns MintFlow message
 */
export function langflowToMintflowMessage(message: {
  type: 'user' | 'assistant' | 'system';
  data: {
    content: string;
    additional_kwargs: Record<string, any>;
  };
}): Record<string, any> {
  return {
    role: message.type,
    content: message.data.content
  };
}

/**
 * Convert MintFlow embedding to Langflow embedding
 * 
 * @param embedding MintFlow embedding
 * @returns Langflow embedding
 */
export function mintflowToLangflowEmbedding(embedding: number[]): number[] {
  return embedding;
}

/**
 * Convert Langflow embedding to MintFlow embedding
 * 
 * @param embedding Langflow embedding
 * @returns MintFlow embedding
 */
export function langflowToMintflowEmbedding(embedding: number[]): number[] {
  return embedding;
}

/**
 * Convert MintFlow tool to Langflow tool
 * 
 * @param tool MintFlow tool
 * @returns Langflow tool
 */
export function mintflowToLangflowTool(tool: {
  name: string;
  description: string;
  type: string;
  config: Record<string, any>;
}): Record<string, any> {
  return {
    name: tool.name,
    description: tool.description,
    type: tool.type,
    config: mintflowToLangflowConfig(tool.config)
  };
}

/**
 * Convert Langflow tool to MintFlow tool
 * 
 * @param tool Langflow tool
 * @returns MintFlow tool
 */
export function langflowToMintflowTool(tool: {
  name: string;
  description: string;
  type: string;
  config: Record<string, any>;
}): Record<string, any> {
  return {
    name: tool.name,
    description: tool.description,
    type: tool.type,
    config: langflowToMintflowResult(tool.config)
  };
}
