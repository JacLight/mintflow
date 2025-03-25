import { ComponentRegistry } from '../registry/ComponentRegistry.js';
// File loaders
import { PDFLoaderFactory } from '../factories/loaders/PDFLoader.js';
import { DocxLoaderFactory } from '../factories/loaders/DocxLoader.js';
import { CSVLoaderFactory } from '../factories/loaders/CSVLoader.js';
import { JSONLoaderFactory } from '../factories/loaders/JSONLoader.js';
// Web loaders
import { WebPageLoaderFactory } from '../factories/loaders/WebPageLoader.js';
import { SitemapLoaderFactory } from '../factories/loaders/SitemapLoader.js';
import { GitHubLoaderFactory } from '../factories/loaders/GitHubLoader.js';
// Database loaders
import { SQLLoaderFactory } from '../factories/loaders/SQLLoader.js';
import { MongoDBLoaderFactory } from '../factories/loaders/MongoDBLoader.js';
import { ElasticsearchLoaderFactory } from '../factories/loaders/ElasticsearchLoader.js';

// Register document loader factories
const registry = ComponentRegistry.getInstance();
// File loaders
registry.registerComponent("pdf", new PDFLoaderFactory());
registry.registerComponent("docx", new DocxLoaderFactory());
registry.registerComponent("csv", new CSVLoaderFactory());
registry.registerComponent("json", new JSONLoaderFactory());
// Web loaders
registry.registerComponent("webpage", new WebPageLoaderFactory());
registry.registerComponent("sitemap", new SitemapLoaderFactory());
registry.registerComponent("github", new GitHubLoaderFactory());
// Database loaders
registry.registerComponent("sql", new SQLLoaderFactory());
registry.registerComponent("mongodb", new MongoDBLoaderFactory());
registry.registerComponent("elasticsearch", new ElasticsearchLoaderFactory());

/**
 * Document interface for document loading operations
 */
export interface LoadedDocument {
  pageContent: string;
  metadata: Record<string, any>;
}

/**
 * Document loading options
 */
export interface LoadOptions {
  splitPages?: boolean;
  encoding?: string;
  [key: string]: any;
}

/**
 * Document Service for loading and processing documents
 */
export class DocumentService {
  private static instance: DocumentService;
  private registry = ComponentRegistry.getInstance();

  private constructor() {}

  static getInstance(): DocumentService {
    if (!DocumentService.instance) {
      DocumentService.instance = new DocumentService();
    }
    return DocumentService.instance;
  }

