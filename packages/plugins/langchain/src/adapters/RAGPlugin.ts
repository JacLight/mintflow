// plugins/RAGPlugin.ts

import {
    AIPluginConfig,
    EmbeddingInput,
    EmbeddingResponse
} from '../interface/index.js';
import { logger } from '@mintflow/common';
import { RedisService } from '../services/RedisService.js';
import { ConfigService } from '../services/ConfigService.js';

/**
 * Document interface for storing in the vector database
 */
interface Document {
    id: string;
    text: string;
    metadata: Record<string, any>;
    embedding?: number[];
}

/**
 * Chunk options for document splitting
 */
interface ChunkOptions {
    chunkSize?: number;
    chunkOverlap?: number;
    separator?: string;
}

/**
 * Retrieval options for vector search
 */
interface RetrievalOptions {
    maxResults?: number;
    minScore?: number;
    filter?: Record<string, any>;
}

/**
 * Vector search result
 */
interface SearchResult {
    document: Document;
    score: number;
}

/**
 * RAG Service for managing documents and retrievals
 */
export class RAGService {
    private static instance: RAGService;
    private redis = RedisService.getInstance();
    private config = ConfigService.getInstance().getConfig();

    private constructor() { }

    static getInstance(): RAGService {
        if (!RAGService.instance) {
            RAGService.instance = new RAGService();
        }
        return RAGService.instance;
    }

    /**
     * Splits a document into chunks for embedding
     */
    splitDocument(
        document: {
            id: string;
            text: string;
            metadata?: Record<string, any>;
        },
        options: ChunkOptions = {}
    ): Document[] {
        const {
            chunkSize = 1000,
            chunkOverlap = 200,
            separator = '\n'
        } = options;

        const text = document.text;
        const chunks: Document[] = [];

        // Simple implementation of text splitting by separator
        if (separator && text.includes(separator)) {
            const paragraphs = text.split(separator).filter(p => p.trim().length > 0);
            let currentChunk = '';
            let chunkId = 1;

            for (const paragraph of paragraphs) {
                // If adding this paragraph would exceed the chunk size,
                // save the current chunk and start a new one
                if (currentChunk.length + paragraph.length > chunkSize && currentChunk.length > 0) {
                    chunks.push({
                        id: `${document.id}-${chunkId}`,
                        text: currentChunk,
                        metadata: {
                            ...document.metadata || {},
                            parent_id: document.id,
                            chunk_id: chunkId
                        }
                    });

                    // Start a new chunk with overlap
                    const words = currentChunk.split(' ');
                    const overlapWords = words.slice(-Math.floor(chunkOverlap / 5)); // Approximate words for overlap
                    currentChunk = overlapWords.join(' ') + separator + paragraph;
                    chunkId++;
                } else {
                    // Add to current chunk
                    if (currentChunk.length > 0) {
                        currentChunk += separator;
                    }
                    currentChunk += paragraph;
                }
            }

            // Add the final chunk if it's not empty
            if (currentChunk.length > 0) {
                chunks.push({
                    id: `${document.id}-${chunkId}`,
                    text: currentChunk,
                    metadata: {
                        ...document.metadata || {},
                        parent_id: document.id,
                        chunk_id: chunkId
                    }
                });
            }
        }
        // Fallback to simple character-based chunking
        else {
            for (let i = 0; i < text.length; i += (chunkSize - chunkOverlap)) {
                // Ensure we don't go past the end of the text
                const end = Math.min(i + chunkSize, text.length);

                // Extract the chunk
                const chunk = text.substring(i, end);

                // Skip empty chunks
                if (chunk.trim().length === 0) continue;

                chunks.push({
                    id: `${document.id}-${Math.floor(i / (chunkSize - chunkOverlap)) + 1}`,
                    text: chunk,
                    metadata: {
                        ...document.metadata || {},
                        parent_id: document.id,
                        chunk_id: Math.floor(i / (chunkSize - chunkOverlap)) + 1,
                        start: i,
                        end
                    }
                });
            }
        }

        return chunks;
    }

