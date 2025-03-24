import { ComponentRegistry } from '../registry/ComponentRegistry.js';
import { VectorStoreRetrieverFactory } from '../factories/retrievers/VectorStoreRetriever.js';
import { MultiQueryRetrieverFactory } from '../factories/retrievers/MultiQueryRetriever.js';
import { ContextualCompressionRetrieverFactory } from '../factories/retrievers/ContextualCompressionRetriever.js';
import { SelfQueryRetrieverFactory } from '../factories/retrievers/SelfQueryRetriever.js';
import { MultiVectorRetrieverFactory } from '../factories/retrievers/MultiVectorRetriever.js';
import { ParentDocumentRetrieverFactory } from '../factories/retrievers/ParentDocumentRetriever.js';
import { BM25RetrieverFactory } from '../factories/retrievers/BM25Retriever.js';
import { EnsembleRetrieverFactory } from '../factories/retrievers/EnsembleRetriever.js';
import { MultiModalRetrieverFactory } from '../factories/retrievers/MultiModalRetriever.js';

// Register retriever factories
const registry = ComponentRegistry.getInstance();
registry.registerComponent("vector-store", new VectorStoreRetrieverFactory());
registry.registerComponent("multi-query", new MultiQueryRetrieverFactory());
registry.registerComponent("contextual-compression", new ContextualCompressionRetrieverFactory());
registry.registerComponent("self-query", new SelfQueryRetrieverFactory());
registry.registerComponent("multi-vector", new MultiVectorRetrieverFactory());
registry.registerComponent("parent-document", new ParentDocumentRetrieverFactory());
registry.registerComponent("bm25", new BM25RetrieverFactory());
registry.registerComponent("ensemble", new EnsembleRetrieverFactory());
registry.registerComponent("multi-modal", new MultiModalRetrieverFactory());

/**
 * Retriever options
 */
export interface RetrieverOptions {
  [key: string]: any;
}

/**
 * Retriever Service for retrieving relevant documents
 */
export class RetrieverService {
  private static instance: RetrieverService;
  private registry = ComponentRegistry.getInstance();

  private constructor() {}

  static getInstance(): RetrieverService {
    if (!RetrieverService.instance) {
      RetrieverService.instance = new RetrieverService();
    }
    return RetrieverService.instance;
  }

