import { ComponentRegistry } from '../registry/ComponentRegistry.js';
import { CharacterTextSplitterFactory } from '../factories/splitters/CharacterTextSplitter.js';
import { TokenTextSplitterFactory } from '../factories/splitters/TokenTextSplitter.js';
import { RecursiveCharacterTextSplitterFactory } from '../factories/splitters/RecursiveCharacterTextSplitter.js';
import { MarkdownTextSplitterFactory } from '../factories/splitters/MarkdownTextSplitter.js';

// Register text splitter factories
const registry = ComponentRegistry.getInstance();
registry.registerComponent("character", new CharacterTextSplitterFactory());
registry.registerComponent("token", new TokenTextSplitterFactory());
registry.registerComponent("recursive", new RecursiveCharacterTextSplitterFactory());
registry.registerComponent("markdown", new MarkdownTextSplitterFactory());

/**
 * Text splitting options
 */
export interface SplitOptions {
  chunkSize?: number;
  chunkOverlap?: number;
  [key: string]: any;
}

/**
 * Text Splitter Service for splitting text into chunks
 */
export class TextSplitterService {
  private static instance: TextSplitterService;
  private registry = ComponentRegistry.getInstance();

  private constructor() {}

  static getInstance(): TextSplitterService {
    if (!TextSplitterService.instance) {
      TextSplitterService.instance = new TextSplitterService();
    }
    return TextSplitterService.instance;
  }

