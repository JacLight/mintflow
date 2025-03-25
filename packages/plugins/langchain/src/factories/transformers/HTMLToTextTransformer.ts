import { ComponentFactory } from "../../registry/ComponentRegistry.js";

/**
 * Factory for creating HTML to text transformers
 */
export class HTMLToTextTransformerFactory implements ComponentFactory<any> {
  /**
   * Creates a new HTML to text transformer
   * 
   * @param config Configuration for the HTML to text transformer
   * @returns A new HTML to text transformer instance
   */
  async create(config: {
    selectors?: string[];
    includeLinks?: boolean;
    preserveNewlines?: boolean;
    removeStyleTags?: boolean;
    removeScriptTags?: boolean;
  }): Promise<any> {
    try {
      // Dynamically import the HTML to text transformer
      const { HtmlToTextTransformer } = await import("@langchain/community/document_transformers/html_to_text");
      
      // Create the transformer with the provided configuration
      return new HtmlToTextTransformer({
        selectors: config.selectors,
        includeLinks: config.includeLinks !== undefined ? config.includeLinks : true,
        preserveNewlines: config.preserveNewlines !== undefined ? config.preserveNewlines : true,
        removeStyleTags: config.removeStyleTags !== undefined ? config.removeStyleTags : true,
        removeScriptTags: config.removeScriptTags !== undefined ? config.removeScriptTags : true
      });
    } catch (error) {
      console.error("Error creating HTMLToTextTransformer:", error);
      throw new Error(`Failed to create HTMLToTextTransformer: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
