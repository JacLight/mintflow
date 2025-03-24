import { ComponentFactory } from "../../registry/ComponentRegistry.js";

/**
 * Factory for creating ensemble retrievers
 */
export class EnsembleRetrieverFactory implements ComponentFactory<any> {
  /**
   * Creates a new ensemble retriever
   * 
   * @param config Configuration for the ensemble retriever
   * @returns A new ensemble retriever instance
   */
  async create(config: {
    retrievers: any[];
    weights?: number[];
    ensembleType?: "merge" | "reciprocal_rank_fusion";
    rrf?: {
      k?: number;
    };
    returnScores?: boolean;
  }): Promise<any> {
    try {
      // Validate the retrievers
      if (!config.retrievers || !Array.isArray(config.retrievers) || config.retrievers.length === 0) {
        throw new Error("Retrievers are required and must be a non-empty array");
      }
      
      // Validate that all retrievers have the getRelevantDocuments method
      for (const retriever of config.retrievers) {
        if (typeof retriever.getRelevantDocuments !== 'function') {
          throw new Error("All retrievers must have a getRelevantDocuments method");
        }
      }
      
      // Set default values
      const weights = config.weights || config.retrievers.map(() => 1);
      const ensembleType = config.ensembleType || "merge";
      const rrf = config.rrf || { k: 60 };
      const returnScores = config.returnScores !== false;
      
      // Validate weights
      if (weights.length !== config.retrievers.length) {
        throw new Error("Number of weights must match number of retrievers");
      }
      
      // Create a custom ensemble retriever
      return {
        retrievers: config.retrievers,
        weights,
        ensembleType,
        rrf,
        returnScores,
        
        /**
         * Get relevant documents for a query
         * 
         * @param query The query to search for
         * @returns The relevant documents
         */
        async getRelevantDocuments(query: string) {
          // Get results from all retrievers
          const retrievalResults = await Promise.all(
            this.retrievers.map(retriever => retriever.getRelevantDocuments(query))
          );
          
          // Process results based on ensemble type
          if (this.ensembleType === "merge") {
            return this._mergeResults(retrievalResults);
          } else if (this.ensembleType === "reciprocal_rank_fusion") {
            return this._reciprocalRankFusion(retrievalResults);
          } else {
            throw new Error(`Unsupported ensemble type: ${this.ensembleType}`);
          }
        },
        
        /**
         * Merge results from multiple retrievers
         * 
         * @param retrievalResults Results from multiple retrievers
         * @returns Merged results
         */
        _mergeResults(retrievalResults: Array<Array<{ pageContent: string; metadata: Record<string, any> }>>) {
          // Create a map to store unique documents by content
          const uniqueDocs = new Map<string, { doc: any; score: number }>();
          
          // Process each retriever's results
          retrievalResults.forEach((results, retrieverIndex) => {
            const weight = this.weights[retrieverIndex];
            
            results.forEach((doc, docIndex) => {
              // Create a key for the document
              const key = doc.pageContent;
              
              // Calculate score based on position and weight
              const score = weight * (1 / (docIndex + 1));
              
              // Add or update the document in the map
              if (uniqueDocs.has(key)) {
                const existing = uniqueDocs.get(key)!;
                existing.score += score;
              } else {
                uniqueDocs.set(key, { doc, score });
              }
            });
          });
          
          // Convert the map to an array and sort by score
          const sortedDocs = Array.from(uniqueDocs.values())
            .sort((a, b) => b.score - a.score);
          
          // Return the documents with or without scores
          if (this.returnScores) {
            return sortedDocs.map(({ doc, score }) => ({
              ...doc,
              score
            }));
          } else {
            return sortedDocs.map(({ doc }) => doc);
          }
        },
        
        /**
         * Apply reciprocal rank fusion to results from multiple retrievers
         * 
         * @param retrievalResults Results from multiple retrievers
         * @returns Fused results
         */
        _reciprocalRankFusion(retrievalResults: Array<Array<{ pageContent: string; metadata: Record<string, any> }>>) {
          // Create a map to store unique documents by content
          const uniqueDocs = new Map<string, { doc: any; score: number }>();
          
          // Process each retriever's results
          retrievalResults.forEach((results, retrieverIndex) => {
            const weight = this.weights[retrieverIndex];
            
            results.forEach((doc, docIndex) => {
              // Create a key for the document
              const key = doc.pageContent;
              
              // Calculate RRF score: weight * 1 / (rank + k)
              const rrfScore = weight * (1 / (docIndex + this.rrf.k));
              
              // Add or update the document in the map
              if (uniqueDocs.has(key)) {
                const existing = uniqueDocs.get(key)!;
                existing.score += rrfScore;
              } else {
                uniqueDocs.set(key, { doc, score: rrfScore });
              }
            });
          });
          
          // Convert the map to an array and sort by score
          const sortedDocs = Array.from(uniqueDocs.values())
            .sort((a, b) => b.score - a.score);
          
          // Return the documents with or without scores
          if (this.returnScores) {
            return sortedDocs.map(({ doc, score }) => ({
              ...doc,
              score
            }));
          } else {
            return sortedDocs.map(({ doc }) => doc);
          }
        }
      };
    } catch (error) {
      console.error("Error creating EnsembleRetriever:", error);
      throw new Error(`Failed to create EnsembleRetriever: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
