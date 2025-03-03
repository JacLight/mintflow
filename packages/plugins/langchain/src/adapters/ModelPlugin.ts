import { ComponentRegistry } from '../registry/ComponentRegistry.js';
import { ChatOpenAIFactory } from '../factories/models/ChatOpenAI.js';
import { ChatAnthropicFactory } from '../factories/models/ChatAnthropic.js';
import { AnthropicEmbeddingsFactory } from '../factories/models/AnthropicEmbeddings.js';
import { ChatGoogleGenerativeAIFactory } from '../factories/models/ChatGoogleGenerativeAI.js';
import { GoogleGenerativeAIEmbeddingsFactory } from '../factories/models/GoogleGenerativeAIEmbeddings.js';
import { OllamaLLMFactory } from '../factories/models/OllamaLLM.js';
import { LlamaCppFactory } from '../factories/models/LlamaCpp.js';
import { LocalAIFactory } from '../factories/models/LocalAI.js';

// Register model factories
const registry = ComponentRegistry.getInstance();
registry.registerComponent("chat-openai", new ChatOpenAIFactory());
registry.registerComponent("chat-anthropic", new ChatAnthropicFactory());
registry.registerComponent("anthropic-embeddings", new AnthropicEmbeddingsFactory());
registry.registerComponent("chat-google-genai", new ChatGoogleGenerativeAIFactory());
registry.registerComponent("google-genai-embeddings", new GoogleGenerativeAIEmbeddingsFactory());
registry.registerComponent("ollama", new OllamaLLMFactory());
registry.registerComponent("llama-cpp", new LlamaCppFactory());
registry.registerComponent("local-ai", new LocalAIFactory());

/**
 * Model options
 */
export interface ModelOptions {
  [key: string]: any;
}

/**
 * Model Service for language models
 */
export class ModelService {
  private static instance: ModelService;
  private registry = ComponentRegistry.getInstance();

  private constructor() {}

  static getInstance(): ModelService {
    if (!ModelService.instance) {
      ModelService.instance = new ModelService();
    }
    return ModelService.instance;
  }

