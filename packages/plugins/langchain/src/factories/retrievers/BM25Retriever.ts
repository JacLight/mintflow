import { ComponentFactory } from "../../registry/ComponentRegistry.js";

/**
 * Factory for creating BM25 retrievers
 */
export class BM25RetrieverFactory implements ComponentFactory<any> {
  /**
   * Creates a new BM25 retriever
   * 
   * @param config Configuration for the BM25 retriever
   * @returns A new BM25 retriever instance
   */
  async create(config: {
    documents: Array<{ pageContent: string; metadata: Record<string, any> }>;
    k?: number;
    b?: number;
    k1?: number;
    fields?: string[];
    metadataFields?: string[];
    returnMetadata?: boolean;
  }): Promise<any> {
    try {
      // Validate the documents
      if (!config.documents || !Array.isArray(config.documents) || config.documents.length === 0) {
        throw new Error("Documents are required and must be a non-empty array");
      }
      
      // Set default values
      const k = config.k || 4;
      const b = config.b || 0.75;
      const k1 = config.k1 || 1.2;
      const fields = config.fields || ["pageContent"];
      const metadataFields = config.metadataFields || [];
      const returnMetadata = config.returnMetadata !== false;
      
      // Create a custom BM25 retriever
      return {
        documents: config.documents,
        k,
        b,
        k1,
        fields,
        metadataFields,
        returnMetadata,
        
        // Internal state
        _index: null,
        _initialized: false,
        
        /**
         * Initialize the BM25 index
         */
        async _initialize() {
          if (this._initialized) {
            return;
          }
          
          try {
            // Prepare the documents for indexing
            const docs = this.documents.map((doc) => {
              const content = this.fields.map(field => {
                if (field === "pageContent") {
                  return doc.pageContent;
                } else if (doc.metadata && doc.metadata[field] !== undefined) {
                  return String(doc.metadata[field]);
                }
                return "";
              }).join(" ");
              
              // Tokenize the content (simple whitespace tokenization)
              const tokens = content.toLowerCase().split(/\s+/).filter(Boolean);
              
              return {
                tokens,
                original: doc
              };
            });
            
            // Build the inverted index
            const invertedIndex: Record<string, Array<{ docId: number; freq: number }>> = {};
            const docLengths: number[] = [];
            
            docs.forEach((doc, docId) => {
              // Count term frequencies in the document
              const termFreq: Record<string, number> = {};
              doc.tokens.forEach(token => {
                termFreq[token] = (termFreq[token] || 0) + 1;
              });
              
              // Add to inverted index
              Object.entries(termFreq).forEach(([term, freq]) => {
                if (!invertedIndex[term]) {
                  invertedIndex[term] = [];
                }
                invertedIndex[term].push({ docId, freq });
              });
              
              // Store document length
              docLengths[docId] = doc.tokens.length;
            });
            
            // Calculate average document length
            const avgDocLength = docLengths.reduce((sum, len) => sum + len, 0) / docLengths.length;
            
            // Store the index
            this._index = {
              docs,
              invertedIndex,
              docLengths,
              avgDocLength,
              docCount: docs.length
            };
            
            this._initialized = true;
          } catch (error) {
            console.error("Error initializing BM25 index:", error);
            throw new Error(`Failed to initialize BM25 index: ${error instanceof Error ? error.message : String(error)}`);
          }
        },
        
        /**
         * Search the index using BM25 algorithm
         * 
         * @param query The query to search for
         * @param k The number of results to return
         * @returns The search results
         */
        _search(query: string, k: number) {
          // Tokenize the query
          const queryTokens = query.toLowerCase().split(/\s+/).filter(Boolean);
          
          // Calculate scores for each document
          const scores: Array<{ docId: number; score: number }> = [];
          
          for (let docId = 0; docId < this._index.docCount; docId++) {
            let score = 0;
            
            // Calculate score for each query term
            for (const term of queryTokens) {
              const postings = this._index.invertedIndex[term];
              if (!postings) continue;
              
              // Find the posting for this document
              const posting = postings.find(p => p.docId === docId);
              if (!posting) continue;
              
              // Calculate IDF (Inverse Document Frequency)
              const N = this._index.docCount;
              const n = postings.length;
              const idf = Math.log(1 + (N - n + 0.5) / (n + 0.5));
              
              // Calculate term frequency component
              const tf = posting.freq;
              const docLength = this._index.docLengths[docId];
              const avgDocLength = this._index.avgDocLength;
              
              // BM25 formula
              const numerator = tf * (this.k1 + 1);
              const denominator = tf + this.k1 * (1 - this.b + this.b * (docLength / avgDocLength));
              
              score += idf * (numerator / denominator);
            }
            
            if (score > 0) {
              scores.push({ docId, score });
            }
          }
          
          // Sort by score and take top k
          return scores
            .sort((a, b) => b.score - a.score)
            .slice(0, k)
            .map(result => ({
              index: result.docId,
              score: result.score
            }));
        },
        
        /**
         * Get relevant documents for a query
         * 
         * @param query The query to search for
         * @returns The relevant documents
         */
        async getRelevantDocuments(query: string) {
          // Initialize the index if needed
          if (!this._initialized) {
            await this._initialize();
          }
          
          // Search the index
          const results = this._search(query, this.k);
          
          // Map the results to documents
          return results.map(result => {
            const doc = this._index.docs[result.index].original;
            
            if (this.returnMetadata) {
              return {
                ...doc,
                score: result.score
              };
            } else {
              return {
                pageContent: doc.pageContent,
                score: result.score
              };
            }
          });
        }
      };
    } catch (error) {
      console.error("Error creating BM25Retriever:", error);
      throw new Error(`Failed to create BM25Retriever: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
