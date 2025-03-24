import { ComponentFactory } from "../../registry/ComponentRegistry.js";

/**
 * Factory for creating HuggingFace embeddings
 */
export class HuggingFaceEmbeddingsFactory implements ComponentFactory<any> {
  /**
   * Creates a new HuggingFace embeddings instance
   * 
   * @param config Configuration for the HuggingFace embeddings
   * @returns A new HuggingFace embeddings instance
   */
  async create(config: {
    apiKey?: string;
    model?: string;
    endpointUrl?: string;
    maxRetries?: number;
    stripNewLines?: boolean;
    timeout?: number;
  }): Promise<any> {
    try {
      // Dynamically import the HuggingFaceInferenceEmbeddings
      const { HuggingFaceInferenceEmbeddings } = await import("@langchain/community/embeddings/hf");
      
      // Create the embeddings with the provided configuration
      const options: any = {
        apiKey: config.apiKey,
        model: config.model || "sentence-transformers/all-MiniLM-L6-v2",
        endpointUrl: config.endpointUrl,
        maxRetries: config.maxRetries || 3,
        stripNewLines: config.stripNewLines !== undefined ? config.stripNewLines : true
      };
      
      if (config.timeout) {
        options.timeout = config.timeout;
      }
      
      return new HuggingFaceInferenceEmbeddings(options);
    } catch (error) {
      console.error("Error creating HuggingFaceEmbeddings:", error);
      throw new Error(`Failed to create HuggingFaceEmbeddings: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