  /**
   * Creates a ChatOpenAI model
   * 
   * @param options Options for the ChatOpenAI model
   * @returns A new ChatOpenAI model
   */
  async createChatOpenAI(options: {
    apiKey?: string;
    organization?: string;
    modelName?: string;
    temperature?: number;
    topP?: number;
    maxTokens?: number;
    presencePenalty?: number;
    frequencyPenalty?: number;
    n?: number;
    logitBias?: Record<string, number>;
    stopSequences?: string[];
    streaming?: boolean;
    callbacks?: any[];
    timeout?: number;
    maxRetries?: number;
    baseURL?: string;
    defaultHeaders?: Record<string, string>;
    cache?: boolean;
  } = {}): Promise<any> {
    try {
      // Get the ChatOpenAI factory
      const factory = this.registry.getComponentFactory("chat-openai");
      
      // Create the model with the provided configuration
      return factory.create(options);
    } catch (error) {
      console.error("Error creating ChatOpenAI model:", error);
      throw new Error(`Failed to create model: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Creates a ChatAnthropic model
   * 
   * @param options Options for the ChatAnthropic model
   * @returns A new ChatAnthropic model
   */
  async createChatAnthropic(options: {
    apiKey?: string;
    modelName?: string;
    temperature?: number;
    topP?: number;
    topK?: number;
    maxTokens?: number;
    stopSequences?: string[];
    streaming?: boolean;
    callbacks?: any[];
    timeout?: number;
    maxRetries?: number;
    baseURL?: string;
    defaultHeaders?: Record<string, string>;
    cache?: boolean;
  } = {}): Promise<any> {
    try {
      // Get the ChatAnthropic factory
      const factory = this.registry.getComponentFactory("chat-anthropic");
      
      // Create the model with the provided configuration
      return factory.create(options);
    } catch (error) {
      console.error("Error creating ChatAnthropic model:", error);
      throw new Error(`Failed to create model: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Creates an AnthropicEmbeddings model
   * 
   * @param options Options for the AnthropicEmbeddings model
   * @returns A new AnthropicEmbeddings model
   */
  async createAnthropicEmbeddings(options: {
    apiKey?: string;
    modelName?: string;
    dimensions?: number;
    batchSize?: number;
    stripNewLines?: boolean;
    timeout?: number;
    maxRetries?: number;
    baseURL?: string;
    defaultHeaders?: Record<string, string>;
    cache?: boolean;
  } = {}): Promise<any> {
    try {
      // Get the AnthropicEmbeddings factory
      const factory = this.registry.getComponentFactory("anthropic-embeddings");
      
      // Create the model with the provided configuration
      return factory.create(options);
    } catch (error) {
      console.error("Error creating AnthropicEmbeddings model:", error);
      throw new Error(`Failed to create model: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Creates a ChatGoogleGenerativeAI model
   * 
   * @param options Options for the ChatGoogleGenerativeAI model
   * @returns A new ChatGoogleGenerativeAI model
   */
  async createChatGoogleGenerativeAI(options: {
    apiKey?: string;
    modelName?: string;
    temperature?: number;
    topP?: number;
    topK?: number;
    maxOutputTokens?: number;
    safetySettings?: Array<{
      category: string;
      threshold: string;
    }>;
    stopSequences?: string[];
    streaming?: boolean;
    callbacks?: any[];
    maxRetries?: number;
    cache?: boolean;
  } = {}): Promise<any> {
    try {
      // Get the ChatGoogleGenerativeAI factory
      const factory = this.registry.getComponentFactory("chat-google-genai");
      
      // Create the model with the provided configuration
      return factory.create(options);
    } catch (error) {
      console.error("Error creating ChatGoogleGenerativeAI model:", error);
      throw new Error(`Failed to create model: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Creates a GoogleGenerativeAIEmbeddings model
   * 
   * @param options Options for the GoogleGenerativeAIEmbeddings model
   * @returns A new GoogleGenerativeAIEmbeddings model
   */
  async createGoogleGenerativeAIEmbeddings(options: {
    apiKey?: string;
    modelName?: string;
    taskType?: "RETRIEVAL_QUERY" | "RETRIEVAL_DOCUMENT" | "SEMANTIC_SIMILARITY" | "CLASSIFICATION" | "CLUSTERING";
    title?: string;
    dimensions?: number;
    batchSize?: number;
    stripNewLines?: boolean;
    maxRetries?: number;
    cache?: boolean;
  } = {}): Promise<any> {
    try {
      // Get the GoogleGenerativeAIEmbeddings factory
      const factory = this.registry.getComponentFactory("google-genai-embeddings");
      
      // Create the model with the provided configuration
      return factory.create(options);
    } catch (error) {
      console.error("Error creating GoogleGenerativeAIEmbeddings model:", error);
      throw new Error(`Failed to create model: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Creates an OllamaLLM model
   * 
   * @param options Options for the OllamaLLM model
   * @returns A new OllamaLLM model
   */
  async createOllamaLLM(options: {
    baseUrl?: string;
    modelName?: string;
    temperature?: number;
    topP?: number;
    topK?: number;
    numPredict?: number;
    numCtx?: number;
    repeatPenalty?: number;
    repeatLastN?: number;
    frequencyPenalty?: number;
    presencePenalty?: number;
    stopSequences?: string[];
    streaming?: boolean;
    callbacks?: any[];
    cache?: boolean;
    format?: "json" | "none";
    keepAlive?: string;
    mirostat?: number;
    mirostatEta?: number;
    mirostatTau?: number;
    numGpu?: number;
    numThread?: number;
    seed?: number;
    tfsZ?: number;
    timeout?: number;
  } = {}): Promise<any> {
    try {
      // Get the OllamaLLM factory
      const factory = this.registry.getComponentFactory("ollama");
      
      // Create the model with the provided configuration
      return factory.create(options);
    } catch (error) {
      console.error("Error creating OllamaLLM model:", error);
      throw new Error(`Failed to create model: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Creates a LlamaCpp model
   * 
   * @param options Options for the LlamaCpp model
   * @returns A new LlamaCpp model
   */
  async createLlamaCpp(options: {
    modelPath: string;
    temperature?: number;
    topP?: number;
    topK?: number;
    maxTokens?: number;
    contextSize?: number;
    batchSize?: number;
    repeatPenalty?: number;
    lastNTokensSize?: number;
    seed?: number;
    stopSequences?: string[];
    streaming?: boolean;
    callbacks?: any[];
    cache?: boolean;
    threads?: number;
    gpuLayers?: number;
    f16Kv?: boolean;
    logitsAll?: boolean;
    vocabOnly?: boolean;
    useMlock?: boolean;
    nBatch?: number;
    mainGpu?: number;
    tensorSplit?: number[];
    embedding?: boolean;
    verbose?: boolean;
  }): Promise<any> {
    try {
      // Check required parameters
      if (!options.modelPath) {
        throw new Error("Model path is required");
      }
      
      // Get the LlamaCpp factory
      const factory = this.registry.getComponentFactory("llama-cpp");
      
      // Create the model with the provided configuration
      return factory.create(options);
    } catch (error) {
      console.error("Error creating LlamaCpp model:", error);
      throw new Error(`Failed to create model: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Creates a LocalAI model
   * 
   * @param options Options for the LocalAI model
   * @returns A new LocalAI model
   */
  async createLocalAI(options: {
    baseUrl: string;
    modelName: string;
    temperature?: number;
    topP?: number;
    topK?: number;
    maxTokens?: number;
    presencePenalty?: number;
    frequencyPenalty?: number;
    stopSequences?: string[];
    streaming?: boolean;
    callbacks?: any[];
    cache?: boolean;
    timeout?: number;
    headers?: Record<string, string>;
    apiKey?: string;
  }): Promise<any> {
    try {
      // Check required parameters
      if (!options.baseUrl) {
        throw new Error("Base URL is required");
      }
      if (!options.modelName) {
        throw new Error("Model name is required");
      }
      
      // Get the LocalAI factory
      const factory = this.registry.getComponentFactory("local-ai");
      
      // Create the model with the provided configuration
      return factory.create(options);
    } catch (error) {
      console.error("Error creating LocalAI model:", error);
      throw new Error(`Failed to create model: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Invokes a model with messages
   * 
   * @param model The model to invoke
   * @param messages The messages to send to the model
   * @returns The model's response
   */
  async invoke(
    model: any,
    messages: Array<{
      role: "system" | "user" | "assistant" | "function" | "tool";
      content: string;
      name?: string;
      tool_call_id?: string;
    }>
  ): Promise<any> {
    try {
      // Check if the model has the required methods
      if (typeof model.invoke !== 'function') {
        throw new Error("Invalid model: missing invoke method");
      }
      
      // Invoke the model
      return model.invoke(messages);
    } catch (error) {
      console.error("Error invoking model:", error);
      throw new Error(`Failed to invoke model: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Generates embeddings for text
   * 
   * @param model The model to use for embeddings
   * @param text The text to generate embeddings for
   * @returns The generated embeddings
   */
  async embeddings(
    model: any,
    text: string | string[]
  ): Promise<number[] | number[][]> {
    try {
      // Check if the model has the required methods
      if (typeof model.embeddings !== 'function') {
        throw new Error("Invalid model: missing embeddings method");
      }
      
      // Generate embeddings
      return model.embeddings(text);
    } catch (error) {
      console.error("Error generating embeddings:", error);
      throw new Error(`Failed to generate embeddings: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Moderates text for harmful content
   * 
   * @param model The model to use for moderation
   * @param text The text to moderate
   * @returns The moderation results
   */
  async moderation(
    model: any,
    text: string | string[]
  ): Promise<any> {
    try {
      // Check if the model has the required methods
      if (typeof model.moderation !== 'function') {
        throw new Error("Invalid model: missing moderation method");
      }
      
      // Moderate the text
      return model.moderation(text);
    } catch (error) {
      console.error("Error moderating text:", error);
      throw new Error(`Failed to moderate text: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

// Plugin definition for integration with MintFlow
const modelPlugin = {
  id: "model",
  name: "Model Plugin",
  icon: "GiArtificialIntelligence",
  description: "Language model capabilities for AI applications",
  documentation: "https://js.langchain.com/docs/modules/model_io/models/",
  
  inputSchema: {
    type: 'object',
    properties: {
      model: { type: 'object' },
      messages: { type: 'array' },
      text: { type: 'string' },
      options: { type: 'object' }
    }
  },
  
  actions: [
    {
      name: 'createChatOpenAI',
      description: 'Create a ChatOpenAI model',
      inputSchema: {
        type: 'object',
        properties: {
          apiKey: { 
            type: 'string',
            description: 'OpenAI API key'
          },
          organization: { 
            type: 'string',
            description: 'OpenAI organization ID'
          },
          modelName: { 
            type: 'string',
            description: 'Model name (e.g., gpt-3.5-turbo, gpt-4)'
          },
          temperature: { 
            type: 'number',
            description: 'Sampling temperature (0-2)'
          },
          topP: { 
            type: 'number',
            description: 'Nucleus sampling parameter (0-1)'
          },
          maxTokens: { 
            type: 'number',
            description: 'Maximum number of tokens to generate'
          },
          streaming: { 
            type: 'boolean',
            description: 'Whether to stream the response'
          },
          callbacks: { 
            type: 'array',
            description: 'Callbacks for streaming'
          }
        }
      },
      outputSchema: {
        type: 'object',
        description: 'ChatOpenAI model'
      },
      execute: async function(input: {
        apiKey?: string;
        organization?: string;
        modelName?: string;
        temperature?: number;
        topP?: number;
        maxTokens?: number;
        presencePenalty?: number;
        frequencyPenalty?: number;
        n?: number;
        logitBias?: Record<string, number>;
        stopSequences?: string[];
        streaming?: boolean;
        callbacks?: any[];
        timeout?: number;
        maxRetries?: number;
        baseURL?: string;
        defaultHeaders?: Record<string, string>;
        cache?: boolean;
      }): Promise<any> {
        const service = ModelService.getInstance();
        return service.createChatOpenAI(input);
      }
    },
    {
      name: 'createChatAnthropic',
      description: 'Create a ChatAnthropic model',
      inputSchema: {
        type: 'object',
        properties: {
          apiKey: { 
            type: 'string',
            description: 'Anthropic API key'
          },
          modelName: { 
            type: 'string',
            description: 'Model name (e.g., claude-3-opus-20240229, claude-3-sonnet-20240229)'
          },
          temperature: { 
            type: 'number',
            description: 'Sampling temperature (0-1)'
          },
          topP: { 
            type: 'number',
            description: 'Nucleus sampling parameter (0-1)'
          },
          topK: { 
            type: 'number',
            description: 'Top-k sampling parameter'
          },
          maxTokens: { 
            type: 'number',
            description: 'Maximum number of tokens to generate'
          },
          streaming: { 
            type: 'boolean',
            description: 'Whether to stream the response'
          },
          callbacks: { 
            type: 'array',
            description: 'Callbacks for streaming'
          }
        }
      },
      outputSchema: {
        type: 'object',
        description: 'ChatAnthropic model'
      },
      execute: async function(input: {
        apiKey?: string;
        modelName?: string;
        temperature?: number;
        topP?: number;
        topK?: number;
        maxTokens?: number;
        stopSequences?: string[];
        streaming?: boolean;
        callbacks?: any[];
        timeout?: number;
        maxRetries?: number;
        baseURL?: string;
        defaultHeaders?: Record<string, string>;
        cache?: boolean;
      }): Promise<any> {
        const service = ModelService.getInstance();
        return service.createChatAnthropic(input);
      }
    },
    {
      name: 'createAnthropicEmbeddings',
      description: 'Create an AnthropicEmbeddings model',
      inputSchema: {
        type: 'object',
        properties: {
          apiKey: { 
            type: 'string',
            description: 'Anthropic API key'
          },
          modelName: { 
            type: 'string',
            description: 'Model name (e.g., claude-3-embedding-20240229)'
          },
          dimensions: { 
            type: 'number',
            description: 'Dimensions of the embeddings'
          },
          batchSize: { 
            type: 'number',
            description: 'Batch size for processing multiple texts'
          },
          stripNewLines: { 
            type: 'boolean',
            description: 'Whether to strip new lines from texts'
          }
        }
      },
      outputSchema: {
        type: 'object',
        description: 'AnthropicEmbeddings model'
      },
      execute: async function(input: {
        apiKey?: string;
        modelName?: string;
        dimensions?: number;
        batchSize?: number;
        stripNewLines?: boolean;
        timeout?: number;
        maxRetries?: number;
        baseURL?: string;
        defaultHeaders?: Record<string, string>;
        cache?: boolean;
      }): Promise<any> {
        const service = ModelService.getInstance();
        return service.createAnthropicEmbeddings(input);
      }
    },
    {
      name: 'createChatGoogleGenerativeAI',
      description: 'Create a ChatGoogleGenerativeAI model',
      inputSchema: {
        type: 'object',
        properties: {
          apiKey: { 
            type: 'string',
            description: 'Google AI API key'
          },
          modelName: { 
            type: 'string',
            description: 'Model name (e.g., gemini-pro, gemini-pro-vision)'
          },
          temperature: { 
            type: 'number',
            description: 'Sampling temperature (0-1)'
          },
          topP: { 
            type: 'number',
            description: 'Nucleus sampling parameter (0-1)'
          },
          topK: { 
            type: 'number',
            description: 'Top-k sampling parameter'
          },
          maxOutputTokens: { 
            type: 'number',
            description: 'Maximum number of tokens to generate'
          },
          streaming: { 
            type: 'boolean',
            description: 'Whether to stream the response'
          },
          callbacks: { 
            type: 'array',
            description: 'Callbacks for streaming'
          }
        }
      },
      outputSchema: {
        type: 'object',
        description: 'ChatGoogleGenerativeAI model'
      },
      execute: async function(input: {
        apiKey?: string;
        modelName?: string;
        temperature?: number;
        topP?: number;
        topK?: number;
        maxOutputTokens?: number;
        safetySettings?: Array<{
          category: string;
          threshold: string;
        }>;
        stopSequences?: string[];
        streaming?: boolean;
        callbacks?: any[];
        maxRetries?: number;
        cache?: boolean;
      }): Promise<any> {
        const service = ModelService.getInstance();
        return service.createChatGoogleGenerativeAI(input);
      }
    },
    {
      name: 'createGoogleGenerativeAIEmbeddings',
      description: 'Create a GoogleGenerativeAIEmbeddings model',
      inputSchema: {
        type: 'object',
        properties: {
          apiKey: { 
            type: 'string',
            description: 'Google AI API key'
          },
          modelName: { 
            type: 'string',
            description: 'Model name (e.g., embedding-001)'
          },
          taskType: { 
            type: 'string',
            description: 'Task type for the embeddings',
            enum: ["RETRIEVAL_QUERY", "RETRIEVAL_DOCUMENT", "SEMANTIC_SIMILARITY", "CLASSIFICATION", "CLUSTERING"]
          },
          dimensions: { 
            type: 'number',
            description: 'Dimensions of the embeddings'
          },
          batchSize: { 
            type: 'number',
            description: 'Batch size for processing multiple texts'
          }
        }
      },
      outputSchema: {
        type: 'object',
        description: 'GoogleGenerativeAIEmbeddings model'
      },
      execute: async function(input: {
        apiKey?: string;
        modelName?: string;
        taskType?: "RETRIEVAL_QUERY" | "RETRIEVAL_DOCUMENT" | "SEMANTIC_SIMILARITY" | "CLASSIFICATION" | "CLUSTERING";
        title?: string;
        dimensions?: number;
        batchSize?: number;
        stripNewLines?: boolean;
        maxRetries?: number;
        cache?: boolean;
      }): Promise<any> {
        const service = ModelService.getInstance();
        return service.createGoogleGenerativeAIEmbeddings(input);
      }
    },
    {
      name: 'invoke',
      description: 'Invoke a model with messages',
      inputSchema: {
        type: 'object',
        properties: {
          model: { 
            type: 'object',
            description: 'Model to invoke'
          },
          messages: { 
            type: 'array',
            description: 'Messages to send to the model'
          }
        },
        required: ['model', 'messages']
      },
      outputSchema: {
        type: 'object',
        description: 'Model response'
      },
      execute: async function(input: {
        model: any;
        messages: Array<{
          role: "system" | "user" | "assistant" | "function" | "tool";
          content: string;
          name?: string;
          tool_call_id?: string;
        }>;
      }): Promise<any> {
        const service = ModelService.getInstance();
        return service.invoke(input.model, input.messages);
      }
    },
    {
      name: 'embeddings',
      description: 'Generate embeddings for text',
      inputSchema: {
        type: 'object',
        properties: {
          model: { 
            type: 'object',
            description: 'Model to use for embeddings'
          },
          text: { 
            type: ['string', 'array'],
            description: 'Text to generate embeddings for'
          }
        },
        required: ['model', 'text']
      },
      outputSchema: {
        type: ['array', 'object'],
        description: 'Generated embeddings'
      },
      execute: async function(input: {
        model: any;
        text: string | string[];
      }): Promise<number[] | number[][]> {
        const service = ModelService.getInstance();
        return service.embeddings(input.model, input.text);
      }
    },
    {
      name: 'moderation',
      description: 'Moderate text for harmful content',
      inputSchema: {
        type: 'object',
        properties: {
          model: { 
            type: 'object',
            description: 'Model to use for moderation'
          },
          text: { 
            type: ['string', 'array'],
            description: 'Text to moderate'
          }
        },
        required: ['model', 'text']
      },
      outputSchema: {
        type: 'object',
        description: 'Moderation results'
      },
      execute: async function(input: {
        model: any;
        text: string | string[];
      }): Promise<any> {
        const service = ModelService.getInstance();
        return service.moderation(input.model, input.text);
      }
    },
    {
      name: 'createOllamaLLM',
      description: 'Create an Ollama model',
      inputSchema: {
        type: 'object',
        properties: {
          baseUrl: { 
            type: 'string',
            description: 'Ollama API base URL (default: http://localhost:11434)'
          },
          modelName: { 
            type: 'string',
            description: 'Model name (e.g., llama2, mistral, codellama)'
          },
          temperature: { 
            type: 'number',
            description: 'Sampling temperature (0-2)'
          },
          topP: { 
            type: 'number',
            description: 'Nucleus sampling parameter (0-1)'
          },
          topK: { 
            type: 'number',
            description: 'Top-k sampling parameter'
          },
          streaming: { 
            type: 'boolean',
            description: 'Whether to stream the response'
          },
          callbacks: { 
            type: 'array',
            description: 'Callbacks for streaming'
          }
        }
      },
      outputSchema: {
        type: 'object',
        description: 'OllamaLLM model'
      },
      execute: async function(input: {
        baseUrl?: string;
        modelName?: string;
        temperature?: number;
        topP?: number;
        topK?: number;
        numPredict?: number;
        numCtx?: number;
        repeatPenalty?: number;
        repeatLastN?: number;
        frequencyPenalty?: number;
        presencePenalty?: number;
        stopSequences?: string[];
        streaming?: boolean;
        callbacks?: any[];
        cache?: boolean;
        format?: "json" | "none";
        keepAlive?: string;
        mirostat?: number;
        mirostatEta?: number;
        mirostatTau?: number;
        numGpu?: number;
        numThread?: number;
        seed?: number;
        tfsZ?: number;
        timeout?: number;
      }): Promise<any> {
        const service = ModelService.getInstance();
        return service.createOllamaLLM(input);
      }
    },
    {
      name: 'createLlamaCpp',
      description: 'Create a LlamaCpp model',
      inputSchema: {
        type: 'object',
        properties: {
          modelPath: { 
            type: 'string',
            description: 'Path to the model file',
            required: true
          },
          temperature: { 
            type: 'number',
            description: 'Sampling temperature (0-2)'
          },
          topP: { 
            type: 'number',
            description: 'Nucleus sampling parameter (0-1)'
          },
          topK: { 
            type: 'number',
            description: 'Top-k sampling parameter'
          },
          maxTokens: { 
            type: 'number',
            description: 'Maximum number of tokens to generate'
          },
          contextSize: { 
            type: 'number',
            description: 'Context size in tokens'
          },
          streaming: { 
            type: 'boolean',
            description: 'Whether to stream the response'
          },
          threads: { 
            type: 'number',
            description: 'Number of threads to use for inference'
          },
          gpuLayers: { 
            type: 'number',
            description: 'Number of layers to offload to GPU'
          }
        },
        required: ['modelPath']
      },
      outputSchema: {
        type: 'object',
        description: 'LlamaCpp model'
      },
      execute: async function(input: {
        modelPath: string;
        temperature?: number;
        topP?: number;
        topK?: number;
        maxTokens?: number;
        contextSize?: number;
        batchSize?: number;
        repeatPenalty?: number;
        lastNTokensSize?: number;
        seed?: number;
        stopSequences?: string[];
        streaming?: boolean;
        callbacks?: any[];
        cache?: boolean;
        threads?: number;
        gpuLayers?: number;
        f16Kv?: boolean;
        logitsAll?: boolean;
        vocabOnly?: boolean;
        useMlock?: boolean;
        nBatch?: number;
        mainGpu?: number;
        tensorSplit?: number[];
        embedding?: boolean;
        verbose?: boolean;
      }): Promise<any> {
        const service = ModelService.getInstance();
        return service.createLlamaCpp(input);
      }
    },
    {
      name: 'createLocalAI',
      description: 'Create a LocalAI model',
      inputSchema: {
        type: 'object',
        properties: {
          baseUrl: { 
            type: 'string',
            description: 'LocalAI API base URL',
            required: true
          },
          modelName: { 
            type: 'string',
            description: 'Model name',
            required: true
          },
          temperature: { 
            type: 'number',
            description: 'Sampling temperature (0-2)'
          },
          topP: { 
            type: 'number',
            description: 'Nucleus sampling parameter (0-1)'
          },
          topK: { 
            type: 'number',
            description: 'Top-k sampling parameter'
          },
          maxTokens: { 
            type: 'number',
            description: 'Maximum number of tokens to generate'
          },
          streaming: { 
            type: 'boolean',
            description: 'Whether to stream the response'
          },
          apiKey: { 
            type: 'string',
            description: 'API key for LocalAI (if required)'
          }
        },
        required: ['baseUrl', 'modelName']
      },
      outputSchema: {
        type: 'object',
        description: 'LocalAI model'
      },
      execute: async function(input: {
        baseUrl: string;
        modelName: string;
        temperature?: number;
        topP?: number;
        topK?: number;
        maxTokens?: number;
        presencePenalty?: number;
        frequencyPenalty?: number;
        stopSequences?: string[];
        streaming?: boolean;
        callbacks?: any[];
        cache?: boolean;
        timeout?: number;
        headers?: Record<string, string>;
        apiKey?: string;
      }): Promise<any> {
        const service = ModelService.getInstance();
        return service.createLocalAI(input);
      }
    }
  ]
};

export default modelPlugin;
