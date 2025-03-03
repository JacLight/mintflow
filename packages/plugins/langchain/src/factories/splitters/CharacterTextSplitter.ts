import { ComponentFactory } from "../../registry/ComponentRegistry.js";

/**
 * Factory for creating character-based text splitters
 */
export class CharacterTextSplitterFactory implements ComponentFactory<any> {
  /**
   * Creates a new character-based text splitter
   * 
   * @param config Configuration for the text splitter
   * @returns A new character-based text splitter instance
   */
  async create(config: {
    separator?: string;
    chunkSize?: number;
    chunkOverlap?: number;
    keepSeparator?: boolean;
    lengthFunction?: (text: string) => number;
  }): Promise<any> {
    try {
      // Dynamically import the CharacterTextSplitter
      const { CharacterTextSplitter } = await import("langchain/text_splitter");
      
      // Create the text splitter with the provided configuration
      return new CharacterTextSplitter({
        separator: config.separator || "\n\n",
        chunkSize: config.chunkSize || 1000,
        chunkOverlap: config.chunkOverlap || 200,
        keepSeparator: config.keepSeparator !== undefined ? config.keepSeparator : false,
        lengthFunction: config.lengthFunction
      });
    } catch (error) {
      console.error("Error creating CharacterTextSplitter:", error);
      throw new Error(`Failed to create CharacterTextSplitter: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
