import { ComponentFactory } from "../../registry/ComponentRegistry.js";

/**
 * Factory for creating sitemap document loaders
 */
export class SitemapLoaderFactory implements ComponentFactory<any> {
  /**
   * Creates a new sitemap document loader
   * 
   * @param config Configuration for the sitemap loader
   * @returns A new sitemap document loader instance
   */
  async create(config: {
    url: string;
    selector?: string;
    limit?: number;
    filter?: (url: string) => boolean;
  }): Promise<any> {
    try {
      // Dynamically import the SitemapLoader
      const { SitemapLoader } = await import("@langchain/community/document_loaders/web/sitemap");
      
      // Create the sitemap loader with the provided configuration
      return new SitemapLoader({
        url: config.url,
        selector: config.selector,
        limit: config.limit,
        filter: config.filter
      });
    } catch (error) {
      console.error("Error creating SitemapLoader:", error);
      throw new Error(`Failed to create SitemapLoader: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
