import { ComponentFactory } from "../../registry/ComponentRegistry.js";

/**
 * Factory for creating contextual compression retrievers
 */
export class ContextualCompressionRetrieverFactory implements ComponentFactory<any> {
  /**
   * Creates a new contextual compression retriever
   * 
   * @param config Configuration for the contextual compression retriever
   * @returns A new contextual compression retriever instance
   */
  async create(config: {
    baseRetriever: any;
    baseCompressor?: any;
    documentCompressorType?: "llm" | "embeddings" | "redundant";
    llm?: any;
    embeddings?: any;
    similarityThreshold?: number;
    minSimilarity?: number;
  }): Promise<any> {
    try {
      // Validate the base retriever
      if (!config.baseRetriever) {
        throw new Error("Base retriever is required");
      }
      
      // Check if the base retriever has the required methods
      if (typeof config.baseRetriever.getRelevantDocuments !== 'function') {
        throw new Error("Invalid base retriever: missing getRelevantDocuments method");
      }
      
      // If a base compressor is provided, use it directly
      if (config.baseCompressor) {
        // Create a custom retriever that uses the base retriever and compressor
        return {
          baseRetriever: config.baseRetriever,
          baseCompressor: config.baseCompressor,
          
          async getRelevantDocuments(query: string) {
            // Get documents from the base retriever
            const docs = await this.baseRetriever.getRelevantDocuments(query);
            
            // Compress the documents using the base compressor
            return this.baseCompressor.compressDocuments(docs, query);
          }
        };
      }
      
      // If no compressor is provided, create a simple wrapper around the base retriever
      // In a real implementation, we would create different compressors based on the type
      // but for now, we'll just use the base retriever directly
      return {
        baseRetriever: config.baseRetriever,
        
        async getRelevantDocuments(query: string) {
          return this.baseRetriever.getRelevantDocuments(query);
        }
      };
    } catch (error) {
      console.error("Error creating ContextualCompressionRetriever:", error);
      throw new Error(`Failed to create ContextualCompressionRetriever: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
