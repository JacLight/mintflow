import { ComponentFactory } from "../../registry/ComponentRegistry.js";

/**
 * Factory for creating web page document loaders
 */
export class WebPageLoaderFactory implements ComponentFactory<any> {
  /**
   * Creates a new web page document loader
   * 
   * @param config Configuration for the web page loader
   * @returns A new web page document loader instance
   */
  async create(config: {
    url: string;
    selector?: string;
    textDecoder?: {
      encoding?: string;
      ignoreBOM?: boolean;
      fatal?: boolean;
      flags?: string;
    };
  }): Promise<any> {
    try {
      // Dynamically import the WebPageLoader
      const { CheerioWebBaseLoader } = await import("@langchain/community/document_loaders/web/cheerio");
      
      // Create the web page loader with the provided configuration
      return new CheerioWebBaseLoader(
        config.url,
        {
          selector: config.selector,
          textDecoder: config.textDecoder
        }
      );
    } catch (error) {
      console.error("Error creating WebPageLoader:", error);
      throw new Error(`Failed to create WebPageLoader: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
