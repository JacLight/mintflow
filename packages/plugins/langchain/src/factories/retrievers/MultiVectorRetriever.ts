import { ComponentFactory } from "../../registry/ComponentRegistry.js";

/**
 * Factory for creating multi-vector retrievers
 */
export class MultiVectorRetrieverFactory implements ComponentFactory<any> {
  /**
   * Creates a new multi-vector retriever
   * 
   * @param config Configuration for the multi-vector retriever
   * @returns A new multi-vector retriever instance
   */
  async create(config: {
    vectorstore: any;
    docstore?: any;
    idKey?: string;
    childKey?: string;
    searchType?: "similarity" | "mmr";
    searchKwargs?: Record<string, any>;
  }): Promise<any> {
    try {
      // Validate the vector store
      if (!config.vectorstore) {
        throw new Error("Vector store is required");
      }
      
      // Set default values
      const idKey = config.idKey || "id";
      const childKey = config.childKey || "child_ids";
      const searchType = config.searchType || "similarity";
      const searchKwargs = config.searchKwargs || {};
      
      // Create a custom multi-vector retriever
      return {
        vectorstore: config.vectorstore,
        docstore: config.docstore || new Map(),
        idKey,
        childKey,
        searchType,
        searchKwargs,
        
        /**
         * Add documents to the retriever
         * 
         * @param parentDocuments Parent documents
         * @param childDocuments Child documents
         * @param ids Optional IDs for the parent documents
         */
        async addDocuments(
          parentDocuments: Array<{ pageContent: string; metadata: Record<string, any> }>,
          childDocuments: Array<{ pageContent: string; metadata: Record<string, any> }>,
          ids?: string[]
        ) {
          // Generate IDs for parent documents if not provided
          const parentIds = ids || parentDocuments.map(() => this._generateId());
          
          // Add parent documents to the docstore
          for (let i = 0; i < parentDocuments.length; i++) {
            const parentDoc = parentDocuments[i];
            const parentId = parentIds[i];
            
            // Add the parent document to the docstore
            this.docstore.set(parentId, parentDoc);
          }
          
          // Add child documents to the vector store
          // Each child document should have a reference to its parent
          const childDocsWithParentRefs = childDocuments.map((childDoc, i) => {
            // Determine which parent this child belongs to
            const parentIndex = Math.min(i, parentDocuments.length - 1);
            const parentId = parentIds[parentIndex];
            
            // Add parent ID to the child document's metadata
            return {
              ...childDoc,
              metadata: {
                ...childDoc.metadata,
                [this.idKey]: parentId
              }
            };
          });
          
          // Add the child documents to the vector store
          await this.vectorstore.addDocuments(childDocsWithParentRefs);
          
          return parentIds;
        },
        
        /**
         * Get relevant documents for a query
         * 
         * @param query The query to search for
         * @returns The relevant documents
         */
        async getRelevantDocuments(query: string) {
          // Search the vector store for relevant child documents
          let childDocs;
          if (this.searchType === "similarity") {
            childDocs = await this.vectorstore.similaritySearch(
              query,
              this.searchKwargs.k || 4,
              this.searchKwargs.filter
            );
          } else if (this.searchType === "mmr") {
            childDocs = await this.vectorstore.maximalMarginalRelevance(
              query,
              {
                k: this.searchKwargs.k || 4,
                fetchK: this.searchKwargs.fetchK || 20,
                lambda: this.searchKwargs.lambda || 0.5,
                filter: this.searchKwargs.filter
              }
            );
          } else {
            throw new Error(`Unsupported search type: ${this.searchType}`);
          }
          
          // Extract parent IDs from the child documents
          const parentIds = new Set<string>();
          for (const childDoc of childDocs) {
            const parentId = childDoc.metadata[this.idKey];
            if (parentId) {
              parentIds.add(parentId);
            }
          }
          
          // Retrieve the parent documents
          const parentDocs = [];
          for (const parentId of parentIds) {
            const parentDoc = this.docstore.get(parentId);
            if (parentDoc) {
              parentDocs.push(parentDoc);
            }
          }
          
          return parentDocs;
        },
        
        /**
         * Generate a random ID
         * 
         * @returns A random ID
         */
        _generateId() {
          return Math.random().toString(36).substring(2, 15);
        }
      };
    } catch (error) {
      console.error("Error creating MultiVectorRetriever:", error);
      throw new Error(`Failed to create MultiVectorRetriever: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