  /**
   * Creates a vector store retriever
   * 
   * @param vectorStore The vector store to retrieve from
   * @param options Additional options for the retriever
   * @returns A new vector store retriever
   */
  async createVectorStoreRetriever(
    vectorStore: any,
    options: {
      k?: number;
      filter?: Record<string, any>;
      searchType?: "similarity" | "mmr";
      searchParams?: {
        k?: number;
        filter?: Record<string, any>;
        score?: boolean;
        fetchK?: number;
        lambda?: number;
      };
    } = {}
  ): Promise<any> {
    try {
      // Get the vector store retriever factory
      const factory = this.registry.getComponentFactory("vector-store");
      
      // Create the retriever with the provided configuration
      return factory.create({
        vectorStore,
        ...options
      });
    } catch (error) {
      console.error("Error creating vector store retriever:", error);
      throw new Error(`Failed to create retriever: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Creates a multi-query retriever
   * 
   * @param retriever The base retriever to use
   * @param llm The LLM to use for generating queries
   * @param options Additional options for the retriever
   * @returns A new multi-query retriever
   */
  async createMultiQueryRetriever(
    retriever: any,
    llm: any,
    options: {
      queryCount?: number;
      promptTemplate?: string;
      generateQueryPrompt?: (query: string) => string;
      uniqueDocsOnly?: boolean;
    } = {}
  ): Promise<any> {
    try {
      // Get the multi-query retriever factory
      const factory = this.registry.getComponentFactory("multi-query");
      
      // Create the retriever with the provided configuration
      return factory.create({
        retriever,
        llm,
        ...options
      });
    } catch (error) {
      console.error("Error creating multi-query retriever:", error);
      throw new Error(`Failed to create retriever: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Creates a contextual compression retriever
   * 
   * @param baseRetriever The base retriever to use
   * @param options Additional options for the retriever
   * @returns A new contextual compression retriever
   */
  async createContextualCompressionRetriever(
    baseRetriever: any,
    options: {
      baseCompressor?: any;
      documentCompressorType?: "llm" | "embeddings" | "redundant";
      llm?: any;
      embeddings?: any;
      similarityThreshold?: number;
      minSimilarity?: number;
    } = {}
  ): Promise<any> {
    try {
      // Get the contextual compression retriever factory
      const factory = this.registry.getComponentFactory("contextual-compression");
      
      // Create the retriever with the provided configuration
      return factory.create({
        baseRetriever,
        ...options
      });
    } catch (error) {
      console.error("Error creating contextual compression retriever:", error);
      throw new Error(`Failed to create retriever: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Creates a self-query retriever
   * 
   * @param vectorStore The vector store to retrieve from
   * @param llm The LLM to use for generating structured queries
   * @param documentContents A description of the document contents
   * @param options Additional options for the retriever
   * @returns A new self-query retriever
   */
  async createSelfQueryRetriever(
    vectorStore: any,
    llm: any,
    documentContents: string,
    options: {
      attributeInfo?: Record<string, { type: string; description: string }>;
      structuredQueryTranslator?: any;
      allowedComparators?: string[];
      allowedOperators?: string[];
      promptTemplate?: string;
      examples?: Array<{ query: string; filter?: Record<string, any> }>;
    } = {}
  ): Promise<any> {
    try {
      // Get the self-query retriever factory
      const factory = this.registry.getComponentFactory("self-query");
      
      // Create the retriever with the provided configuration
      return factory.create({
        vectorStore,
        llm,
        documentContents,
        ...options
      });
    } catch (error) {
      console.error("Error creating self-query retriever:", error);
      throw new Error(`Failed to create retriever: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Creates a multi-vector retriever
   * 
   * @param vectorstore The vector store to retrieve from
   * @param options Additional options for the retriever
   * @returns A new multi-vector retriever
   */
  async createMultiVectorRetriever(
    vectorstore: any,
    options: {
      docstore?: any;
      idKey?: string;
      childKey?: string;
      searchType?: "similarity" | "mmr";
      searchKwargs?: Record<string, any>;
    } = {}
  ): Promise<any> {
    try {
      // Get the multi-vector retriever factory
      const factory = this.registry.getComponentFactory("multi-vector");
      
      // Create the retriever with the provided configuration
      return factory.create({
        vectorstore,
        ...options
      });
    } catch (error) {
      console.error("Error creating multi-vector retriever:", error);
      throw new Error(`Failed to create retriever: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Creates a parent document retriever
   * 
   * @param vectorstore The vector store to retrieve from
   * @param childSplitter The splitter to use for child documents
   * @param options Additional options for the retriever
   * @returns A new parent document retriever
   */
  async createParentDocumentRetriever(
    vectorstore: any,
    childSplitter: any,
    options: {
      docstore?: any;
      parentSplitter?: any;
      childK?: number;
      parentK?: number;
      childSearchKwargs?: Record<string, any>;
      parentSearchKwargs?: Record<string, any>;
    } = {}
  ): Promise<any> {
    try {
      // Get the parent document retriever factory
      const factory = this.registry.getComponentFactory("parent-document");
      
      // Create the retriever with the provided configuration
      return factory.create({
        vectorstore,
        childSplitter,
        ...options
      });
    } catch (error) {
      console.error("Error creating parent document retriever:", error);
      throw new Error(`Failed to create retriever: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Creates a BM25 retriever
   * 
   * @param documents The documents to index
   * @param options Additional options for the retriever
   * @returns A new BM25 retriever
   */
  async createBM25Retriever(
    documents: Array<{ pageContent: string; metadata: Record<string, any> }>,
    options: {
      k?: number;
      b?: number;
      k1?: number;
      fields?: string[];
      metadataFields?: string[];
      returnMetadata?: boolean;
    } = {}
  ): Promise<any> {
    try {
      // Get the BM25 retriever factory
      const factory = this.registry.getComponentFactory("bm25");
      
      // Create the retriever with the provided configuration
      return factory.create({
        documents,
        ...options
      });
    } catch (error) {
      console.error("Error creating BM25 retriever:", error);
      throw new Error(`Failed to create retriever: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Creates an ensemble retriever
   * 
   * @param retrievers The retrievers to ensemble
   * @param options Additional options for the retriever
   * @returns A new ensemble retriever
   */
  async createEnsembleRetriever(
    retrievers: any[],
    options: {
      weights?: number[];
      ensembleType?: "merge" | "reciprocal_rank_fusion";
      rrf?: {
        k?: number;
      };
      returnScores?: boolean;
    } = {}
  ): Promise<any> {
    try {
      // Get the ensemble retriever factory
      const factory = this.registry.getComponentFactory("ensemble");
      
      // Create the retriever with the provided configuration
      return factory.create({
        retrievers,
        ...options
      });
    } catch (error) {
      console.error("Error creating ensemble retriever:", error);
      throw new Error(`Failed to create retriever: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Creates a multi-modal retriever
   * 
   * @param textRetriever The text retriever to use
   * @param options Additional options for the retriever
   * @returns A new multi-modal retriever
   */
  async createMultiModalRetriever(
    textRetriever: any,
    options: {
      imageRetriever?: any;
      audioRetriever?: any;
      videoRetriever?: any;
      modalityWeights?: {
        text?: number;
        image?: number;
        audio?: number;
        video?: number;
      };
      fusionStrategy?: "weighted" | "max" | "min" | "mean";
      k?: number;
      returnScores?: boolean;
    } = {}
  ): Promise<any> {
    try {
      // Get the multi-modal retriever factory
      const factory = this.registry.getComponentFactory("multi-modal");
      
      // Create the retriever with the provided configuration
      return factory.create({
        textRetriever,
        ...options
      });
    } catch (error) {
      console.error("Error creating multi-modal retriever:", error);
      throw new Error(`Failed to create retriever: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Retrieves relevant documents for a query
   * 
   * @param retriever The retriever to use
   * @param query The query to retrieve documents for
   * @returns The relevant documents
   */
  async retrieveDocuments(
    retriever: any,
    query: string
  ): Promise<Array<{ pageContent: string; metadata: Record<string, any> }>> {
    try {
      // Check if the retriever has the required methods
      if (typeof retriever.getRelevantDocuments !== 'function') {
        throw new Error("Invalid retriever: missing getRelevantDocuments method");
      }
      
      // Retrieve the documents
      return retriever.getRelevantDocuments(query);
    } catch (error) {
      console.error("Error retrieving documents:", error);
      throw new Error(`Failed to retrieve documents: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

// Plugin definition for integration with MintFlow
const retrieverPlugin = {
  id: "retriever",
  name: "Retriever Plugin",
  icon: "GiMagnifyingGlass",
  description: "Document retrieval capabilities for RAG applications",
  documentation: "https://js.langchain.com/docs/modules/data_connection/retrievers/",
  
  inputSchema: {
    type: 'object',
    properties: {
      vectorStore: { type: 'object' },
      retriever: { type: 'object' },
      query: { type: 'string' },
      options: { type: 'object' }
    }
  },
  
  actions: [
    {
      name: 'createVectorStoreRetriever',
      description: 'Create a retriever from a vector store',
      inputSchema: {
        type: 'object',
        properties: {
          vectorStore: { 
            type: 'object',
            description: 'Vector store to retrieve from'
          },
          k: { 
            type: 'number',
            description: 'Number of documents to retrieve'
          },
          filter: { 
            type: 'object',
            description: 'Filter to apply to the retrieval'
          },
          searchType: { 
            type: 'string',
            enum: ['similarity', 'mmr'],
            description: 'Type of search to perform'
          },
          searchParams: { 
            type: 'object',
            description: 'Additional parameters for the search'
          }
        },
        required: ['vectorStore']
      },
      outputSchema: {
        type: 'object',
        description: 'Vector store retriever'
      },
      execute: async function(input: {
        vectorStore: any;
        k?: number;
        filter?: Record<string, any>;
        searchType?: "similarity" | "mmr";
        searchParams?: {
          k?: number;
          filter?: Record<string, any>;
          score?: boolean;
          fetchK?: number;
          lambda?: number;
        };
      }): Promise<any> {
        const service = RetrieverService.getInstance();
        const { vectorStore, ...options } = input;
        return service.createVectorStoreRetriever(vectorStore, options);
      }
    },
    {
      name: 'createMultiQueryRetriever',
      description: 'Create a multi-query retriever',
      inputSchema: {
        type: 'object',
        properties: {
          retriever: { 
            type: 'object',
            description: 'Base retriever to use'
          },
          llm: { 
            type: 'object',
            description: 'LLM to use for generating queries'
          },
          queryCount: { 
            type: 'number',
            description: 'Number of queries to generate'
          },
          promptTemplate: { 
            type: 'string',
            description: 'Template for generating queries'
          },
          uniqueDocsOnly: { 
            type: 'boolean',
            description: 'Whether to return only unique documents'
          }
        },
        required: ['retriever', 'llm']
      },
      outputSchema: {
        type: 'object',
        description: 'Multi-query retriever'
      },
      execute: async function(input: {
        retriever: any;
        llm: any;
        queryCount?: number;
        promptTemplate?: string;
        generateQueryPrompt?: (query: string) => string;
        uniqueDocsOnly?: boolean;
      }): Promise<any> {
        const service = RetrieverService.getInstance();
        const { retriever, llm, ...options } = input;
        return service.createMultiQueryRetriever(retriever, llm, options);
      }
    },
    {
      name: 'createContextualCompressionRetriever',
      description: 'Create a contextual compression retriever',
      inputSchema: {
        type: 'object',
        properties: {
          baseRetriever: { 
            type: 'object',
            description: 'Base retriever to use'
          },
          baseCompressor: { 
            type: 'object',
            description: 'Base compressor to use'
          },
          documentCompressorType: { 
            type: 'string',
            enum: ['llm', 'embeddings', 'redundant'],
            description: 'Type of document compressor to use'
          },
          llm: { 
            type: 'object',
            description: 'LLM to use for compression'
          },
          embeddings: { 
            type: 'object',
            description: 'Embeddings to use for compression'
          },
          similarityThreshold: { 
            type: 'number',
            description: 'Threshold for similarity-based compression'
          },
          minSimilarity: { 
            type: 'number',
            description: 'Minimum similarity for redundancy-based compression'
          }
        },
        required: ['baseRetriever']
      },
      outputSchema: {
        type: 'object',
        description: 'Contextual compression retriever'
      },
      execute: async function(input: {
        baseRetriever: any;
        baseCompressor?: any;
        documentCompressorType?: "llm" | "embeddings" | "redundant";
        llm?: any;
        embeddings?: any;
        similarityThreshold?: number;
        minSimilarity?: number;
      }): Promise<any> {
        const service = RetrieverService.getInstance();
        const { baseRetriever, ...options } = input;
        return service.createContextualCompressionRetriever(baseRetriever, options);
      }
    },
    {
      name: 'createSelfQueryRetriever',
      description: 'Create a self-query retriever that can generate structured queries',
      inputSchema: {
        type: 'object',
        properties: {
          vectorStore: { 
            type: 'object',
            description: 'Vector store to retrieve from'
          },
          llm: { 
            type: 'object',
            description: 'LLM to use for generating structured queries'
          },
          documentContents: { 
            type: 'string',
            description: 'Description of the document contents'
          },
          attributeInfo: { 
            type: 'object',
            description: 'Information about document attributes for filtering'
          },
          examples: { 
            type: 'array',
            description: 'Example queries and filters for few-shot learning'
          }
        },
        required: ['vectorStore', 'llm', 'documentContents']
      },
      outputSchema: {
        type: 'object',
        description: 'Self-query retriever'
      },
      execute: async function(input: {
        vectorStore: any;
        llm: any;
        documentContents: string;
        attributeInfo?: Record<string, { type: string; description: string }>;
        structuredQueryTranslator?: any;
        allowedComparators?: string[];
        allowedOperators?: string[];
        promptTemplate?: string;
        examples?: Array<{ query: string; filter?: Record<string, any> }>;
      }): Promise<any> {
        const service = RetrieverService.getInstance();
        const { vectorStore, llm, documentContents, ...options } = input;
        return service.createSelfQueryRetriever(vectorStore, llm, documentContents, options);
      }
    },
    {
      name: 'createMultiVectorRetriever',
      description: 'Create a multi-vector retriever that can store and retrieve parent-child document relationships',
      inputSchema: {
        type: 'object',
        properties: {
          vectorstore: { 
            type: 'object',
            description: 'Vector store to retrieve from'
          },
          docstore: { 
            type: 'object',
            description: 'Document store for parent documents'
          },
          idKey: { 
            type: 'string',
            description: 'Key for parent ID in child document metadata'
          },
          childKey: { 
            type: 'string',
            description: 'Key for child IDs in parent document metadata'
          },
          searchType: { 
            type: 'string',
            enum: ['similarity', 'mmr'],
            description: 'Type of search to perform'
          },
          searchKwargs: { 
            type: 'object',
            description: 'Additional parameters for the search'
          }
        },
        required: ['vectorstore']
      },
      outputSchema: {
        type: 'object',
        description: 'Multi-vector retriever'
      },
      execute: async function(input: {
        vectorstore: any;
        docstore?: any;
        idKey?: string;
        childKey?: string;
        searchType?: "similarity" | "mmr";
        searchKwargs?: Record<string, any>;
      }): Promise<any> {
        const service = RetrieverService.getInstance();
        const { vectorstore, ...options } = input;
        return service.createMultiVectorRetriever(vectorstore, options);
      }
    },
    {
      name: 'createParentDocumentRetriever',
      description: 'Create a parent document retriever that splits documents into chunks but returns the parent document',
      inputSchema: {
        type: 'object',
        properties: {
          vectorstore: { 
            type: 'object',
            description: 'Vector store to retrieve from'
          },
          childSplitter: { 
            type: 'object',
            description: 'Splitter to use for child documents'
          },
          docstore: { 
            type: 'object',
            description: 'Document store for parent documents'
          },
          parentSplitter: { 
            type: 'object',
            description: 'Splitter to use for parent documents'
          },
          childK: { 
            type: 'number',
            description: 'Number of child documents to retrieve'
          },
          parentK: { 
            type: 'number',
            description: 'Number of parent documents to retrieve'
          }
        },
        required: ['vectorstore', 'childSplitter']
      },
      outputSchema: {
        type: 'object',
        description: 'Parent document retriever'
      },
      execute: async function(input: {
        vectorstore: any;
        childSplitter: any;
        docstore?: any;
        parentSplitter?: any;
        childK?: number;
        parentK?: number;
        childSearchKwargs?: Record<string, any>;
        parentSearchKwargs?: Record<string, any>;
      }): Promise<any> {
        const service = RetrieverService.getInstance();
        const { vectorstore, childSplitter, ...options } = input;
        return service.createParentDocumentRetriever(vectorstore, childSplitter, options);
      }
    },
    {
      name: 'createBM25Retriever',
      description: 'Create a BM25 retriever for keyword-based search',
      inputSchema: {
        type: 'object',
        properties: {
          documents: { 
            type: 'array',
            description: 'Documents to index'
          },
          k: { 
            type: 'number',
            description: 'Number of documents to retrieve'
          },
          b: { 
            type: 'number',
            description: 'BM25 b parameter (document length normalization)'
          },
          k1: { 
            type: 'number',
            description: 'BM25 k1 parameter (term frequency scaling)'
          },
          fields: { 
            type: 'array',
            description: 'Fields to index'
          },
          metadataFields: { 
            type: 'array',
            description: 'Metadata fields to index'
          }
        },
        required: ['documents']
      },
      outputSchema: {
        type: 'object',
        description: 'BM25 retriever'
      },
      execute: async function(input: {
        documents: Array<{ pageContent: string; metadata: Record<string, any> }>;
        k?: number;
        b?: number;
        k1?: number;
        fields?: string[];
        metadataFields?: string[];
        returnMetadata?: boolean;
      }): Promise<any> {
        const service = RetrieverService.getInstance();
        const { documents, ...options } = input;
        return service.createBM25Retriever(documents, options);
      }
    },
    {
      name: 'createEnsembleRetriever',
      description: 'Create an ensemble retriever that combines results from multiple retrievers',
      inputSchema: {
        type: 'object',
        properties: {
          retrievers: { 
            type: 'array',
            description: 'Retrievers to ensemble'
          },
          weights: { 
            type: 'array',
            description: 'Weights for each retriever'
          },
          ensembleType: { 
            type: 'string',
            enum: ['merge', 'reciprocal_rank_fusion'],
            description: 'Type of ensemble to perform'
          },
          rrf: { 
            type: 'object',
            description: 'Parameters for reciprocal rank fusion'
          },
          returnScores: { 
            type: 'boolean',
            description: 'Whether to return scores with the documents'
          }
        },
        required: ['retrievers']
      },
      outputSchema: {
        type: 'object',
        description: 'Ensemble retriever'
      },
      execute: async function(input: {
        retrievers: any[];
        weights?: number[];
        ensembleType?: "merge" | "reciprocal_rank_fusion";
        rrf?: {
          k?: number;
        };
        returnScores?: boolean;
      }): Promise<any> {
        const service = RetrieverService.getInstance();
        const { retrievers, ...options } = input;
        return service.createEnsembleRetriever(retrievers, options);
      }
    },
    {
      name: 'createMultiModalRetriever',
      description: 'Create a multi-modal retriever that can handle different types of data',
      inputSchema: {
        type: 'object',
        properties: {
          textRetriever: { 
            type: 'object',
            description: 'Text retriever to use'
          },
          imageRetriever: { 
            type: 'object',
            description: 'Image retriever to use'
          },
          audioRetriever: { 
            type: 'object',
            description: 'Audio retriever to use'
          },
          videoRetriever: { 
            type: 'object',
            description: 'Video retriever to use'
          },
          modalityWeights: { 
            type: 'object',
            description: 'Weights for each modality'
          },
          fusionStrategy: { 
            type: 'string',
            enum: ['weighted', 'max', 'min', 'mean'],
            description: 'Strategy for fusing results'
          },
          k: { 
            type: 'number',
            description: 'Number of documents to retrieve'
          }
        },
        required: ['textRetriever']
      },
      outputSchema: {
        type: 'object',
        description: 'Multi-modal retriever'
      },
      execute: async function(input: {
        textRetriever: any;
        imageRetriever?: any;
        audioRetriever?: any;
        videoRetriever?: any;
        modalityWeights?: {
          text?: number;
          image?: number;
          audio?: number;
          video?: number;
        };
        fusionStrategy?: "weighted" | "max" | "min" | "mean";
        k?: number;
        returnScores?: boolean;
      }): Promise<any> {
        const service = RetrieverService.getInstance();
        const { textRetriever, ...options } = input;
        return service.createMultiModalRetriever(textRetriever, options);
      }
    },
    {
      name: 'retrieveDocuments',
      description: 'Retrieve relevant documents for a query',
      inputSchema: {
        type: 'object',
        properties: {
          retriever: { 
            type: 'object',
            description: 'Retriever to use'
          },
          query: { 
            type: 'string',
            description: 'Query to retrieve documents for'
          }
        },
        required: ['retriever', 'query']
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
        retriever: any;
        query: string;
      }): Promise<Array<{ pageContent: string; metadata: Record<string, any> }>> {
        const service = RetrieverService.getInstance();
        return service.retrieveDocuments(input.retriever, input.query);
      }
    }
  ]
};

export default retrieverPlugin;
