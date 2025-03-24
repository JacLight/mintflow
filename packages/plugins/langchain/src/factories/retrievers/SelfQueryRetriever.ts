import { ComponentFactory } from "../../registry/ComponentRegistry.js";

/**
 * Factory for creating self-query retrievers
 */
export class SelfQueryRetrieverFactory implements ComponentFactory<any> {
  /**
   * Creates a new self-query retriever
   * 
   * @param config Configuration for the self-query retriever
   * @returns A new self-query retriever instance
   */
  async create(config: {
    vectorStore: any;
    llm: any;
    documentContents: string;
    attributeInfo?: Record<string, { type: string; description: string }>;
    structuredQueryTranslator?: any;
    allowedComparators?: string[];
    allowedOperators?: string[];
    promptTemplate?: string;
    examples?: Array<{ query: string; filter?: Record<string, any> }>;
  }): Promise<any> {
    try {
      // Validate the vector store
      if (!config.vectorStore) {
        throw new Error("Vector store is required");
      }
      
      // Validate the LLM
      if (!config.llm) {
        throw new Error("LLM is required");
      }
      
      // Validate the document contents
      if (!config.documentContents) {
        throw new Error("Document contents description is required");
      }
      
      // Create a custom self-query retriever
      return {
        vectorStore: config.vectorStore,
        llm: config.llm,
        documentContents: config.documentContents,
        attributeInfo: config.attributeInfo || {},
        structuredQueryTranslator: config.structuredQueryTranslator,
        allowedComparators: config.allowedComparators,
        allowedOperators: config.allowedOperators,
        promptTemplate: config.promptTemplate,
        examples: config.examples || [],
        
        async getRelevantDocuments(query: string) {
          try {
            // Step 1: Use the LLM to generate a structured query
            const structuredQuery = await this._generateStructuredQuery(query);
            
            // Step 2: Extract the filter and query string
            const { filter, queryString } = structuredQuery;
            
            // Step 3: Use the vector store to retrieve documents
            return this.vectorStore.similaritySearch(
              queryString || query,
              4,
              filter
            );
          } catch (error) {
            console.error("Error in self-query retrieval:", error);
            // Fallback to regular similarity search
            return this.vectorStore.similaritySearch(query, 4);
          }
        },
        
        async _generateStructuredQuery(query: string) {
          // Create a prompt for the LLM
          let prompt = `Given the following user query: "${query}"\n\n`;
          prompt += `The query is about the following: "${this.documentContents}"\n\n`;
          
          // Add attribute information
          if (Object.keys(this.attributeInfo).length > 0) {
            prompt += "The documents have the following attributes:\n";
            for (const [key, value] of Object.entries(this.attributeInfo)) {
              const attrInfo = value as { type: string; description: string };
              prompt += `- ${key}: ${attrInfo.type} - ${attrInfo.description}\n`;
            }
            prompt += "\n";
          }
          
          // Add examples if provided
          if (this.examples.length > 0) {
            prompt += "Here are some examples of queries and their structured forms:\n\n";
            for (const example of this.examples) {
              prompt += `Query: ${example.query}\n`;
              prompt += `Structured form: ${JSON.stringify({
                query: example.query,
                filter: example.filter || {}
              }, null, 2)}\n\n`;
            }
          }
          
          // Add instructions
          prompt += "Generate a structured query with a 'query' string for semantic search and a 'filter' object for metadata filtering.\n";
          prompt += "The filter should use the available attributes and valid operators.\n";
          prompt += "Return the result as a JSON object with 'query' and 'filter' fields.\n";
          
          // Generate the structured query using the LLM
          const response = await this.llm.invoke(prompt);
          
          // Parse the response
          try {
            // Extract JSON from the response
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
              throw new Error("No JSON found in response");
            }
            
            const structuredQuery = JSON.parse(jsonMatch[0]);
            return {
              queryString: structuredQuery.query || query,
              filter: structuredQuery.filter || {}
            };
          } catch (error) {
            console.error("Error parsing structured query:", error);
            return { queryString: query, filter: {} };
          }
        }
      };
    } catch (error) {
      console.error("Error creating SelfQueryRetriever:", error);
      throw new Error(`Failed to create SelfQueryRetriever: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