  /**
   * Splits text using a character-based text splitter
   * 
   * @param text The text to split
   * @param options Additional options for the text splitter
   * @returns An array of text chunks
   */
  async splitByCharacter(
    text: string,
    options: {
      separator?: string;
      chunkSize?: number;
      chunkOverlap?: number;
      keepSeparator?: boolean;
    } = {}
  ): Promise<string[]> {
    try {
      // Get the character text splitter factory
      const factory = this.registry.getComponentFactory("character");
      
      // Create the text splitter with the provided configuration
      const splitter = await factory.create(options);
      
      // Split the text
      const chunks = await splitter.splitText(text);
      
      return chunks;
    } catch (error) {
      console.error("Error splitting text by character:", error);
      throw new Error(`Failed to split text: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Splits text using a token-based text splitter
   * 
   * @param text The text to split
   * @param options Additional options for the text splitter
   * @returns An array of text chunks
   */
  async splitByToken(
    text: string,
    options: {
      encodingName?: "gpt2" | "r50k_base" | "p50k_base" | "p50k_edit" | "cl100k_base";
      chunkSize?: number;
      chunkOverlap?: number;
      allowedSpecial?: Array<string>;
      disallowedSpecial?: Array<string> | "all";
    } = {}
  ): Promise<string[]> {
    try {
      // Get the token text splitter factory
      const factory = this.registry.getComponentFactory("token");
      
      // Create the text splitter with the provided configuration
      const splitter = await factory.create(options);
      
      // Split the text
      const chunks = await splitter.splitText(text);
      
      return chunks;
    } catch (error) {
      console.error("Error splitting text by token:", error);
      throw new Error(`Failed to split text: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Splits text using a recursive character-based text splitter
   * 
   * @param text The text to split
   * @param options Additional options for the text splitter
   * @returns An array of text chunks
   */
  async splitByRecursiveCharacter(
    text: string,
    options: {
      separators?: string[];
      chunkSize?: number;
      chunkOverlap?: number;
      keepSeparator?: boolean;
    } = {}
  ): Promise<string[]> {
    try {
      // Get the recursive character text splitter factory
      const factory = this.registry.getComponentFactory("recursive");
      
      // Create the text splitter with the provided configuration
      const splitter = await factory.create(options);
      
      // Split the text
      const chunks = await splitter.splitText(text);
      
      return chunks;
    } catch (error) {
      console.error("Error splitting text by recursive character:", error);
      throw new Error(`Failed to split text: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Splits markdown text using a markdown-specific text splitter
   * 
   * @param text The markdown text to split
   * @param options Additional options for the text splitter
   * @returns An array of text chunks
   */
  async splitMarkdown(
    text: string,
    options: {
      chunkSize?: number;
      chunkOverlap?: number;
      keepSeparator?: boolean;
    } = {}
  ): Promise<string[]> {
    try {
      // Get the markdown text splitter factory
      const factory = this.registry.getComponentFactory("markdown");
      
      // Create the text splitter with the provided configuration
      const splitter = await factory.create(options);
      
      // Split the text
      const chunks = await splitter.splitText(text);
      
      return chunks;
    } catch (error) {
      console.error("Error splitting markdown text:", error);
      throw new Error(`Failed to split text: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Splits documents using the specified text splitter
   * 
   * @param documents The documents to split
   * @param splitterType The type of text splitter to use
   * @param options Additional options for the text splitter
   * @returns An array of split documents
   */
  async splitDocuments(
    documents: Array<{ pageContent: string; metadata: Record<string, any> }>,
    splitterType: "character" | "token" | "recursive" | "markdown",
    options: SplitOptions = {}
  ): Promise<Array<{ pageContent: string; metadata: Record<string, any> }>> {
    try {
      // Get the appropriate text splitter factory
      const factory = this.registry.getComponentFactory(splitterType);
      
      // Create the text splitter with the provided configuration
      const splitter = await factory.create(options);
      
      // Split the documents
      const splitDocs = await splitter.splitDocuments(documents);
      
      return splitDocs;
    } catch (error) {
      console.error(`Error splitting documents with ${splitterType} splitter:`, error);
      throw new Error(`Failed to split documents: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

// Plugin definition for integration with MintFlow
const textSplitterPlugin = {
  id: "textSplitter",
  name: "Text Splitter Plugin",
  icon: "GiSplitCross",
  description: "Text splitting capabilities for document processing",
  documentation: "https://js.langchain.com/docs/modules/data_connection/document_transformers/text_splitters/",
  
  inputSchema: {
    type: 'object',
    properties: {
      text: { type: 'string' },
      documents: { type: 'array' },
      splitterType: { type: 'string' },
      options: { type: 'object' }
    }
  },
  
  actions: [
    {
      name: 'splitByCharacter',
      description: 'Split text using a character-based text splitter',
      inputSchema: {
        type: 'object',
        properties: {
          text: { 
            type: 'string',
            description: 'Text to split'
          },
          separator: { 
            type: 'string',
            description: 'Separator to use for splitting'
          },
          chunkSize: { 
            type: 'number',
            description: 'Size of each chunk'
          },
          chunkOverlap: { 
            type: 'number',
            description: 'Overlap between chunks'
          },
          keepSeparator: { 
            type: 'boolean',
            description: 'Whether to keep the separator in the chunks'
          }
        },
        required: ['text']
      },
      outputSchema: {
        type: 'array',
        items: { type: 'string' }
      },
      execute: async function(input: {
        text: string;
        separator?: string;
        chunkSize?: number;
        chunkOverlap?: number;
        keepSeparator?: boolean;
      }): Promise<string[]> {
        const service = TextSplitterService.getInstance();
        const { text, ...options } = input;
        return service.splitByCharacter(text, options);
      }
    },
    {
      name: 'splitByToken',
      description: 'Split text using a token-based text splitter',
      inputSchema: {
        type: 'object',
        properties: {
          text: { 
            type: 'string',
            description: 'Text to split'
          },
          encodingName: { 
            type: 'string',
            enum: ['gpt2', 'r50k_base', 'p50k_base', 'p50k_edit', 'cl100k_base'],
            description: 'Encoding to use for tokenization'
          },
          chunkSize: { 
            type: 'number',
            description: 'Size of each chunk in tokens'
          },
          chunkOverlap: { 
            type: 'number',
            description: 'Overlap between chunks in tokens'
          }
        },
        required: ['text']
      },
      outputSchema: {
        type: 'array',
        items: { type: 'string' }
      },
      execute: async function(input: {
        text: string;
        encodingName?: "gpt2" | "r50k_base" | "p50k_base" | "p50k_edit" | "cl100k_base";
        chunkSize?: number;
        chunkOverlap?: number;
        allowedSpecial?: Array<string>;
        disallowedSpecial?: Array<string> | "all";
      }): Promise<string[]> {
        const service = TextSplitterService.getInstance();
        const { text, ...options } = input;
        return service.splitByToken(text, options);
      }
    },
    {
      name: 'splitByRecursiveCharacter',
      description: 'Split text using a recursive character-based text splitter',
      inputSchema: {
        type: 'object',
        properties: {
          text: { 
            type: 'string',
            description: 'Text to split'
          },
          separators: { 
            type: 'array',
            items: { type: 'string' },
            description: 'Separators to use for splitting, in order of priority'
          },
          chunkSize: { 
            type: 'number',
            description: 'Size of each chunk'
          },
          chunkOverlap: { 
            type: 'number',
            description: 'Overlap between chunks'
          },
          keepSeparator: { 
            type: 'boolean',
            description: 'Whether to keep the separator in the chunks'
          }
        },
        required: ['text']
      },
      outputSchema: {
        type: 'array',
        items: { type: 'string' }
      },
      execute: async function(input: {
        text: string;
        separators?: string[];
        chunkSize?: number;
        chunkOverlap?: number;
        keepSeparator?: boolean;
      }): Promise<string[]> {
        const service = TextSplitterService.getInstance();
        const { text, ...options } = input;
        return service.splitByRecursiveCharacter(text, options);
      }
    },
    {
      name: 'splitMarkdown',
      description: 'Split markdown text using a markdown-specific text splitter',
      inputSchema: {
        type: 'object',
        properties: {
          text: { 
            type: 'string',
            description: 'Markdown text to split'
          },
          chunkSize: { 
            type: 'number',
            description: 'Size of each chunk'
          },
          chunkOverlap: { 
            type: 'number',
            description: 'Overlap between chunks'
          },
          keepSeparator: { 
            type: 'boolean',
            description: 'Whether to keep the separator in the chunks'
          }
        },
        required: ['text']
      },
      outputSchema: {
        type: 'array',
        items: { type: 'string' }
      },
      execute: async function(input: {
        text: string;
        chunkSize?: number;
        chunkOverlap?: number;
        keepSeparator?: boolean;
      }): Promise<string[]> {
        const service = TextSplitterService.getInstance();
        const { text, ...options } = input;
        return service.splitMarkdown(text, options);
      }
    },
    {
      name: 'splitDocuments',
      description: 'Split documents using the specified text splitter',
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
            description: 'Documents to split'
          },
          splitterType: { 
            type: 'string',
            enum: ['character', 'token', 'recursive', 'markdown'],
            description: 'Type of text splitter to use'
          },
          options: { 
            type: 'object',
            description: 'Additional options for the text splitter'
          }
        },
        required: ['documents', 'splitterType']
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
        splitterType: "character" | "token" | "recursive" | "markdown";
        options?: SplitOptions;
      }): Promise<Array<{ pageContent: string; metadata: Record<string, any> }>> {
        const service = TextSplitterService.getInstance();
        return service.splitDocuments(
          input.documents,
          input.splitterType,
          input.options || {}
        );
      }
    }
  ]
};

export default textSplitterPlugin;
