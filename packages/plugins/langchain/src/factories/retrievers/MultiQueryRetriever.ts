import { ComponentFactory } from "../../registry/ComponentRegistry.js";

/**
 * Factory for creating multi-query retrievers
 */
export class MultiQueryRetrieverFactory implements ComponentFactory<any> {
  /**
   * Creates a new multi-query retriever
   * 
   * @param config Configuration for the multi-query retriever
   * @returns A new multi-query retriever instance
   */
  async create(config: {
    retriever: any;
    llm: any;
    queryCount?: number;
    promptTemplate?: string;
    generateQueryPrompt?: (query: string) => string;
    uniqueDocsOnly?: boolean;
  }): Promise<any> {
    try {
      // Dynamically import the MultiQueryRetriever
      const { MultiQueryRetriever } = await import("langchain/retrievers/multi_query");
      
      // Validate the retriever
      if (!config.retriever) {
        throw new Error("Retriever is required");
      }
      
      // Validate the LLM
      if (!config.llm) {
        throw new Error("LLM is required");
      }
      
      // Check if the retriever has the required methods
      if (typeof config.retriever.getRelevantDocuments !== 'function') {
        throw new Error("Invalid retriever: missing getRelevantDocuments method");
      }
      
      // Create the multi-query retriever
      const options: any = {
        retriever: config.retriever,
        llm: config.llm
      };
      
      if (config.queryCount !== undefined) {
        options.queryCount = config.queryCount;
      }
      
      if (config.promptTemplate) {
        options.promptTemplate = config.promptTemplate;
      }
      
      if (config.generateQueryPrompt) {
        options.generateQueryPrompt = config.generateQueryPrompt;
      }
      
      if (config.uniqueDocsOnly !== undefined) {
        options.uniqueDocsOnly = config.uniqueDocsOnly;
      }
      
      return MultiQueryRetriever.fromLLM(options);
    } catch (error) {
      console.error("Error creating MultiQueryRetriever:", error);
      throw new Error(`Failed to create MultiQueryRetriever: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
