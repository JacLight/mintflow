import { ComponentFactory } from "../../registry/ComponentRegistry.js";

/**
 * Factory for creating OpenAI embeddings
 */
export class OpenAIEmbeddingsFactory implements ComponentFactory<any> {
  /**
   * Creates a new OpenAI embeddings instance
   * 
   * @param config Configuration for the OpenAI embeddings
   * @returns A new OpenAI embeddings instance
   */
  async create(config: {
    apiKey?: string;
    modelName?: string;
    batchSize?: number;
    stripNewLines?: boolean;
    timeout?: number;
    basePath?: string;
    organization?: string;
  }): Promise<any> {
    try {
      // Dynamically import the OpenAIEmbeddings
      const { OpenAIEmbeddings } = await import("@langchain/openai");
      
      // Create the embeddings with the provided configuration
      const options: any = {
        openAIApiKey: config.apiKey,
        modelName: config.modelName || "text-embedding-ada-002",
        batchSize: config.batchSize || 512,
        stripNewLines: config.stripNewLines !== undefined ? config.stripNewLines : true,
        timeout: config.timeout
      };
      
      // Add configuration if basePath or organization is provided
      if (config.basePath || config.organization) {
        options.configuration = {};
        if (config.basePath) options.configuration.basePath = config.basePath;
        if (config.organization) options.configuration.organization = config.organization;
      }
      
      return new OpenAIEmbeddings(options);
    } catch (error) {
      console.error("Error creating OpenAIEmbeddings:", error);
      throw new Error(`Failed to create OpenAIEmbeddings: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
