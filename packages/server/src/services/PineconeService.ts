import { Pinecone } from '@pinecone-database/pinecone';
import { logger } from '@mintflow/common';
import { IVectorDB } from '../interfaces/IVectorDB.js';
import { ENV } from '../config/env.js';

export class PineconeService implements IVectorDB {
    private static instance: PineconeService;
    private client: Pinecone;
    private readonly indexName = 'phd_index';

    private constructor(client: Pinecone) {
        this.client = client;
        logger.info('[PineconeServerice] Connected to Pinecone');
    }

    /**
     * Ensures only one instance of PineconeServerice is created (Singleton).
     */
    public static async getInstance(): Promise<PineconeService> {
        if (!PineconeService.instance) {
            const client = new Pinecone({
                apiKey: ENV.PINECONE_API_KEY,
            });
            PineconeService.instance = new PineconeService(client);
        }
        return PineconeService.instance;
    }

    /**
     * Initializes the Pinecone index if it doesn't already exist.
     */
    public async initSchema(): Promise<void> {
        try {
            const indexes = await this.client.listIndexes();
            if (!indexes.indexes?.some((idx) => idx.name === this.indexName)) {
                await this.client.createIndex({
                    name: this.indexName,
                    spec: {
                    },
                });
                logger.info('[PineconeServerice] Index created:', { indexName: this.indexName });
            } else {
                logger.info('[PineconeServerice] Index already exists:', { indexName: this.indexName });
            }
        } catch (error) {
            logger.error('[PineconeServerice] Error in initSchema:', { error });
            throw error;
        }
    }

    /**
     * Stores a vector along with optional metadata in Pinecone.
     */
    public async storeVector(data: { id: string; vector: number[]; metadata?: Record<string, any>; }): Promise<any> {
        try {
            const index = this.client.index(this.indexName);
            const response = await index.upsert([{
                id: data.id,
                values: data.vector,
                metadata: data.metadata || {},
            }]);
            logger.info('[PineconeServerice] storeVector success', { id: data.id });
            return response;
        } catch (error) {
            logger.error('[PineconeServerice] storeVector error', { error, data });
            throw error;
        }
    }

    /**
     * Searches for the closest vectors based on the provided vector.
     */
    public async searchByVector(vector: number[], limit: number): Promise<any> {
        try {
            const index = this.client.index(this.indexName);
            const response = await index.query({
                vector,
                topK: limit,
                includeMetadata: true,
            });
            logger.info('[PineconeServerice] searchByVector success', { limit });
            return response.matches || [];
        } catch (error) {
            logger.error('[PineconeServerice] searchByVector error', { error, vector });
            throw error;
        }
    }

    /**
     * Deletes an item by ID.
     */
    public async deleteById(id: string): Promise<void> {
        try {
            const index = this.client.index(this.indexName);
            await index.deleteOne(id);
            logger.info('[PineconeServerice] Deleted object', { id });
        } catch (error) {
            logger.error('[PineconeServerice] deleteById error', { error, id });
            throw error;
        }
    }

    /**
     * Updates an existing vector's metadata.
     */
    public async updateById(id: string, data: any): Promise<void> {
        try {
            await this.storeVector({ id, vector: data.vector, metadata: data.metadata });
            logger.info('[PineconeServerice] Updated object', { id, data });
        } catch (error) {
            logger.error('[PineconeServerice] updateById error', { error, id, data });
            throw error;
        }
    }
}