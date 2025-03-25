import { ComponentFactory } from "../../registry/ComponentRegistry.js";

/**
 * Factory for creating recursive character-based text splitters
 */
export class RecursiveCharacterTextSplitterFactory implements ComponentFactory<any> {
  /**
   * Creates a new recursive character-based text splitter
   * 
   * @param config Configuration for the text splitter
   * @returns A new recursive character-based text splitter instance
   */
  async create(config: {
    separators?: string[];
    chunkSize?: number;
    chunkOverlap?: number;
    keepSeparator?: boolean;
    lengthFunction?: (text: string) => number;
  }): Promise<any> {
    try {
      // Dynamically import the RecursiveCharacterTextSplitter
      const { RecursiveCharacterTextSplitter } = await import("langchain/text_splitter");
      
      // Create the text splitter with the provided configuration
      return new RecursiveCharacterTextSplitter({
        separators: config.separators,
        chunkSize: config.chunkSize || 1000,
        chunkOverlap: config.chunkOverlap || 200,
        keepSeparator: config.keepSeparator !== undefined ? config.keepSeparator : true,
        lengthFunction: config.lengthFunction
      });
    } catch (error) {
      console.error("Error creating RecursiveCharacterTextSplitter:", error);
      throw new Error(`Failed to create RecursiveCharacterTextSplitter: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
