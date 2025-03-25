/**
 * Document Plugin for Langflow integration
 * 
 * This plugin provides actions for working with documents in Langflow.
 */

import { defaultRunnerClient } from '../utils/runner.js';
import { mintflowToLangflowConfig, langflowToMintflowResult, mintflowToLangflowDocument, langflowToMintflowDocument } from '../utils/conversion.js';

// Type definitions
export interface DocumentConfig {
  source: string;
  type: 'pdf' | 'docx' | 'txt' | 'csv' | 'json' | 'html' | 'url';
  options?: Record<string, any>;
}

export interface DocumentResult {
  id: string;
  content: string;
  metadata: {
    source: string;
    type: string;
    [key: string]: any;
  };
}

export interface SplitConfig {
  chunkSize: number;
  chunkOverlap: number;
  separators?: string[];
}

/**
 * Document Plugin
 */
const documentPlugin = {
  name: 'Document',
  icon: 'GiDocumentText',
  description: 'Document operations for Langflow',
  id: 'document',
  runner: 'python',
  inputSchema: {
    type: 'object',
    properties: {
      source: { type: 'string' },
      type: { type: 'string' },
      options: { type: 'object' }
    }
  },
  outputSchema: {
    type: 'object',
    properties: {
      result: { type: 'object' }
    }
  },
  documentation: 'https://github.com/mintflow/plugin-langflow',
  method: 'exec',
  actions: [
    {
      name: 'Load Document',
      description: 'Load a document from a file or URL',
      id: 'loadDocument',
      inputSchema: {
        type: 'object',
        properties: {
          source: { type: 'string', description: 'The path or URL of the document' },
          type: {
            type: 'string',
            enum: ['pdf', 'docx', 'txt', 'csv', 'json', 'html', 'url'],
            description: 'The type of document'
          },
          options: {
            type: 'object',
            description: 'Additional options for loading the document'
          }
        },
        required: ['source', 'type']
      },
      outputSchema: {
        type: 'object',
        properties: {
          result: {
            type: 'object',
            properties: {
              id: { type: 'string', description: 'The ID of the document' },
              content: { type: 'string', description: 'The content of the document' },
              metadata: {
                type: 'object',
                properties: {
                  source: { type: 'string', description: 'The source of the document' },
                  type: { type: 'string', description: 'The type of document' }
                }
              }
            }
          }
        }
      },
      async exec(input: DocumentConfig): Promise<{ result: DocumentResult }> {
        try {
          // Execute the task
          const result = await defaultRunnerClient.executeDocumentTask<DocumentResult>(
            'load_document',
            {
              type: input.type
            },
            {
              source: input.source,
              options: input.options
            }
          );
          
          // Return the result
          return { result };
        } catch (error: any) {
          throw new Error(`Failed to load document: ${error?.message || 'Unknown error'}`);
        }
      }
    },
    {
      name: 'Split Document',
      description: 'Split a document into chunks',
      id: 'splitDocument',
      inputSchema: {
        type: 'object',
        properties: {
          document: {
            type: 'object',
            properties: {
              id: { type: 'string', description: 'The ID of the document' },
              content: { type: 'string', description: 'The content of the document' },
              metadata: { type: 'object', description: 'The metadata of the document' }
            },
            required: ['id', 'content', 'metadata'],
            description: 'The document to split'
          },
          chunkSize: { type: 'number', description: 'The size of each chunk', default: 1000 },
          chunkOverlap: { type: 'number', description: 'The overlap between chunks', default: 200 },
          separators: {
            type: 'array',
            items: { type: 'string' },
            description: 'The separators to use for splitting'
          }
        },
        required: ['document']
      },
      outputSchema: {
        type: 'object',
        properties: {
          result: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string', description: 'The ID of the chunk' },
                content: { type: 'string', description: 'The content of the chunk' },
                metadata: {
                  type: 'object',
                  properties: {
                    source: { type: 'string', description: 'The source of the document' },
                    type: { type: 'string', description: 'The type of document' },
                    chunk: { type: 'number', description: 'The chunk number' }
                  }
                }
              }
            }
          }
        }
      },
      async exec(input: {
        document: DocumentResult;
        chunkSize?: number;
        chunkOverlap?: number;
        separators?: string[];
      }): Promise<{ result: DocumentResult[] }> {
        try {
          // Convert MintFlow document to Langflow document
          const langflowDocument = mintflowToLangflowDocument(input.document);
          
          // Execute the task
          const result = await defaultRunnerClient.executeDocumentTask<DocumentResult[]>(
            'split_document',
            {
              chunkSize: input.chunkSize || 1000,
              chunkOverlap: input.chunkOverlap || 200,
              separators: input.separators
            },
            {
              document: langflowDocument
            }
          );
          
          // Return the result
          return { result };
        } catch (error: any) {
          throw new Error(`Failed to split document: ${error?.message || 'Unknown error'}`);
        }
      }
    },
    {
      name: 'Transform Document',
      description: 'Apply a transformation to a document',
      id: 'transformDocument',
      inputSchema: {
        type: 'object',
        properties: {
          document: {
            type: 'object',
            properties: {
              id: { type: 'string', description: 'The ID of the document' },
              content: { type: 'string', description: 'The content of the document' },
              metadata: { type: 'object', description: 'The metadata of the document' }
            },
            required: ['id', 'content', 'metadata'],
            description: 'The document to transform'
          },
          transformation: {
            type: 'string',
            enum: ['html_to_text', 'markdown_to_text', 'translate', 'summarize'],
            description: 'The transformation to apply'
          },
          options: {
            type: 'object',
            description: 'Additional options for the transformation'
          }
        },
        required: ['document', 'transformation']
      },
      outputSchema: {
        type: 'object',
        properties: {
          result: {
            type: 'object',
            properties: {
              id: { type: 'string', description: 'The ID of the transformed document' },
              content: { type: 'string', description: 'The content of the transformed document' },
              metadata: {
                type: 'object',
                properties: {
                  source: { type: 'string', description: 'The source of the document' },
                  type: { type: 'string', description: 'The type of document' },
                  transformation: { type: 'string', description: 'The transformation applied' }
                }
              }
            }
          }
        }
      },
      async exec(input: {
        document: DocumentResult;
        transformation: 'html_to_text' | 'markdown_to_text' | 'translate' | 'summarize';
        options?: Record<string, any>;
      }): Promise<{ result: DocumentResult }> {
        try {
          // Convert MintFlow document to Langflow document
          const langflowDocument = mintflowToLangflowDocument(input.document);
          
          // Execute the task
          const result = await defaultRunnerClient.executeDocumentTask<DocumentResult>(
            'transform_document',
            {
              transformation: input.transformation
            },
            {
              document: langflowDocument,
              options: input.options
            }
          );
          
          // Return the result
          return { result };
        } catch (error: any) {
          throw new Error(`Failed to transform document: ${error?.message || 'Unknown error'}`);
        }
      }
    }
  ]
};

export default documentPlugin;
