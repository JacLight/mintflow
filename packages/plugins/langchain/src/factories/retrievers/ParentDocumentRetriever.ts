import { ComponentFactory } from "../../registry/ComponentRegistry.js";

/**
 * Factory for creating parent document retrievers
 */
export class ParentDocumentRetrieverFactory implements ComponentFactory<any> {
  /**
   * Creates a new parent document retriever
   * 
   * @param config Configuration for the parent document retriever
   * @returns A new parent document retriever instance
   */
  async create(config: {
    vectorstore: any;
    docstore?: any;
    childSplitter: any;
    parentSplitter?: any;
    childK?: number;
    parentK?: number;
    childSearchKwargs?: Record<string, any>;
    parentSearchKwargs?: Record<string, any>;
  }): Promise<any> {
    try {
      // Validate the vector store
      if (!config.vectorstore) {
        throw new Error("Vector store is required");
      }
      
      // Validate the child splitter
      if (!config.childSplitter) {
        throw new Error("Child splitter is required");
      }
      
      // Set default values
      const childK = config.childK || 4;
      const parentK = config.parentK || 1;
      const childSearchKwargs = config.childSearchKwargs || {};
      const parentSearchKwargs = config.parentSearchKwargs || {};
      
      // Create a custom parent document retriever
      return {
        vectorstore: config.vectorstore,
        docstore: config.docstore || new Map(),
        childSplitter: config.childSplitter,
        parentSplitter: config.parentSplitter,
        childK,
        parentK,
        childSearchKwargs,
        parentSearchKwargs,
        
        /**
         * Add documents to the retriever
         * 
         * @param documents The documents to add
         */
        async addDocuments(documents: Array<{ pageContent: string; metadata: Record<string, any> }>) {
          // Generate IDs for the parent documents
          const parentIds = documents.map(() => this._generateId());
          
          // Store the parent documents in the docstore
          for (let i = 0; i < documents.length; i++) {
            const parentDoc = documents[i];
            const parentId = parentIds[i];
            
            // Add the parent document to the docstore
            this.docstore.set(parentId, parentDoc);
            
            // Split the parent document into child documents
            let childDocs;
            if (this.parentSplitter) {
              // If a parent splitter is provided, use it first
              const splitParentDocs = await this.parentSplitter.splitDocuments([parentDoc]);
              // Then split each parent chunk into child chunks
              const childDocsPromises = splitParentDocs.map(async (splitParentDoc) => {
                return this.childSplitter.splitDocuments([splitParentDoc]);
              });
              // Flatten the array of arrays
              childDocs = (await Promise.all(childDocsPromises)).flat();
            } else {
              // Otherwise, just use the child splitter directly
              childDocs = await this.childSplitter.splitDocuments([parentDoc]);
            }
            
            // Add parent ID to each child document's metadata
            const childDocsWithParentId = childDocs.map((childDoc) => {
              return {
                ...childDoc,
                metadata: {
                  ...childDoc.metadata,
                  parent_id: parentId
                }
              };
            });
            
            // Add the child documents to the vector store
            await this.vectorstore.addDocuments(childDocsWithParentId);
          }
          
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
          const childDocs = await this.vectorstore.similaritySearch(
            query,
            this.childK,
            this.childSearchKwargs
          );
          
          // Extract parent IDs from the child documents
          const parentIds = new Set<string>();
          for (const childDoc of childDocs) {
            const parentId = childDoc.metadata.parent_id;
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
            
            // Limit to parentK documents
            if (parentDocs.length >= this.parentK) {
              break;
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
      console.error("Error creating ParentDocumentRetriever:", error);
      throw new Error(`Failed to create ParentDocumentRetriever: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
