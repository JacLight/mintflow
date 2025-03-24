import { ComponentFactory } from "../../registry/ComponentRegistry.js";

/**
 * Factory for creating DOCX document loaders
 */
export class DocxLoaderFactory implements ComponentFactory<any> {
  /**
   * Creates a new DOCX document loader
   * 
   * @param config Configuration for the DOCX loader
   * @returns A new DOCX document loader instance
   */
  async create(config: {
    filePath: string;
  }): Promise<any> {
    try {
      // Dynamically import the DocxLoader
      const { DocxLoader } = await import("@langchain/community/document_loaders/fs/docx");
      
      // Create the DOCX loader with the provided configuration
      return new DocxLoader(config.filePath);
    } catch (error) {
      console.error("Error creating DocxLoader:", error);
      throw new Error(`Failed to create DocxLoader: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
