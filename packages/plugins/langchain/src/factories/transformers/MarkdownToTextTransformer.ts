import { ComponentFactory } from "../../registry/ComponentRegistry.js";

/**
 * Factory for creating Markdown to text transformers
 */
export class MarkdownToTextTransformerFactory implements ComponentFactory<any> {
  /**
   * Creates a new Markdown to text transformer
   * 
   * @param config Configuration for the Markdown to text transformer
   * @returns A new Markdown to text transformer instance
   */
  async create(config: {
    removeImages?: boolean;
    removeLinks?: boolean;
    removeHeadings?: boolean;
    removeBlockquotes?: boolean;
    removeTables?: boolean;
    removeCodeBlocks?: boolean;
  }): Promise<any> {
    try {
      // Dynamically import the Markdown to text transformer
      const { MarkdownTextSplitter } = await import("langchain/text_splitter");
      
      // Create a custom transformer that uses MarkdownTextSplitter to process the text
      return {
        async transformDocuments(documents: Array<{ pageContent: string; metadata: Record<string, any> }>) {
          return documents.map(doc => {
            let content = doc.pageContent;
            
            // Process the markdown content based on configuration
            if (config.removeImages !== false) {
              // Remove image markdown syntax
              content = content.replace(/!\[.*?\]\(.*?\)/g, '');
            }
            
            if (config.removeLinks !== false) {
              // Remove link markdown syntax but keep the text
              content = content.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
            }
            
            if (config.removeHeadings !== false) {
              // Remove heading markdown syntax but keep the text
              content = content.replace(/^#{1,6}\s+(.+)$/gm, '$1');
            }
            
            if (config.removeBlockquotes !== false) {
              // Remove blockquote markdown syntax but keep the text
              content = content.replace(/^>\s+(.+)$/gm, '$1');
            }
            
            if (config.removeTables !== false) {
              // Remove table markdown syntax
              content = content.replace(/\|.*\|/g, '');
              content = content.replace(/^[-|:]+$/gm, '');
            }
            
            if (config.removeCodeBlocks !== false) {
              // Remove code block markdown syntax but keep the code
              content = content.replace(/```[\s\S]*?```/g, (match) => {
                return match.replace(/```(?:\w+)?\n([\s\S]*?)\n```/g, '$1');
              });
              // Remove inline code markdown syntax but keep the code
              content = content.replace(/`([^`]+)`/g, '$1');
            }
            
            // Clean up any extra whitespace
            content = content.replace(/\n{3,}/g, '\n\n');
            
            return {
              pageContent: content,
              metadata: { ...doc.metadata, transformed: true }
            };
          });
        }
      };
    } catch (error) {
      console.error("Error creating MarkdownToTextTransformer:", error);
      throw new Error(`Failed to create MarkdownToTextTransformer: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}
