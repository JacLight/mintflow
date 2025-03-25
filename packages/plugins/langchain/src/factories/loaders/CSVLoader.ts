import { ComponentFactory } from "../../registry/ComponentRegistry.js";

/**
 * Factory for creating CSV document loaders
 */
export class CSVLoaderFactory implements ComponentFactory<any> {
  /**
   * Creates a new CSV document loader
   * 
   * @param config Configuration for the CSV loader
   * @returns A new CSV document loader instance
   */
  async create(config: {
    filePath: string;
    column?: string;
    separator?: string;
    encoding?: string;
  }): Promise<any> {
    try {
      // Dynamically import the CSVLoader
      const { CSVLoader } = await import("@langchain/community/document_loaders/fs/csv");
      
      // Create the CSV loader with the provided configuration
      return new CSVLoader(
        config.filePath,
        {
          column: config.column,
          separator: config.separator,
          encoding: config.encoding
        }
      );
    } catch (error) {
      console.error("Error creating CSVLoader:", error);
      throw new Error(`Failed to create CSVLoader: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
