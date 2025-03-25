import { ComponentFactory } from "../../registry/ComponentRegistry.js";

/**
 * Factory for creating multi-modal retrievers
 */
export class MultiModalRetrieverFactory implements ComponentFactory<any> {
  /**
   * Creates a new multi-modal retriever
   * 
   * @param config Configuration for the multi-modal retriever
   * @returns A new multi-modal retriever instance
   */
  async create(config: {
    textRetriever: any;
    imageRetriever?: any;
    audioRetriever?: any;
    videoRetriever?: any;
    modalityWeights?: {
      text?: number;
      image?: number;
      audio?: number;
      video?: number;
    };
    fusionStrategy?: "weighted" | "max" | "min" | "mean";
    k?: number;
    returnScores?: boolean;
  }): Promise<any> {
    try {
      // Validate the text retriever
      if (!config.textRetriever || typeof config.textRetriever.getRelevantDocuments !== 'function') {
        throw new Error("Text retriever is required and must have a getRelevantDocuments method");
      }
      
      // Set default values
      const modalityWeights = config.modalityWeights || {
        text: 1.0,
        image: config.imageRetriever ? 1.0 : 0,
        audio: config.audioRetriever ? 1.0 : 0,
        video: config.videoRetriever ? 1.0 : 0
      };
      const fusionStrategy = config.fusionStrategy || "weighted";
      const k = config.k || 4;
      const returnScores = config.returnScores !== false;
      
      // Create a custom multi-modal retriever
      return {
        textRetriever: config.textRetriever,
        imageRetriever: config.imageRetriever,
        audioRetriever: config.audioRetriever,
        videoRetriever: config.videoRetriever,
        modalityWeights,
        fusionStrategy,
        k,
        returnScores,
        
        /**
         * Get relevant documents for a query
         * 
         * @param query The query to search for
         * @returns The relevant documents
         */
        async getRelevantDocuments(query: any) {
          // Determine the query type
          const queryType = this._determineQueryType(query);
          
          // Get results from all available retrievers
          const retrievalPromises = [];
          const modalityTypes = [];
          
          // Text retrieval
          retrievalPromises.push(this.textRetriever.getRelevantDocuments(
            typeof query === 'string' ? query : query.text || ''
          ));
          modalityTypes.push('text');
          
          // Image retrieval
          if (this.imageRetriever && (queryType === 'image' || queryType === 'multimodal')) {
            retrievalPromises.push(this.imageRetriever.getRelevantDocuments(
              queryType === 'image' ? query : query.image
            ));
            modalityTypes.push('image');
          }
          
          // Audio retrieval
          if (this.audioRetriever && (queryType === 'audio' || queryType === 'multimodal')) {
            retrievalPromises.push(this.audioRetriever.getRelevantDocuments(
              queryType === 'audio' ? query : query.audio
            ));
            modalityTypes.push('audio');
          }
          
          // Video retrieval
          if (this.videoRetriever && (queryType === 'video' || queryType === 'multimodal')) {
            retrievalPromises.push(this.videoRetriever.getRelevantDocuments(
              queryType === 'video' ? query : query.video
            ));
            modalityTypes.push('video');
          }
          
          // Get all results
          const retrievalResults = await Promise.all(retrievalPromises);
          
          // Fuse the results
          return this._fuseResults(retrievalResults, modalityTypes);
        },
        
        /**
         * Determine the type of query
         * 
         * @param query The query to analyze
         * @returns The query type
         */
        _determineQueryType(query: any) {
          if (typeof query === 'string') {
            return 'text';
          }
          
          if (typeof query === 'object') {
            if (query.text && (query.image || query.audio || query.video)) {
              return 'multimodal';
            }
            
            if (query.image) {
              return 'image';
            }
            
            if (query.audio) {
              return 'audio';
            }
            
            if (query.video) {
              return 'video';
            }
          }
          
          // Default to text
          return 'text';
        },
        
        /**
         * Fuse results from multiple modalities
         * 
         * @param retrievalResults Results from multiple retrievers
         * @param modalityTypes Types of modalities for each result set
         * @returns Fused results
         */
        _fuseResults(
          retrievalResults: Array<Array<{ pageContent: string; metadata: Record<string, any> }>>,
          modalityTypes: string[]
        ) {
          // Create a map to store unique documents by ID
          const uniqueDocs = new Map<string, { doc: any; scores: Record<string, number> }>();
          
          // Process each retriever's results
          retrievalResults.forEach((results, retrieverIndex) => {
            const modalityType = modalityTypes[retrieverIndex];
            const weight = this.modalityWeights[modalityType] || 0;
            
            results.forEach((doc, docIndex) => {
              // Create a key for the document (use ID if available, otherwise content)
              const key = doc.metadata?.id || doc.pageContent;
              
              // Calculate score based on position and weight
              const score = weight * (1 / (docIndex + 1));
              
              // Add or update the document in the map
              if (uniqueDocs.has(key)) {
                const existing = uniqueDocs.get(key)!;
                existing.scores[modalityType] = score;
              } else {
                uniqueDocs.set(key, { 
                  doc, 
                  scores: { [modalityType]: score } 
                });
              }
            });
          });
          
          // Apply fusion strategy to calculate final scores
          const docsWithScores = Array.from(uniqueDocs.values()).map(({ doc, scores }) => {
            let finalScore;
            
            switch (this.fusionStrategy) {
              case "weighted":
                // Weighted sum of scores
                finalScore = Object.entries(scores).reduce(
                  (sum, [modality, score]) => sum + (score * (this.modalityWeights[modality] || 0)), 
                  0
                );
                break;
              
              case "max":
                // Maximum score across modalities
                finalScore = Math.max(...Object.values(scores));
                break;
              
              case "min":
                // Minimum score across modalities
                finalScore = Math.min(...Object.values(scores));
                break;
              
              case "mean":
                // Mean score across modalities
                finalScore = Object.values(scores).reduce((sum, score) => sum + score, 0) / 
                  Object.values(scores).length;
                break;
              
              default:
                finalScore = Object.values(scores)[0] || 0;
            }
            
            return { doc, score: finalScore };
          });
          
          // Sort by score and take top k
          const sortedDocs = docsWithScores
            .sort((a, b) => b.score - a.score)
            .slice(0, this.k);
          
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
      console.error("Error creating MultiModalRetriever:", error);
      throw new Error(`Failed to create MultiModalRetriever: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