  /**
   * Loads a document from a file
   * 
   * @param type The type of document loader to use
   * @param filePath The path to the document file
   * @param options Additional options for the document loader
   * @returns An array of loaded documents
   */
  async loadDocument(
    type: string,
    filePath: string,
    options: LoadOptions = {}
  ): Promise<LoadedDocument[]> {
    try {
      // Get the appropriate loader factory
      const factory = this.registry.getComponentFactory(type);
      
      // Create the loader with the provided configuration
      const loader = await factory.create({
        filePath,
        ...options
      });
      
      // Load the documents
      const docs = await loader.load();
      
      return docs;
    } catch (error) {
      console.error(`Error loading document with ${type} loader:`, error);
      throw new Error(`Failed to load document: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Loads content from a web page
   * 
   * @param url The URL of the web page
   * @param options Additional options for the web page loader
   * @returns An array of loaded documents
   */
  async loadWebPage(
    url: string,
    options: {
      selector?: string;
      textDecoder?: {
        encoding?: string;
        ignoreBOM?: boolean;
        fatal?: boolean;
      };
    } = {}
  ): Promise<LoadedDocument[]> {
    try {
      // Get the web page loader factory
      const factory = this.registry.getComponentFactory("webpage");
      
      // Create the loader with the provided configuration
      const loader = await factory.create({
        url,
        ...options
      });
      
      // Load the documents
      const docs = await loader.load();
      
      return docs;
    } catch (error) {
      console.error(`Error loading web page: ${url}`, error);
      throw new Error(`Failed to load web page: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Loads content from a sitemap
   * 
   * @param url The URL of the sitemap
   * @param options Additional options for the sitemap loader
   * @returns An array of loaded documents
   */
  async loadSitemap(
    url: string,
    options: {
      selector?: string;
      limit?: number;
      filter?: (url: string) => boolean;
    } = {}
  ): Promise<LoadedDocument[]> {
    try {
      // Get the sitemap loader factory
      const factory = this.registry.getComponentFactory("sitemap");
      
      // Create the loader with the provided configuration
      const loader = await factory.create({
        url,
        ...options
      });
      
      // Load the documents
      const docs = await loader.load();
      
      return docs;
    } catch (error) {
      console.error(`Error loading sitemap: ${url}`, error);
      throw new Error(`Failed to load sitemap: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Loads content from a GitHub repository
   * 
   * @param owner The owner of the repository
   * @param repo The name of the repository
   * @param options Additional options for the GitHub loader
   * @returns An array of loaded documents
   */
  async loadGitHubRepo(
    owner: string,
    repo: string,
    options: {
      branch?: string;
      recursive?: boolean;
      accessToken?: string;
      ignoreFiles?: string[];
      ignorePaths?: string[];
    } = {}
  ): Promise<LoadedDocument[]> {
    try {
      // Get the GitHub loader factory
      const factory = this.registry.getComponentFactory("github");
      
      // Create the loader with the provided configuration
      const loader = await factory.create({
        owner,
        repo,
        ...options
      });
      
      // Load the documents
      const docs = await loader.load();
      
      return docs;
    } catch (error) {
      console.error(`Error loading GitHub repo: ${owner}/${repo}`, error);
      throw new Error(`Failed to load GitHub repo: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Loads data from a SQL database
   * 
   * @param query The SQL query to execute
   * @param dbType The type of SQL database (mysql or postgres)
   * @param connectionConfig The database connection configuration
   * @param metadata Additional metadata to include with the documents
   * @returns An array of loaded documents
   */
  async loadSQL(
    query: string,
    dbType: "mysql" | "postgres",
    connectionConfig: {
      host: string;
      port?: number;
      user: string;
      password: string;
      database: string;
      ssl?: boolean | object;
    },
    metadata?: Record<string, any>
  ): Promise<LoadedDocument[]> {
    try {
      // Get the SQL loader factory
      const factory = this.registry.getComponentFactory("sql");
      
      // Create the loader with the provided configuration
      const loader = await factory.create({
        query,
        dbType,
        connectionConfig,
        metadata
      });
      
      // Load the documents
      const docs = await loader.load();
      
      return docs;
    } catch (error) {
      console.error(`Error loading SQL data with query: ${query}`, error);
      throw new Error(`Failed to load SQL data: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Loads data from a MongoDB database
   * 
   * @param connectionString The MongoDB connection string
   * @param dbName The database name
   * @param collectionName The collection name
   * @param options Additional options for the MongoDB loader
   * @returns An array of loaded documents
   */
  async loadMongoDB(
    connectionString: string,
    dbName: string,
    collectionName: string,
    options: {
      filter?: Record<string, any>;
      projection?: Record<string, any>;
      contentKey?: string;
      metadataKeys?: string[];
    } = {}
  ): Promise<LoadedDocument[]> {
    try {
      // Get the MongoDB loader factory
      const factory = this.registry.getComponentFactory("mongodb");
      
      // Create the loader with the provided configuration
      const loader = await factory.create({
        connectionString,
        dbName,
        collectionName,
        ...options
      });
      
      // Load the documents
      const docs = await loader.load();
      
      return docs;
    } catch (error) {
      console.error(`Error loading MongoDB data from ${dbName}.${collectionName}`, error);
      throw new Error(`Failed to load MongoDB data: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Loads data from an Elasticsearch index
   * 
   * @param clientOptions The Elasticsearch client options
   * @param indexName The index name
   * @param options Additional options for the Elasticsearch loader
   * @returns An array of loaded documents
   */
  async loadElasticsearch(
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
    },
    indexName: string,
    options: {
      query?: Record<string, any>;
      sourceFields?: string[];
      contentField?: string;
      metadataFields?: string[];
    } = {}
  ): Promise<LoadedDocument[]> {
    try {
      // Get the Elasticsearch loader factory
      const factory = this.registry.getComponentFactory("elasticsearch");
      
      // Create the loader with the provided configuration
      const loader = await factory.create({
        clientOptions,
        indexName,
        ...options
      });
      
      // Load the documents
      const docs = await loader.load();
      
      return docs;
    } catch (error) {
      console.error(`Error loading Elasticsearch data from index: ${indexName}`, error);
      throw new Error(`Failed to load Elasticsearch data: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Determines the document type from a file path
   * 
   * @param filePath The path to the document file
   * @returns The document type
   */
  getDocumentType(filePath: string): string {
    const extension = filePath.split('.').pop()?.toLowerCase();
    
    switch (extension) {
      case 'pdf':
        return 'pdf';
      case 'docx':
      case 'doc':
        return 'docx';
      case 'csv':
        return 'csv';
      case 'json':
        return 'json';
      default:
        throw new Error(`Unsupported file type: ${extension}`);
    }
  }
}

// Plugin definition for integration with MintFlow
const documentPlugin = {
  id: "document",
  name: "Document Plugin",
  icon: "GiDocumentFolder",
  description: "Document loading and processing capabilities",
  documentation: "https://js.langchain.com/docs/modules/data_connection/document_loaders/",
  
  inputSchema: {
    type: 'object',
    properties: {
      filePath: { type: 'string' },
      type: { type: 'string' },
      options: { type: 'object' }
    },
    required: ['filePath']
  },
  
  actions: [
    {
      name: 'loadDocument',
      description: 'Load a document from a file',
      inputSchema: {
        type: 'object',
        properties: {
          filePath: { 
            type: 'string',
            description: 'Path to the document file'
          },
          type: { 
            type: 'string',
            description: 'Document type (pdf, docx, csv, json). If not provided, it will be inferred from the file extension.'
          },
          options: { 
            type: 'object',
            description: 'Additional options for the document loader'
          }
        },
        required: ['filePath']
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
        filePath: string;
        type?: string;
        options?: LoadOptions;
      }): Promise<LoadedDocument[]> {
        const service = DocumentService.getInstance();
        
        // Determine document type if not provided
        const type = input.type || service.getDocumentType(input.filePath);
        
        // Load the document
        return service.loadDocument(type, input.filePath, input.options || {});
      }
    },
    {
      name: 'loadWebPage',
      description: 'Load content from a web page',
      inputSchema: {
        type: 'object',
        properties: {
          url: { 
            type: 'string',
            description: 'URL of the web page'
          },
          selector: { 
            type: 'string',
            description: 'CSS selector to extract specific content'
          },
          textDecoder: { 
            type: 'object',
            description: 'Text decoder options',
            properties: {
              encoding: { type: 'string' },
              ignoreBOM: { type: 'boolean' },
              fatal: { type: 'boolean' }
            }
          }
        },
        required: ['url']
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
        url: string;
        selector?: string;
        textDecoder?: {
          encoding?: string;
          ignoreBOM?: boolean;
          fatal?: boolean;
        };
      }): Promise<LoadedDocument[]> {
        const service = DocumentService.getInstance();
        return service.loadWebPage(input.url, {
          selector: input.selector,
          textDecoder: input.textDecoder
        });
      }
    },
    {
      name: 'loadSitemap',
      description: 'Load content from a sitemap',
      inputSchema: {
        type: 'object',
        properties: {
          url: { 
            type: 'string',
            description: 'URL of the sitemap'
          },
          selector: { 
            type: 'string',
            description: 'CSS selector to extract specific content'
          },
          limit: { 
            type: 'number',
            description: 'Maximum number of pages to load'
          }
        },
        required: ['url']
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
        url: string;
        selector?: string;
        limit?: number;
      }): Promise<LoadedDocument[]> {
        const service = DocumentService.getInstance();
        return service.loadSitemap(input.url, {
          selector: input.selector,
          limit: input.limit
        });
      }
    },
    {
      name: 'loadGitHubRepo',
      description: 'Load content from a GitHub repository',
      inputSchema: {
        type: 'object',
        properties: {
          owner: { 
            type: 'string',
            description: 'Owner of the repository'
          },
          repo: { 
            type: 'string',
            description: 'Name of the repository'
          },
          branch: { 
            type: 'string',
            description: 'Branch to load (default: main)'
          },
          recursive: { 
            type: 'boolean',
            description: 'Whether to recursively load all files'
          },
          accessToken: { 
            type: 'string',
            description: 'GitHub access token for private repositories'
          },
          ignoreFiles: { 
            type: 'array',
            items: { type: 'string' },
            description: 'Files to ignore'
          },
          ignorePaths: { 
            type: 'array',
            items: { type: 'string' },
            description: 'Paths to ignore'
          }
        },
        required: ['owner', 'repo']
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
        owner: string;
        repo: string;
        branch?: string;
        recursive?: boolean;
        accessToken?: string;
        ignoreFiles?: string[];
        ignorePaths?: string[];
      }): Promise<LoadedDocument[]> {
        const service = DocumentService.getInstance();
        return service.loadGitHubRepo(input.owner, input.repo, {
          branch: input.branch,
          recursive: input.recursive,
          accessToken: input.accessToken,
          ignoreFiles: input.ignoreFiles,
          ignorePaths: input.ignorePaths
        });
      }
    },
    {
      name: 'loadSQL',
      description: 'Load data from a SQL database',
      inputSchema: {
        type: 'object',
        properties: {
          query: { 
            type: 'string',
            description: 'SQL query to execute'
          },
          dbType: { 
            type: 'string',
            enum: ['mysql', 'postgres'],
            description: 'Type of SQL database'
          },
          connectionConfig: { 
            type: 'object',
            description: 'Database connection configuration',
            properties: {
              host: { type: 'string' },
              port: { type: 'number' },
              user: { type: 'string' },
              password: { type: 'string' },
              database: { type: 'string' },
              ssl: { type: 'boolean' }
            },
            required: ['host', 'user', 'password', 'database']
          },
          metadata: { 
            type: 'object',
            description: 'Additional metadata to include with the documents'
          }
        },
        required: ['query', 'dbType', 'connectionConfig']
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
        query: string;
        dbType: "mysql" | "postgres";
        connectionConfig: {
          host: string;
          port?: number;
          user: string;
          password: string;
          database: string;
          ssl?: boolean | object;
        };
        metadata?: Record<string, any>;
      }): Promise<LoadedDocument[]> {
        const service = DocumentService.getInstance();
        return service.loadSQL(
          input.query,
          input.dbType,
          input.connectionConfig,
          input.metadata
        );
      }
    },
    {
      name: 'loadMongoDB',
      description: 'Load data from a MongoDB database',
      inputSchema: {
        type: 'object',
        properties: {
          connectionString: { 
            type: 'string',
            description: 'MongoDB connection string'
          },
          dbName: { 
            type: 'string',
            description: 'Database name'
          },
          collectionName: { 
            type: 'string',
            description: 'Collection name'
          },
          filter: { 
            type: 'object',
            description: 'MongoDB filter query'
          },
          projection: { 
            type: 'object',
            description: 'MongoDB projection'
          },
          contentKey: { 
            type: 'string',
            description: 'Field to use as document content'
          },
          metadataKeys: { 
            type: 'array',
            items: { type: 'string' },
            description: 'Fields to include in document metadata'
          }
        },
        required: ['connectionString', 'dbName', 'collectionName']
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
        connectionString: string;
        dbName: string;
        collectionName: string;
        filter?: Record<string, any>;
        projection?: Record<string, any>;
        contentKey?: string;
        metadataKeys?: string[];
      }): Promise<LoadedDocument[]> {
        const service = DocumentService.getInstance();
        return service.loadMongoDB(
          input.connectionString,
          input.dbName,
          input.collectionName,
          {
            filter: input.filter,
            projection: input.projection,
            contentKey: input.contentKey,
            metadataKeys: input.metadataKeys
          }
        );
      }
    },
    {
      name: 'loadElasticsearch',
      description: 'Load data from an Elasticsearch index',
      inputSchema: {
        type: 'object',
        properties: {
          clientOptions: { 
            type: 'object',
            description: 'Elasticsearch client options',
            properties: {
              node: { type: 'string' },
              auth: { 
                type: 'object',
                properties: {
                  username: { type: 'string' },
                  password: { type: 'string' }
                }
              },
              cloud: {
                type: 'object',
                properties: {
                  id: { type: 'string' }
                }
              },
              ssl: {
                type: 'object',
                properties: {
                  rejectUnauthorized: { type: 'boolean' }
                }
              }
            },
            required: ['node']
          },
          indexName: { 
            type: 'string',
            description: 'Elasticsearch index name'
          },
          query: { 
            type: 'object',
            description: 'Elasticsearch query'
          },
          sourceFields: { 
            type: 'array',
            items: { type: 'string' },
            description: 'Fields to include in the source'
          },
          contentField: { 
            type: 'string',
            description: 'Field to use as document content'
          },
          metadataFields: { 
            type: 'array',
            items: { type: 'string' },
            description: 'Fields to include in document metadata'
          }
        },
        required: ['clientOptions', 'indexName']
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
      }): Promise<LoadedDocument[]> {
        const service = DocumentService.getInstance();
        return service.loadElasticsearch(
          input.clientOptions,
          input.indexName,
          {
            query: input.query,
            sourceFields: input.sourceFields,
            contentField: input.contentField,
            metadataFields: input.metadataFields
          }
        );
      }
    }
  ]
};

export default documentPlugin;
