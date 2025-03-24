import { ComponentFactory } from "../../registry/ComponentRegistry.js";

/**
 * Factory for creating Cohere embeddings
 */
export class CohereEmbeddingsFactory implements ComponentFactory<any> {
  /**
   * Creates a new Cohere embeddings instance
   * 
   * @param config Configuration for the Cohere embeddings
   * @returns A new Cohere embeddings instance
   */
  async create(config: {
    apiKey?: string;
    model?: string;
    truncate?: "NONE" | "START" | "END";
    maxRetries?: number;
    timeout?: number;
  }): Promise<any> {
    try {
      // Dynamically import the CohereEmbeddings
      const { CohereEmbeddings } = await import("@langchain/community/embeddings/cohere");
      
      // Create the embeddings with the provided configuration
      const options: any = {
        apiKey: config.apiKey,
        model: config.model || "embed-english-v2.0",
        truncate: config.truncate || "END"
      };
      
      if (config.maxRetries !== undefined) {
        options.maxRetries = config.maxRetries;
      }
      
      if (config.timeout) {
        options.timeout = config.timeout;
      }
      
      return new CohereEmbeddings(options);
    } catch (error) {
      console.error("Error creating CohereEmbeddings:", error);
      throw new Error(`Failed to create CohereEmbeddings: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
