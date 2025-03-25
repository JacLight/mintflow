import { ComponentFactory } from "../../registry/ComponentRegistry.js";

/**
 * Factory for creating MongoDB database loaders
 */
export class MongoDBLoaderFactory implements ComponentFactory<any> {
  /**
   * Creates a new MongoDB database loader
   * 
   * @param config Configuration for the MongoDB loader
   * @returns A new MongoDB database loader instance
   */
  async create(config: {
    connectionString: string;
    dbName: string;
    collectionName: string;
    filter?: Record<string, any>;
    projection?: Record<string, any>;
    contentKey?: string;
    metadataKeys?: string[];
  }): Promise<any> {
    try {
      // Dynamically import the MongoDB loader
      const { MongodbLoader } = await import("@langchain/community/document_loaders/mongodb");
      
      // Create the MongoDB loader with the provided configuration
      return new MongodbLoader({
        connectionString: config.connectionString,
        dbName: config.dbName,
        collectionName: config.collectionName,
        filter: config.filter || {},
        projection: config.projection,
        contentKey: config.contentKey,
        metadataKeys: config.metadataKeys
      });
    } catch (error) {
      console.error("Error creating MongoDBLoader:", error);
      throw new Error(`Failed to create MongoDBLoader: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
