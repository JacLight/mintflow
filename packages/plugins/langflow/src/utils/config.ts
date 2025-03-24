/**
 * Configuration utilities for the Langflow plugin
 */

/**
 * Configuration for the Langflow plugin
 */
export interface LangflowConfig {
  /**
   * The base URL for the Langflow API
   */
  apiBaseUrl?: string;

  /**
   * The timeout for API requests in milliseconds
   */
  apiTimeout?: number;

  /**
   * The API key for the Langflow API
   */
  apiKey?: string;

  /**
   * The default vector store type
   */
  defaultVectorStoreType?: 'chroma' | 'faiss' | 'pinecone' | 'qdrant' | 'weaviate' | 'redis' | 'milvus';

  /**
   * The default LLM provider
   */
  defaultLlmProvider?: 'openai' | 'anthropic' | 'google' | 'ollama' | 'local';

  /**
   * The default LLM model
   */
  defaultLlmModel?: string;

  /**
   * The default temperature for LLM generation
   */
  defaultTemperature?: number;

  /**
   * The default maximum number of tokens for LLM generation
   */
  defaultMaxTokens?: number;

  /**
   * The default chunk size for document splitting
   */
  defaultChunkSize?: number;

  /**
   * The default chunk overlap for document splitting
   */
  defaultChunkOverlap?: number;
}

/**
 * Default configuration for the Langflow plugin
 */
export const DEFAULT_CONFIG: LangflowConfig = {
  apiBaseUrl: process.env.LANGFLOW_API_BASE_URL || 'http://localhost:3000/api/langflow',
  apiTimeout: parseInt(process.env.LANGFLOW_API_TIMEOUT || '30000', 10),
  apiKey: process.env.LANGFLOW_API_KEY,
  defaultVectorStoreType: 'chroma',
  defaultLlmProvider: 'openai',
  defaultLlmModel: 'gpt-3.5-turbo',
  defaultTemperature: 0.7,
  defaultMaxTokens: 1024,
  defaultChunkSize: 1000,
  defaultChunkOverlap: 200
};

/**
 * Get the configuration for the Langflow plugin
 * 
 * @param config Custom configuration to merge with the default configuration
 * @returns The merged configuration
 */
export function getConfig(config: Partial<LangflowConfig> = {}): LangflowConfig {
  return {
    ...DEFAULT_CONFIG,
    ...config
  };
}

/**
 * Get an environment variable
 * 
 * @param name The name of the environment variable
 * @param defaultValue The default value to return if the environment variable is not set
 * @returns The value of the environment variable or the default value
 */
export function getEnv(name: string, defaultValue: string = ''): string {
  return process.env[name] || defaultValue;
}

/**
 * Get a boolean environment variable
 * 
 * @param name The name of the environment variable
 * @param defaultValue The default value to return if the environment variable is not set
 * @returns The boolean value of the environment variable or the default value
 */
export function getBooleanEnv(name: string, defaultValue: boolean = false): boolean {
  const value = getEnv(name, '');
  if (value === '') {
    return defaultValue;
  }
  return value.toLowerCase() === 'true' || value === '1';
}

/**
 * Get a numeric environment variable
 * 
 * @param name The name of the environment variable
 * @param defaultValue The default value to return if the environment variable is not set
 * @returns The numeric value of the environment variable or the default value
 */
export function getNumericEnv(name: string, defaultValue: number = 0): number {
  const value = getEnv(name, '');
  if (value === '') {
    return defaultValue;
  }
  return parseInt(value, 10);
}
