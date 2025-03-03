import { ComponentFactory } from "../../registry/ComponentRegistry.js";

/**
 * Factory for creating Markdown text splitters
 */
export class MarkdownTextSplitterFactory implements ComponentFactory<any> {
  /**
   * Creates a new Markdown text splitter
   * 
   * @param config Configuration for the text splitter
   * @returns A new Markdown text splitter instance
   */
  async create(config: {
    chunkSize?: number;
    chunkOverlap?: number;
    keepSeparator?: boolean;
    lengthFunction?: (text: string) => number;
  }): Promise<any> {
    try {
      // Dynamically import the MarkdownTextSplitter
      const { MarkdownTextSplitter } = await import("langchain/text_splitter");
      
      // Create the text splitter with the provided configuration
      return new MarkdownTextSplitter({
        chunkSize: config.chunkSize || 1000,
        chunkOverlap: config.chunkOverlap || 200,
        keepSeparator: config.keepSeparator !== undefined ? config.keepSeparator : true,
        lengthFunction: config.lengthFunction
      });
    } catch (error) {
      console.error("Error creating MarkdownTextSplitter:", error);
      throw new Error(`Failed to create MarkdownTextSplitter: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
