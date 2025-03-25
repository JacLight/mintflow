import { ComponentFactory } from "../../registry/ComponentRegistry.js";

/**
 * Factory for creating SQL database loaders
 */
export class SQLLoaderFactory implements ComponentFactory<any> {
  /**
   * Creates a new SQL database loader
   * 
   * @param config Configuration for the SQL loader
   * @returns A new SQL database loader instance
   */
  async create(config: {
    query: string;
    dbType: "mysql" | "postgres";
    connectionConfig: {
      host: string;
      port?: number;
      user: string;
      password: string;
      database: string;
      ssl?: boolean | object;
    };
    metadata?: Record<string, any>;
  }): Promise<any> {
    try {
      // Dynamically import the SQL database loader
      const { SqlDatabaseLoader } = await import("@langchain/community/document_loaders/sql");
      
      // Create the SQL database loader with the provided configuration
      return new SqlDatabaseLoader(
        {
          query: config.query,
          db: {
            type: config.dbType,
            ...config.connectionConfig
          },
          metadata: config.metadata
        }
      );
    } catch (error) {
      console.error("Error creating SQLLoader:", error);
      throw new Error(`Failed to create SQLLoader: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
