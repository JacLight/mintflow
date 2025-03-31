import { ComponentRegistry } from '../registry/ComponentRegistry.js';
import { OpenAIEmbeddingsFactory } from '../factories/embeddings/OpenAIEmbeddings.js';
import { HuggingFaceEmbeddingsFactory } from '../factories/embeddings/HuggingFaceEmbeddings.js';
import { CohereEmbeddingsFactory } from '../factories/embeddings/CohereEmbeddings.js';
import { TensorFlowEmbeddingsFactory } from '../factories/embeddings/TensorFlowEmbeddings.js';

// Register embedding factories
const registry = ComponentRegistry.getInstance();
registry.registerComponent("openai", new OpenAIEmbeddingsFactory());
registry.registerComponent("huggingface", new HuggingFaceEmbeddingsFactory());
registry.registerComponent("cohere", new CohereEmbeddingsFactory());
registry.registerComponent("tensorflow", new TensorFlowEmbeddingsFactory());

/**
 * Embedding options
 */
export interface EmbeddingOptions {
  apiKey?: string;
  modelName?: string;
  [key: string]: any;
}

/**
 * Embedding Service for generating embeddings
 */
export class EmbeddingService {
  private static instance: EmbeddingService;
  private registry = ComponentRegistry.getInstance();
  private cache: Map<string, number[]> = new Map();

  private constructor() {}

  static getInstance(): EmbeddingService {
    if (!EmbeddingService.instance) {
      EmbeddingService.instance = new EmbeddingService();
    }
    return EmbeddingService.instance;
  }

