import { ComponentFactory } from "../../registry/ComponentRegistry.js";

/**
 * Factory for creating token-based text splitters
 */
export class TokenTextSplitterFactory implements ComponentFactory<any> {
  /**
   * Creates a new token-based text splitter
   * 
   * @param config Configuration for the text splitter
   * @returns A new token-based text splitter instance
   */
  async create(config: {
    encodingName?: "gpt2" | "r50k_base" | "p50k_base" | "p50k_edit" | "cl100k_base";
    chunkSize?: number;
    chunkOverlap?: number;
    allowedSpecial?: Array<string>;
    disallowedSpecial?: Array<string> | "all";
  }): Promise<any> {
    try {
      // Dynamically import the RecursiveCharacterTextSplitter as a fallback
      // since it doesn't require additional dependencies
      const { RecursiveCharacterTextSplitter } = await import("langchain/text_splitter");
      
      try {
        // Try to dynamically import the TokenTextSplitter
        const { TokenTextSplitter } = await import("langchain/text_splitter");
        
        // Create the text splitter with the provided configuration
        return new TokenTextSplitter({
          encodingName: config.encodingName || "gpt2",
          chunkSize: config.chunkSize || 1000,
          chunkOverlap: config.chunkOverlap || 200,
          allowedSpecial: config.allowedSpecial || [],
          disallowedSpecial: config.disallowedSpecial || "all"
        });
      } catch (tokenError) {
        // Fallback to RecursiveCharacterTextSplitter if TokenTextSplitter fails
        console.warn("TokenTextSplitter failed to load, falling back to RecursiveCharacterTextSplitter:", tokenError);
        return new RecursiveCharacterTextSplitter({
          chunkSize: config.chunkSize || 1000,
          chunkOverlap: config.chunkOverlap || 200
        });
      }
    } catch (error) {
      console.error("Error creating TokenTextSplitter:", error);
      throw new Error(`Failed to create TokenTextSplitter: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
