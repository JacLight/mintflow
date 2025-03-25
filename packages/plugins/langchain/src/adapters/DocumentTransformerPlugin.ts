import { ComponentRegistry } from '../registry/ComponentRegistry.js';
import { HTMLToTextTransformerFactory } from '../factories/transformers/HTMLToTextTransformer.js';
import { MarkdownToTextTransformerFactory } from '../factories/transformers/MarkdownToTextTransformer.js';
import { LanguageTranslationTransformerFactory } from '../factories/transformers/LanguageTranslationTransformer.js';
import { TextSummarizationTransformerFactory } from '../factories/transformers/TextSummarizationTransformer.js';

// Register transformer factories
const registry = ComponentRegistry.getInstance();
registry.registerComponent("html-to-text", new HTMLToTextTransformerFactory());
registry.registerComponent("markdown-to-text", new MarkdownToTextTransformerFactory());
registry.registerComponent("language-translation", new LanguageTranslationTransformerFactory());
registry.registerComponent("text-summarization", new TextSummarizationTransformerFactory());

/**
 * Document transformer options
 */
export interface TransformerOptions {
  [key: string]: any;
}

/**
 * Document Transformer Service for transforming documents
 */
export class DocumentTransformerService {
  private static instance: DocumentTransformerService;
  private registry = ComponentRegistry.getInstance();

  private constructor() {}

  static getInstance(): DocumentTransformerService {
    if (!DocumentTransformerService.instance) {
      DocumentTransformerService.instance = new DocumentTransformerService();
    }
    return DocumentTransformerService.instance;
  }

