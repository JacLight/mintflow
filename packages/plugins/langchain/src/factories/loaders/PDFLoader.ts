import { ComponentFactory } from "../../registry/ComponentRegistry.js";

/**
 * Factory for creating PDF document loaders
 */
export class PDFLoaderFactory implements ComponentFactory<any> {
  /**
   * Creates a new PDF document loader
   * 
   * @param config Configuration for the PDF loader
   * @returns A new PDF document loader instance
   */
  async create(config: {
    filePath: string;
    splitPages?: boolean;
    pdfjs?: {
      disableFontFace?: boolean;
      useSystemFonts?: boolean;
      verbosity?: number;
    };
  }): Promise<any> {
    try {
      // Dynamically import the PDFLoader
      const { PDFLoader } = await import("@langchain/community/document_loaders/fs/pdf");
      
      // Create the PDF loader with the provided configuration
      return new PDFLoader(
        config.filePath,
        {
          splitPages: config.splitPages !== undefined ? config.splitPages : true,
          pdfjs: config.pdfjs
        }
      );
    } catch (error) {
      console.error("Error creating PDFLoader:", error);
      throw new Error(`Failed to create PDFLoader: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
