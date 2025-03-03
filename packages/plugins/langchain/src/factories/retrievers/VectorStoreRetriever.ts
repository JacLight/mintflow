import { ComponentFactory } from "../../registry/ComponentRegistry.js";

/**
 * Factory for creating vector store retrievers
 */
export class VectorStoreRetrieverFactory implements ComponentFactory<any> {
  /**
   * Creates a new vector store retriever
   * 
   * @param config Configuration for the vector store retriever
   * @returns A new vector store retriever instance
   */
  async create(config: {
    vectorStore: any;
    k?: number;
    filter?: Record<string, any>;
    searchType?: "similarity" | "mmr";
    searchParams?: {
      k?: number;
      filter?: Record<string, any>;
      score?: boolean;
      fetchK?: number;
      lambda?: number;
    };
  }): Promise<any> {
    try {
      // Validate the vector store
      if (!config.vectorStore) {
        throw new Error("Vector store is required");
      }

      // Check if the vector store has the required methods
      if (typeof config.vectorStore.similaritySearch !== 'function' && 
          typeof config.vectorStore.asRetriever !== 'function') {
        throw new Error("Invalid vector store: missing similaritySearch or asRetriever method");
      }

      // If the vector store has an asRetriever method, use it
      if (typeof config.vectorStore.asRetriever === 'function') {
        return config.vectorStore.asRetriever({
          k: config.k,
          filter: config.filter,
          searchType: config.searchType,
          searchParams: config.searchParams
        });
      }

      // Otherwise, create a custom retriever
      return {
        vectorStore: config.vectorStore,
        k: config.k || 4,
        filter: config.filter,
        searchType: config.searchType || "similarity",
        searchParams: config.searchParams || {},

        async getRelevantDocuments(query: string) {
          if (this.searchType === "similarity") {
            return this.vectorStore.similaritySearch(
              query, 
              this.k, 
              this.filter
            );
          } else if (this.searchType === "mmr") {
            return this.vectorStore.maximalMarginalRelevance(
              query,
              {
                k: this.k,
                fetchK: this.searchParams.fetchK || this.k * 2,
                lambda: this.searchParams.lambda || 0.5,
                filter: this.filter
              }
            );
          } else {
            throw new Error(`Unsupported search type: ${this.searchType}`);
          }
        }
      };
    } catch (error) {
      console.error("Error creating VectorStoreRetriever:", error);
      throw new Error(`Failed to create VectorStoreRetriever: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