    /**
     * Creates embeddings for documents using the configured AI provider
     */
    async createEmbeddings(
        documents: Document[],
        config: AIPluginConfig,
        provider?: string,
        model?: string
    ): Promise<Document[]> {
        try {
            // Find a suitable embedding model if not specified
            if (!model) {
                // TODO: Query available models and select one with embedding capability
                model = 'text-embedding-ada-002'; // Default to OpenAI
            }

            // Create embeddings in batches to avoid rate limits
            const batchSize = 20;
            const batches: Document[][] = [];

            for (let i = 0; i < documents.length; i += batchSize) {
                batches.push(documents.slice(i, i + batchSize));
            }

            const embeddedDocuments: Document[] = [];

            for (const batch of batches) {
                // Prepare input for the embedding model
                const texts = batch.map(doc => doc.text);

                // Create embeddings request
                const embeddingInput: EmbeddingInput = {
                    config,
                    provider,
                    model,
                    input: texts
                };

                // Call the embedding API (using AI plugin)
                // In actual implementation, you would call your AI plugin here
                // For demo, we'll create mock embeddings
                const embeddingResponse = await this.mockEmbeddingAPI(embeddingInput);

                // Assign embeddings to documents
                for (let i = 0; i < batch.length; i++) {
                    const doc = batch[i];
                    if (embeddingResponse.embeddings[i]) {
                        doc.embedding = embeddingResponse.embeddings[i];
                        embeddedDocuments.push(doc);
                    } else {
                        logger.error(`Failed to create embedding for document ${doc.id}`);
                    }
                }

                // Add a small delay to avoid rate limits
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            return embeddedDocuments;
        } catch (error) {
            logger.error('Error creating embeddings:', error);
            throw error;
        }
    }

    /**
     * Mock embedding API for development - replace with actual AI plugin call
     */
    private async mockEmbeddingAPI(input: EmbeddingInput): Promise<EmbeddingResponse> {
        // Create mock embeddings of dimension 1536 (OpenAI's default)
        const embeddings = (input.input as string[]).map(() => {
            return Array.from({ length: 1536 }, () => Math.random() * 2 - 1);
        });

        return {
            embeddings,
            usage: {
                promptTokens: 0,
                totalTokens: 0
            }
        };
    }

    /**
     * Saves documents with embeddings to vector store
     */
    async saveDocuments(
        namespace: string,
        documents: Document[]
    ): Promise<string[]> {
        try {
            const savedIds: string[] = [];

            // Save each document to Redis
            for (const doc of documents) {
                if (!doc.embedding) {
                    logger.warn(`Document ${doc.id} has no embedding, skipping`);
                    continue;
                }

                const key = `rag:docs:${namespace}:${doc.id}`;
                await this.redis.client.json.set(key, '$', {
                    id: doc.id,
                    text: doc.text,
                    metadata: doc.metadata,
                    embedding: doc.embedding
                });

                savedIds.push(doc.id);
            }

            // You would also add to a vector index in a real implementation
            // This implementation uses simple Redis storage for demo purposes

            return savedIds;
        } catch (error) {
            logger.error('Error saving documents:', error);
            throw error;
        }
    }

    /**
     * Retrieves a document by ID
     */
    async getDocument(
        namespace: string,
        id: string
    ): Promise<Document | null> {
        try {
            const key = `rag:docs:${namespace}:${id}`;
            const doc = await this.redis.client.json.get(key);

            if (!doc) return null;

            return doc as Document;
        } catch (error) {
            logger.error(`Error retrieving document ${id}:`, error);
            return null;
        }
    }

    /**
     * Deletes a document by ID
     */
    async deleteDocument(
        namespace: string,
        id: string
    ): Promise<boolean> {
        try {
            const key = `rag:docs:${namespace}:${id}`;
            const result = await this.redis.client.del(key);

            return result > 0;
        } catch (error) {
            logger.error(`Error deleting document ${id}:`, error);
            return false;
        }
    }

    /**
     * Creates a query embedding
     */
    async createQueryEmbedding(
        query: string,
        config: AIPluginConfig,
        provider?: string,
        model?: string
    ): Promise<number[]> {
        try {
            // Find a suitable embedding model if not specified
            if (!model) {
                model = 'text-embedding-ada-002'; // Default to OpenAI
            }

            // Create embedding request
            const embeddingInput: EmbeddingInput = {
                config,
                provider,
                model,
                input: query
            };

            // Call the embedding API (using AI plugin)
            // In actual implementation, you would call your AI plugin here
            const embeddingResponse = await this.mockEmbeddingAPI(embeddingInput);

            return embeddingResponse.embeddings[0];
        } catch (error) {
            logger.error('Error creating query embedding:', error);
            throw error;
        }
    }

    /**
     * Searches for similar documents using vector similarity
     */
    async searchSimilarDocuments(
        namespace: string,
        queryEmbedding: number[],
        options: RetrievalOptions = {}
    ): Promise<SearchResult[]> {
        try {
            const {
                maxResults = 5,
                minScore = 0.7,
                filter = {}
            } = options;

            // In a real implementation, you would use a vector database
            // For this demo, we'll load all documents and compute similarity in memory
            const keys = await this.redis.client.keys(`rag:docs:${namespace}:*`);
            const documents: Document[] = [];

            for (const key of keys) {
                const doc = await this.redis.client.json.get(key);
                if (doc) {
                    documents.push(doc as Document);
                }
            }

            // Filter documents by metadata if specified
            let filteredDocs = documents;
            if (Object.keys(filter).length > 0) {
                filteredDocs = documents.filter(doc => {
                    for (const [key, value] of Object.entries(filter)) {
                        if (doc.metadata[key] !== value) {
                            return false;
                        }
                    }
                    return true;
                });
            }

            // Compute cosine similarity for each document
            const results: SearchResult[] = [];

            for (const doc of filteredDocs) {
                if (!doc.embedding) continue;

                const similarity = this.cosineSimilarity(queryEmbedding, doc.embedding);

                if (similarity >= minScore) {
                    results.push({
                        document: doc,
                        score: similarity
                    });
                }
            }

            // Sort by similarity (highest first) and limit to maxResults
            return results
                .sort((a, b) => b.score - a.score)
                .slice(0, maxResults);
        } catch (error) {
            logger.error('Error searching documents:', error);
            return [];
        }
    }

    /**
     * Performs hybrid search (combines keyword and vector search)
     */
    async hybridSearch(
        namespace: string,
        query: string,
        queryEmbedding: number[],
        options: RetrievalOptions & {
            keywordWeight?: number; // 0 to 1, higher means more emphasis on keywords
        } = {}
    ): Promise<SearchResult[]> {
        try {
            const {
                maxResults = 5,
                minScore = 0.7,
                filter = {},
                keywordWeight = 0.3
            } = options;

            // In a real implementation, you would use a vector database with hybrid search
            // For this demo, we'll load all documents and compute combined scores
            const keys = await this.redis.client.keys(`rag:docs:${namespace}:*`);
            const documents: Document[] = [];

            for (const key of keys) {
                const doc = await this.redis.client.json.get(key);
                if (doc) {
                    documents.push(doc as Document);
                }
            }

            // Filter documents by metadata if specified
            let filteredDocs = documents;
            if (Object.keys(filter).length > 0) {
                filteredDocs = documents.filter(doc => {
                    for (const [key, value] of Object.entries(filter)) {
                        if (doc.metadata[key] !== value) {
                            return false;
                        }
                    }
                    return true;
                });
            }

            // Tokenize query for keyword matching
            const queryTokens = query.toLowerCase().split(/\s+/);

            // Compute combined scores (vector similarity + keyword matches)
            const results: SearchResult[] = [];

            for (const doc of filteredDocs) {
                if (!doc.embedding) continue;

                // Vector similarity (cosine)
                const vectorScore = this.cosineSimilarity(queryEmbedding, doc.embedding);

                // Keyword matching (simple token overlap)
                const docTokens = doc.text.toLowerCase().split(/\s+/);
                const matchingTokens = queryTokens.filter(token =>
                    docTokens.includes(token)
                );
                const keywordScore = matchingTokens.length / queryTokens.length;

                // Combined score
                const combinedScore =
                    (1 - keywordWeight) * vectorScore +
                    keywordWeight * keywordScore;

                if (combinedScore >= minScore) {
                    results.push({
                        document: doc,
                        score: combinedScore
                    });
                }
            }

            // Sort by combined score (highest first) and limit to maxResults
            return results
                .sort((a, b) => b.score - a.score)
                .slice(0, maxResults);
        } catch (error) {
            logger.error('Error performing hybrid search:', error);
            return [];
        }
    }

    /**
     * Computes cosine similarity between two vectors
     */
    private cosineSimilarity(a: number[], b: number[]): number {
        if (a.length !== b.length) {
            throw new Error('Vectors must have the same length');
        }

        let dotProduct = 0;
        let aMagnitude = 0;
        let bMagnitude = 0;

        for (let i = 0; i < a.length; i++) {
            dotProduct += a[i] * b[i];
            aMagnitude += a[i] * a[i];
            bMagnitude += b[i] * b[i];
        }

        aMagnitude = Math.sqrt(aMagnitude);
        bMagnitude = Math.sqrt(bMagnitude);

        if (aMagnitude === 0 || bMagnitude === 0) {
            return 0;
        }

        return dotProduct / (aMagnitude * bMagnitude);
    }

    /**
     * Processes a document from text to searchable chunks with embeddings
     */
    async processDocument(
        document: {
            id: string;
            text: string;
            metadata?: Record<string, any>;
        },
        namespace: string,
        config: AIPluginConfig,
        options: ChunkOptions = {},
        provider?: string,
        model?: string
    ): Promise<string[]> {
        try {
            // 1. Split document into chunks
            const chunks = this.splitDocument(document, options);

            // 2. Create embeddings for chunks
            const embeddedChunks = await this.createEmbeddings(
                chunks,
                config,
                provider,
                model
            );

            // 3. Save chunks to vector store
            const savedIds = await this.saveDocuments(namespace, embeddedChunks);

            return savedIds;
        } catch (error) {
            logger.error('Error processing document:', error);
            throw error;
        }
    }
}

// Plugin definition for integration with your workflow engine
const ragPlugin = {
    id: "rag",
    name: "RAG Plugin",
    icon: "GiMagnifyingGlass",
    description: "Retrieval augmented generation for document search and context enhancement",
    documentation: "https://docs.example.com/rag",

    inputSchema: {
        document: {
            type: 'object',
            properties: {
                id: { type: 'string' },
                text: { type: 'string' },
                metadata: { type: 'object' }
            },
            required: ['id', 'text']
        },
        namespace: { type: 'string' },
        config: { type: 'object' },
        provider: { type: 'string' },
        model: { type: 'string' },
        options: { type: 'object' },
        query: { type: 'string' },
        queryEmbedding: { type: 'array', items: { type: 'number' } },
        id: { type: 'string' }
    },

    actions: [
        {
            name: 'processDocument',
            execute: async function (input: {
                document: {
                    id: string;
                    text: string;
                    metadata?: Record<string, any>;
                };
                namespace: string;
                config: AIPluginConfig;
                options?: ChunkOptions;
                provider?: string;
                model?: string;
            }): Promise<string[]> {
                return RAGService.getInstance().processDocument(
                    input.document,
                    input.namespace,
                    input.config,
                    input.options,
                    input.provider,
                    input.model
                );
            }
        },
        {
            name: 'splitDocument',
            execute: async function (input: {
                document: {
                    id: string;
                    text: string;
                    metadata?: Record<string, any>;
                };
                options?: ChunkOptions;
            }): Promise<Document[]> {
                return RAGService.getInstance().splitDocument(
                    input.document,
                    input.options
                );
            }
        },
        {
            name: 'createEmbeddings',
            execute: async function (input: {
                documents: Document[];
                config: AIPluginConfig;
                provider?: string;
                model?: string;
            }): Promise<Document[]> {
                return RAGService.getInstance().createEmbeddings(
                    input.documents,
                    input.config,
                    input.provider,
                    input.model
                );
            }
        },
        {
            name: 'saveDocuments',
            execute: async function (input: {
                namespace: string;
                documents: Document[];
            }): Promise<string[]> {
                return RAGService.getInstance().saveDocuments(
                    input.namespace,
                    input.documents
                );
            }
        },
        {
            name: 'getDocument',
            execute: async function (input: {
                namespace: string;
                id: string;
            }): Promise<Document | null> {
                return RAGService.getInstance().getDocument(
                    input.namespace,
                    input.id
                );
            }
        },
        {
            name: 'deleteDocument',
            execute: async function (input: {
                namespace: string;
                id: string;
            }): Promise<boolean> {
                return RAGService.getInstance().deleteDocument(
                    input.namespace,
                    input.id
                );
            }
        },
        {
            name: 'createQueryEmbedding',
            execute: async function (input: {
                query: string;
                config: AIPluginConfig;
                provider?: string;
                model?: string;
            }): Promise<number[]> {
                return RAGService.getInstance().createQueryEmbedding(
                    input.query,
                    input.config,
                    input.provider,
                    input.model
                );
            }
        },
        {
            name: 'searchSimilarDocuments',
            execute: async function (input: {
                namespace: string;
                queryEmbedding: number[];
                options?: RetrievalOptions;
            }): Promise<SearchResult[]> {
                return RAGService.getInstance().searchSimilarDocuments(
                    input.namespace,
                    input.queryEmbedding,
                    input.options
                );
            }
        },
        {
            name: 'hybridSearch',
            execute: async function (input: {
                namespace: string;
                query: string;
                queryEmbedding: number[];
                options?: RetrievalOptions & {
                    keywordWeight?: number;
                };
            }): Promise<SearchResult[]> {
                return RAGService.getInstance().hybridSearch(
                    input.namespace,
                    input.query,
                    input.queryEmbedding,
                    input.options
                );
            }
        }
    ]
};

export default ragPlugin;