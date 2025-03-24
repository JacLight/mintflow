import { ComponentFactory } from "../../registry/ComponentRegistry.js";

/**
 * Factory for creating Elasticsearch database loaders
 */
export class ElasticsearchLoaderFactory implements ComponentFactory<any> {
  /**
   * Creates a new Elasticsearch database loader
   * 
   * @param config Configuration for the Elasticsearch loader
   * @returns A new Elasticsearch database loader instance
   */
  async create(config: {
    clientOptions: {
      node: string;
      auth?: {
        username: string;
        password: string;
      };
      cloud?: {
        id: string;
      };
      ssl?: {
        rejectUnauthorized: boolean;
      };
    };
    indexName: string;
    query?: Record<string, any>;
    sourceFields?: string[];
    contentField?: string;
    metadataFields?: string[];
  }): Promise<any> {
    try {
      // Dynamically import the Elasticsearch loader
      const { ElasticSearchLoader } = await import("@langchain/community/document_loaders/elasticsearch");
      
      // Create the Elasticsearch loader with the provided configuration
      return new ElasticSearchLoader({
        clientOptions: config.clientOptions,
        indexName: config.indexName,
        query: config.query || { match_all: {} },
        sourceFields: config.sourceFields,
        contentField: config.contentField,
        metadataFields: config.metadataFields
      });
    } catch (error) {
      console.error("Error creating ElasticsearchLoader:", error);
      throw new Error(`Failed to create ElasticsearchLoader: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