  /**
   * Generates embeddings using OpenAI
   * 
   * @param texts The texts to embed
   * @param options Additional options for the embeddings
   * @returns An array of embeddings
   */
  async embedWithOpenAI(
    texts: string[],
    options: {
      apiKey?: string;
      modelName?: string;
      batchSize?: number;
      stripNewLines?: boolean;
      timeout?: number;
      basePath?: string;
      organization?: string;
    } = {}
  ): Promise<number[][]> {
    try {
      // Get the OpenAI embeddings factory
      const factory = this.registry.getComponentFactory("openai");
      
      // Create the embeddings with the provided configuration
      const embeddings = await factory.create(options);
      
      // Generate the embeddings
      return this.embedWithCache(texts, embeddings, "openai");
    } catch (error) {
      console.error("Error generating OpenAI embeddings:", error);
      throw new Error(`Failed to generate embeddings: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Generates embeddings using HuggingFace
   * 
   * @param texts The texts to embed
   * @param options Additional options for the embeddings
   * @returns An array of embeddings
   */
  async embedWithHuggingFace(
    texts: string[],
    options: {
      apiKey?: string;
      model?: string;
      endpointUrl?: string;
      maxRetries?: number;
      stripNewLines?: boolean;
      timeout?: number;
    } = {}
  ): Promise<number[][]> {
    try {
      // Get the HuggingFace embeddings factory
      const factory = this.registry.getComponentFactory("huggingface");
      
      // Create the embeddings with the provided configuration
      const embeddings = await factory.create(options);
      
      // Generate the embeddings
      return this.embedWithCache(texts, embeddings, "huggingface");
    } catch (error) {
      console.error("Error generating HuggingFace embeddings:", error);
      throw new Error(`Failed to generate embeddings: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Generates embeddings using Cohere
   * 
   * @param texts The texts to embed
   * @param options Additional options for the embeddings
   * @returns An array of embeddings
   */
  async embedWithCohere(
    texts: string[],
    options: {
      apiKey?: string;
      model?: string;
      truncate?: "NONE" | "START" | "END";
      maxRetries?: number;
      timeout?: number;
    } = {}
  ): Promise<number[][]> {
    try {
      // Get the Cohere embeddings factory
      const factory = this.registry.getComponentFactory("cohere");
      
      // Create the embeddings with the provided configuration
      const embeddings = await factory.create(options);
      
      // Generate the embeddings
      return this.embedWithCache(texts, embeddings, "cohere");
    } catch (error) {
      console.error("Error generating Cohere embeddings:", error);
      throw new Error(`Failed to generate embeddings: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Generates embeddings using TensorFlow
   * 
   * @param texts The texts to embed
   * @param options Additional options for the embeddings
   * @returns An array of embeddings
   */
  async embedWithTensorFlow(
    texts: string[],
    options: {
      modelName?: string;
      maxSeqLength?: number;
      batchSize?: number;
      cacheDir?: string;
    } = {}
  ): Promise<number[][]> {
    try {
      // Get the TensorFlow embeddings factory
      const factory = this.registry.getComponentFactory("tensorflow");
      
      // Create the embeddings with the provided configuration
      const embeddings = await factory.create(options);
      
      // Generate the embeddings
      return this.embedWithCache(texts, embeddings, "tensorflow");
    } catch (error) {
      console.error("Error generating TensorFlow embeddings:", error);
      throw new Error(`Failed to generate embeddings: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Generates embeddings using the specified provider
   * 
   * @param texts The texts to embed
   * @param provider The embedding provider to use
   * @param options Additional options for the embeddings
   * @returns An array of embeddings
   */
  async embed(
    texts: string[],
    provider: "openai" | "huggingface" | "cohere" | "tensorflow",
    options: EmbeddingOptions = {}
  ): Promise<number[][]> {
    switch (provider) {
      case "openai":
        return this.embedWithOpenAI(texts, options);
      case "huggingface":
        return this.embedWithHuggingFace(texts, options);
      case "cohere":
        return this.embedWithCohere(texts, options);
      case "tensorflow":
        return this.embedWithTensorFlow(texts, options);
      default:
        throw new Error(`Unsupported embedding provider: ${provider}`);
    }
  }

  /**
   * Generates embeddings with caching
   * 
   * @param texts The texts to embed
   * @param embeddings The embeddings instance
   * @param provider The embedding provider
   * @returns An array of embeddings
   */
  private async embedWithCache(
    texts: string[],
    embeddings: any,
    provider: string
  ): Promise<number[][]> {
    // Check if all texts are in the cache
    const cacheKeys = texts.map(text => `${provider}:${text}`);
    const cachedEmbeddings = cacheKeys.map(key => this.cache.get(key));
    
    // If all embeddings are in the cache, return them
    if (cachedEmbeddings.every(embedding => embedding !== undefined)) {
      return cachedEmbeddings as number[][];
    }
    
    // Generate embeddings for all texts
    const embeddingResults = await embeddings.embedDocuments(texts);
    
    // Cache the embeddings
    for (let i = 0; i < texts.length; i++) {
      this.cache.set(cacheKeys[i], embeddingResults[i]);
    }
    
    return embeddingResults;
  }

  /**
   * Clears the embedding cache
   */
  clearCache(): void {
    this.cache.clear();
  }
}

// Plugin definition for integration with MintFlow
const embeddingPlugin = {
  id: "embedding",
  name: "Embedding Plugin",
  icon: "GiVectorTriangle",
  description: "Embedding generation capabilities for vector search",
  documentation: "https://js.langchain.com/docs/modules/data_connection/text_embedding/",
  
  inputSchema: {
    type: 'object',
    properties: {
      texts: { type: 'array' },
      provider: { type: 'string' },
      options: { type: 'object' }
    }
  },
  
  actions: [
    {
      name: 'embedWithOpenAI',
      description: 'Generate embeddings using OpenAI',
      inputSchema: {
        type: 'object',
        properties: {
          texts: { 
            type: 'array',
            items: { type: 'string' },
            description: 'Texts to embed'
          },
          apiKey: { 
            type: 'string',
            description: 'OpenAI API key'
          },
          modelName: { 
            type: 'string',
            description: 'Model name to use for embeddings'
          },
          batchSize: { 
            type: 'number',
            description: 'Batch size for embedding generation'
          },
          stripNewLines: { 
            type: 'boolean',
            description: 'Whether to strip new lines from texts'
          }
        },
        required: ['texts']
      },
      outputSchema: {
        type: 'array',
        items: {
          type: 'array',
          items: { type: 'number' }
        }
      },
      execute: async function(input: {
        texts: string[];
        apiKey?: string;
        modelName?: string;
        batchSize?: number;
        stripNewLines?: boolean;
        timeout?: number;
        basePath?: string;
        organization?: string;
      }): Promise<number[][]> {
        const service = EmbeddingService.getInstance();
        const { texts, ...options } = input;
        return service.embedWithOpenAI(texts, options);
      }
    },
    {
      name: 'embedWithHuggingFace',
      description: 'Generate embeddings using HuggingFace',
      inputSchema: {
        type: 'object',
        properties: {
          texts: { 
            type: 'array',
            items: { type: 'string' },
            description: 'Texts to embed'
          },
          apiKey: { 
            type: 'string',
            description: 'HuggingFace API key'
          },
          model: { 
            type: 'string',
            description: 'Model name to use for embeddings'
          },
          endpointUrl: { 
            type: 'string',
            description: 'Custom endpoint URL'
          },
          maxRetries: { 
            type: 'number',
            description: 'Maximum number of retries'
          }
        },
        required: ['texts']
      },
      outputSchema: {
        type: 'array',
        items: {
          type: 'array',
          items: { type: 'number' }
        }
      },
      execute: async function(input: {
        texts: string[];
        apiKey?: string;
        model?: string;
        endpointUrl?: string;
        maxRetries?: number;
        stripNewLines?: boolean;
        timeout?: number;
      }): Promise<number[][]> {
        const service = EmbeddingService.getInstance();
        const { texts, ...options } = input;
        return service.embedWithHuggingFace(texts, options);
      }
    },
    {
      name: 'embedWithCohere',
      description: 'Generate embeddings using Cohere',
      inputSchema: {
        type: 'object',
        properties: {
          texts: { 
            type: 'array',
            items: { type: 'string' },
            description: 'Texts to embed'
          },
          apiKey: { 
            type: 'string',
            description: 'Cohere API key'
          },
          model: { 
            type: 'string',
            description: 'Model name to use for embeddings'
          },
          truncate: { 
            type: 'string',
            enum: ['NONE', 'START', 'END'],
            description: 'Truncation strategy'
          },
          maxRetries: { 
            type: 'number',
            description: 'Maximum number of retries'
          }
        },
        required: ['texts']
      },
      outputSchema: {
        type: 'array',
        items: {
          type: 'array',
          items: { type: 'number' }
        }
      },
      execute: async function(input: {
        texts: string[];
        apiKey?: string;
        model?: string;
        truncate?: "NONE" | "START" | "END";
        maxRetries?: number;
        timeout?: number;
      }): Promise<number[][]> {
        const service = EmbeddingService.getInstance();
        const { texts, ...options } = input;
        return service.embedWithCohere(texts, options);
      }
    },
    {
      name: 'embedWithTensorFlow',
      description: 'Generate embeddings using TensorFlow',
      inputSchema: {
        type: 'object',
        properties: {
          texts: { 
            type: 'array',
            items: { type: 'string' },
            description: 'Texts to embed'
          },
          modelName: { 
            type: 'string',
            description: 'Model name to use for embeddings'
          },
          maxSeqLength: { 
            type: 'number',
            description: 'Maximum sequence length'
          },
          batchSize: { 
            type: 'number',
            description: 'Batch size for embedding generation'
          },
          cacheDir: { 
            type: 'string',
            description: 'Directory to cache models'
          }
        },
        required: ['texts']
      },
      outputSchema: {
        type: 'array',
        items: {
          type: 'array',
          items: { type: 'number' }
        }
      },
      execute: async function(input: {
        texts: string[];
        modelName?: string;
        maxSeqLength?: number;
        batchSize?: number;
        cacheDir?: string;
      }): Promise<number[][]> {
        const service = EmbeddingService.getInstance();
        const { texts, ...options } = input;
        return service.embedWithTensorFlow(texts, options);
      }
    },
    {
      name: 'embed',
      description: 'Generate embeddings using the specified provider',
      inputSchema: {
        type: 'object',
        properties: {
          texts: { 
            type: 'array',
            items: { type: 'string' },
            description: 'Texts to embed'
          },
          provider: { 
            type: 'string',
            enum: ['openai', 'huggingface', 'cohere', 'tensorflow'],
            description: 'Embedding provider to use'
          },
          options: { 
            type: 'object',
            description: 'Additional options for the embeddings'
          }
        },
        required: ['texts', 'provider']
      },
      outputSchema: {
        type: 'array',
        items: {
          type: 'array',
          items: { type: 'number' }
        }
      },
      execute: async function(input: {
        texts: string[];
        provider: "openai" | "huggingface" | "cohere" | "tensorflow";
        options?: EmbeddingOptions;
      }): Promise<number[][]> {
        const service = EmbeddingService.getInstance();
        return service.embed(input.texts, input.provider, input.options || {});
      }
    },
    {
      name: 'clearCache',
      description: 'Clear the embedding cache',
      inputSchema: {
        type: 'object',
        properties: {}
      },
      outputSchema: {
        type: 'object',
        properties: {
          success: { type: 'boolean' }
        }
      },
      execute: async function(): Promise<{ success: boolean }> {
        const service = EmbeddingService.getInstance();
        service.clearCache();
        return { success: true };
      }
    }
  ]
};

export default embeddingPlugin;