  /**
   * Transforms HTML to text
   * 
   * @param documents The documents to transform
   * @param options Additional options for the transformer
   * @returns The transformed documents
   */
  async transformHTMLToText(
    documents: Array<{ pageContent: string; metadata: Record<string, any> }>,
    options: {
      selectors?: string[];
      includeLinks?: boolean;
      preserveNewlines?: boolean;
      removeStyleTags?: boolean;
      removeScriptTags?: boolean;
    } = {}
  ): Promise<Array<{ pageContent: string; metadata: Record<string, any> }>> {
    try {
      // Get the HTML to text transformer factory
      const factory = this.registry.getComponentFactory("html-to-text");
      
      // Create the transformer with the provided configuration
      const transformer = await factory.create(options);
      
      // Transform the documents
      return transformer.transformDocuments(documents);
    } catch (error) {
      console.error("Error transforming HTML to text:", error);
      throw new Error(`Failed to transform documents: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Transforms Markdown to text
   * 
   * @param documents The documents to transform
   * @param options Additional options for the transformer
   * @returns The transformed documents
   */
  async transformMarkdownToText(
    documents: Array<{ pageContent: string; metadata: Record<string, any> }>,
    options: {
      removeImages?: boolean;
      removeLinks?: boolean;
      removeHeadings?: boolean;
      removeBlockquotes?: boolean;
      removeTables?: boolean;
      removeCodeBlocks?: boolean;
    } = {}
  ): Promise<Array<{ pageContent: string; metadata: Record<string, any> }>> {
    try {
      // Get the Markdown to text transformer factory
      const factory = this.registry.getComponentFactory("markdown-to-text");
      
      // Create the transformer with the provided configuration
      const transformer = await factory.create(options);
      
      // Transform the documents
      return transformer.transformDocuments(documents);
    } catch (error) {
      console.error("Error transforming Markdown to text:", error);
      throw new Error(`Failed to transform documents: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Translates documents from one language to another
   * 
   * @param documents The documents to translate
   * @param options Additional options for the translator
   * @returns The translated documents
   */
  async translateDocuments(
    documents: Array<{ pageContent: string; metadata: Record<string, any> }>,
    options: {
      sourceLanguage: string;
      targetLanguage: string;
      model?: string;
      apiKey?: string;
      batchSize?: number;
      concurrency?: number;
      preserveFormatting?: boolean;
    }
  ): Promise<Array<{ pageContent: string; metadata: Record<string, any> }>> {
    try {
      // Get the language translation transformer factory
      const factory = this.registry.getComponentFactory("language-translation");
      
      // Create the transformer with the provided configuration
      const transformer = await factory.create(options);
      
      // Transform the documents
      return transformer.transformDocuments(documents);
    } catch (error) {
      console.error("Error translating documents:", error);
      throw new Error(`Failed to translate documents: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Summarizes documents
   * 
   * @param documents The documents to summarize
   * @param options Additional options for the summarizer
   * @returns The summarized documents
   */
  async summarizeDocuments(
    documents: Array<{ pageContent: string; metadata: Record<string, any> }>,
    options: {
      model?: string;
      apiKey?: string;
      maxLength?: number;
      minLength?: number;
      type?: "extractive" | "abstractive";
      format?: "bullet" | "paragraph" | "concise";
      batchSize?: number;
      concurrency?: number;
    } = {}
  ): Promise<Array<{ pageContent: string; metadata: Record<string, any> }>> {
    try {
      // Get the text summarization transformer factory
      const factory = this.registry.getComponentFactory("text-summarization");
      
      // Create the transformer with the provided configuration
      const transformer = await factory.create(options);
      
      // Transform the documents
      return transformer.transformDocuments(documents);
    } catch (error) {
      console.error("Error summarizing documents:", error);
      throw new Error(`Failed to summarize documents: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Transforms documents using the specified transformer
   * 
   * @param documents The documents to transform
   * @param transformerType The type of transformer to use
   * @param options Additional options for the transformer
   * @returns The transformed documents
   */
  async transformDocuments(
    documents: Array<{ pageContent: string; metadata: Record<string, any> }>,
    transformerType: "html-to-text" | "markdown-to-text" | "language-translation" | "text-summarization",
    options: TransformerOptions = {}
  ): Promise<Array<{ pageContent: string; metadata: Record<string, any> }>> {
    try {
      // Get the appropriate transformer factory
      const factory = this.registry.getComponentFactory(transformerType);
      
      // Create the transformer with the provided configuration
      const transformer = await factory.create(options);
      
      // Transform the documents
      return transformer.transformDocuments(documents);
    } catch (error) {
      console.error(`Error transforming documents with ${transformerType} transformer:`, error);
      throw new Error(`Failed to transform documents: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

// Plugin definition for integration with MintFlow
const documentTransformerPlugin = {
  id: "documentTransformer",
  name: "Document Transformer Plugin",
  icon: "GiTransform",
  description: "Document transformation capabilities for processing documents",
  documentation: "https://js.langchain.com/docs/modules/data_connection/document_transformers/",
  
  inputSchema: {
    type: 'object',
    properties: {
      documents: { type: 'array' },
      transformerType: { type: 'string' },
      options: { type: 'object' }
    }
  },
  
  actions: [
    {
      name: 'transformHTMLToText',
      description: 'Transform HTML documents to plain text',
      inputSchema: {
        type: 'object',
        properties: {
          documents: { 
            type: 'array',
            items: {
              type: 'object',
              properties: {
                pageContent: { type: 'string' },
                metadata: { type: 'object' }
              }
            },
            description: 'Documents to transform'
          },
          selectors: { 
            type: 'array',
            items: { type: 'string' },
            description: 'CSS selectors to extract content from'
          },
          includeLinks: { 
            type: 'boolean',
            description: 'Whether to include links in the output'
          },
          preserveNewlines: { 
            type: 'boolean',
            description: 'Whether to preserve newlines in the output'
          },
          removeStyleTags: { 
            type: 'boolean',
            description: 'Whether to remove style tags from the output'
          },
          removeScriptTags: { 
            type: 'boolean',
            description: 'Whether to remove script tags from the output'
          }
        },
        required: ['documents']
      },
      outputSchema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            pageContent: { type: 'string' },
            metadata: { type: 'object' }
          }
        }
      },
      execute: async function(input: {
        documents: Array<{ pageContent: string; metadata: Record<string, any> }>;
        selectors?: string[];
        includeLinks?: boolean;
        preserveNewlines?: boolean;
        removeStyleTags?: boolean;
        removeScriptTags?: boolean;
      }): Promise<Array<{ pageContent: string; metadata: Record<string, any> }>> {
        const service = DocumentTransformerService.getInstance();
        const { documents, ...options } = input;
        return service.transformHTMLToText(documents, options);
      }
    },
    {
      name: 'transformMarkdownToText',
      description: 'Transform Markdown documents to plain text',
      inputSchema: {
        type: 'object',
        properties: {
          documents: { 
            type: 'array',
            items: {
              type: 'object',
              properties: {
                pageContent: { type: 'string' },
                metadata: { type: 'object' }
              }
            },
            description: 'Documents to transform'
          },
          removeImages: { 
            type: 'boolean',
            description: 'Whether to remove images from the output'
          },
          removeLinks: { 
            type: 'boolean',
            description: 'Whether to remove links from the output'
          },
          removeHeadings: { 
            type: 'boolean',
            description: 'Whether to remove headings from the output'
          },
          removeBlockquotes: { 
            type: 'boolean',
            description: 'Whether to remove blockquotes from the output'
          },
          removeTables: { 
            type: 'boolean',
            description: 'Whether to remove tables from the output'
          },
          removeCodeBlocks: { 
            type: 'boolean',
            description: 'Whether to remove code blocks from the output'
          }
        },
        required: ['documents']
      },
      outputSchema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            pageContent: { type: 'string' },
            metadata: { type: 'object' }
          }
        }
      },
      execute: async function(input: {
        documents: Array<{ pageContent: string; metadata: Record<string, any> }>;
        removeImages?: boolean;
        removeLinks?: boolean;
        removeHeadings?: boolean;
        removeBlockquotes?: boolean;
        removeTables?: boolean;
        removeCodeBlocks?: boolean;
      }): Promise<Array<{ pageContent: string; metadata: Record<string, any> }>> {
        const service = DocumentTransformerService.getInstance();
        const { documents, ...options } = input;
        return service.transformMarkdownToText(documents, options);
      }
    },
    {
      name: 'translateDocuments',
      description: 'Translate documents from one language to another',
      inputSchema: {
        type: 'object',
        properties: {
          documents: { 
            type: 'array',
            items: {
              type: 'object',
              properties: {
                pageContent: { type: 'string' },
                metadata: { type: 'object' }
              }
            },
            description: 'Documents to translate'
          },
          sourceLanguage: { 
            type: 'string',
            description: 'Source language of the documents'
          },
          targetLanguage: { 
            type: 'string',
            description: 'Target language to translate to'
          },
          model: { 
            type: 'string',
            description: 'Model to use for translation'
          },
          apiKey: { 
            type: 'string',
            description: 'API key for the translation service'
          },
          batchSize: { 
            type: 'number',
            description: 'Number of documents to process in each batch'
          },
          concurrency: { 
            type: 'number',
            description: 'Number of concurrent translation requests'
          },
          preserveFormatting: { 
            type: 'boolean',
            description: 'Whether to preserve formatting in the translated text'
          }
        },
        required: ['documents', 'sourceLanguage', 'targetLanguage']
      },
      outputSchema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            pageContent: { type: 'string' },
            metadata: { type: 'object' }
          }
        }
      },
      execute: async function(input: {
        documents: Array<{ pageContent: string; metadata: Record<string, any> }>;
        sourceLanguage: string;
        targetLanguage: string;
        model?: string;
        apiKey?: string;
        batchSize?: number;
        concurrency?: number;
        preserveFormatting?: boolean;
      }): Promise<Array<{ pageContent: string; metadata: Record<string, any> }>> {
        const service = DocumentTransformerService.getInstance();
        const { documents, ...options } = input;
        return service.translateDocuments(documents, options);
      }
    },
    {
      name: 'summarizeDocuments',
      description: 'Summarize documents',
      inputSchema: {
        type: 'object',
        properties: {
          documents: { 
            type: 'array',
            items: {
              type: 'object',
              properties: {
                pageContent: { type: 'string' },
                metadata: { type: 'object' }
              }
            },
            description: 'Documents to summarize'
          },
          model: { 
            type: 'string',
            description: 'Model to use for summarization'
          },
          apiKey: { 
            type: 'string',
            description: 'API key for the summarization service'
          },
          maxLength: { 
            type: 'number',
            description: 'Maximum length of the summary in words'
          },
          minLength: { 
            type: 'number',
            description: 'Minimum length of the summary in words'
          },
          type: { 
            type: 'string',
            enum: ['extractive', 'abstractive'],
            description: 'Type of summarization to perform'
          },
          format: { 
            type: 'string',
            enum: ['bullet', 'paragraph', 'concise'],
            description: 'Format of the summary'
          },
          batchSize: { 
            type: 'number',
            description: 'Number of documents to process in each batch'
          },
          concurrency: { 
            type: 'number',
            description: 'Number of concurrent summarization requests'
          }
        },
        required: ['documents']
      },
      outputSchema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            pageContent: { type: 'string' },
            metadata: { type: 'object' }
          }
        }
      },
      execute: async function(input: {
        documents: Array<{ pageContent: string; metadata: Record<string, any> }>;
        model?: string;
        apiKey?: string;
        maxLength?: number;
        minLength?: number;
        type?: "extractive" | "abstractive";
        format?: "bullet" | "paragraph" | "concise";
        batchSize?: number;
        concurrency?: number;
      }): Promise<Array<{ pageContent: string; metadata: Record<string, any> }>> {
        const service = DocumentTransformerService.getInstance();
        const { documents, ...options } = input;
        return service.summarizeDocuments(documents, options);
      }
    },
    {
      name: 'transformDocuments',
      description: 'Transform documents using the specified transformer',
      inputSchema: {
        type: 'object',
        properties: {
          documents: { 
            type: 'array',
            items: {
              type: 'object',
              properties: {
                pageContent: { type: 'string' },
                metadata: { type: 'object' }
              }
            },
            description: 'Documents to transform'
          },
          transformerType: { 
            type: 'string',
            enum: ['html-to-text', 'markdown-to-text', 'language-translation', 'text-summarization'],
            description: 'Type of transformer to use'
          },
          options: { 
            type: 'object',
            description: 'Additional options for the transformer'
          }
        },
        required: ['documents', 'transformerType']
      },
      outputSchema: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            pageContent: { type: 'string' },
            metadata: { type: 'object' }
          }
        }
      },
      execute: async function(input: {
        documents: Array<{ pageContent: string; metadata: Record<string, any> }>;
        transformerType: "html-to-text" | "markdown-to-text" | "language-translation" | "text-summarization";
        options?: TransformerOptions;
      }): Promise<Array<{ pageContent: string; metadata: Record<string, any> }>> {
        const service = DocumentTransformerService.getInstance();
        return service.transformDocuments(
          input.documents,
          input.transformerType,
          input.options || {}
        );
      }
    }
  ]
};

export default documentTransformerPlugin;
