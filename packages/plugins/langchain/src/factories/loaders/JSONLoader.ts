import { ComponentFactory } from "../../registry/ComponentRegistry.js";

/**
 * Factory for creating JSON document loaders
 */
export class JSONLoaderFactory implements ComponentFactory<any> {
  /**
   * Creates a new JSON document loader
   * 
   * @param config Configuration for the JSON loader
   * @returns A new JSON document loader instance
   */
  async create(config: {
    filePath: string;
    pointers?: string[];
    contentKey?: string;
    metadataKeys?: string[];
  }): Promise<any> {
    try {
      // Dynamically import the JSONLoader
      const { JSONLoader } = await import("@langchain/community/document_loaders/fs/json");
      
      // Create the JSON loader with the provided configuration
      return new JSONLoader(
        config.filePath,
        {
          pointers: config.pointers,
          contentKey: config.contentKey,
          metadataKeys: config.metadataKeys
        }
      );
    } catch (error) {
      console.error("Error creating JSONLoader:", error);
      throw new Error(`Failed to create JSONLoader: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
