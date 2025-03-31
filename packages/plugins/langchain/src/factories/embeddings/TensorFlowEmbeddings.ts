import { ComponentFactory } from "../../registry/ComponentRegistry.js";

/**
 * Factory for creating TensorFlow embeddings
 */
export class TensorFlowEmbeddingsFactory implements ComponentFactory<any> {
  /**
   * Creates a new TensorFlow embeddings instance
   * 
   * @param config Configuration for the TensorFlow embeddings
   * @returns A new TensorFlow embeddings instance
   */
  async create(config: {
    modelName?: string;
    maxSeqLength?: number;
    batchSize?: number;
    cacheDir?: string;
  }): Promise<any> {
    try {
      // Dynamically import the TensorFlowEmbeddings
      const { TensorFlowEmbeddings } = await import("@langchain/community/embeddings/tensorflow");
      
      // Create the embeddings with the provided configuration
      const options: any = {
        modelName: config.modelName || "universal-sentence-encoder",
        maxSeqLength: config.maxSeqLength || 512,
        batchSize: config.batchSize || 32
      };
      
      if (config.cacheDir) {
        options.cacheDir = config.cacheDir;
      }
      
      return new TensorFlowEmbeddings(options);
    } catch (error) {
      console.error("Error creating TensorFlowEmbeddings:", error);
      throw new Error(`Failed to create TensorFlowEmbeddings: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
