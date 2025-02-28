import weaviate, { WeaviateClient, connectToCustom } from 'weaviate-client';
import { logger } from '@mintflow/common';
import { IVectorDB } from '../interfaces/IVectorDB.js';
import { ENV } from '../config/env.js';

export class WeaviateService implements IVectorDB {
    private static instance: WeaviateService;
    private client: WeaviateClient;
    private readonly className = 'PhdItem';

    private constructor(client: WeaviateClient) {
        this.client = client;
        logger.info('[WeaviateService] Connected to Weaviate');
    }

    public static async getInstance(): Promise<WeaviateService> {
        if (!WeaviateService.instance) {
            const client = await connectToCustom({
                httpHost: ENV.WEAVIATE_HOST.replace(/^https?:\/\//, ''),
                httpPort: 8080, // Adjust if needed
                httpSecure: ENV.WEAVIATE_HOST.startsWith('https'),
                headers: {
                    'X-OpenAI-Api-Key': process.env.OPENAI_API_KEY || '',
                },
            });
            WeaviateService.instance = new WeaviateService(client);
        }
        return WeaviateService.instance;
    }

    public async initSchema(): Promise<void> {
        try {
            const collections = await this.client.collections.listAll();
            const exists = collections.some((col: any) => col.name === this.className);

            if (!exists) {
                await this.client.collections.create({
                    name: this.className,
                    properties: [
                        { name: 'title', dataType: 'text[]' },
                        { name: 'metadata', dataType: 'text[]' },
                    ],
                });
                logger.info('[WeaviateService] Schema initialized:', { className: this.className });
            } else {
                logger.info('[WeaviateService] Schema already exists:', { className: this.className });
            }
        } catch (error) {
            logger.error('[WeaviateService] Failed to initialize schema', { error });
            throw error;
        }
    }

    public async storeVector(data: {
        id: string;
        vector: number[];
        title?: string;
        metadata?: Record<string, any>;
    }): Promise<any> {
        try {
            const collection = this.client.collections.get(this.className);
            const response = await collection.data.insert({
                id: data.id,
                vector: data.vector,
                properties: {
                    title: data.title || 'Untitled',
                    metadata: data.metadata || { info: 'No metadata' },
                },
            });
            logger.info('[WeaviateService] storeVector success', { id: data.id });
            return response;
        } catch (error) {
            logger.error('[WeaviateService] storeVector error', { error, data });
            throw error;
        }
    }

    public async searchByVector(vector: number[], limit = 3): Promise<any> {
        try {
            const collection = this.client.collections.get(this.className);
            const results = await collection.query.nearVector(vector, {
                limit,
                returnProperties: ['id', 'title', 'metadata'],
            });

            logger.info('[WeaviateService] searchByVector success', { vector, limit });
            return results;
        } catch (error) {
            logger.error('[WeaviateService] searchByVector error', { error, vector });
            throw error;
        }
    }

    public async deleteById(id: string): Promise<void> {
        try {
            const collection = this.client.collections.get(this.className);
            await collection.data.deleteById(id);
            logger.info('[WeaviateService] Deleted object', { id });
        } catch (error) {
            logger.error('[WeaviateService] deleteById error', { error, id });
            throw error;
        }
    }

    public async updateById(id: string, data: any): Promise<void> {
        try {
            const collection = this.client.collections.get(this.className);
            await collection.data.update(data)
            logger.info('[WeaviateService] Updated object', { id, data });
        } catch (error) {
            logger.error('[WeaviateService] updateById error', { error, id, data });
            throw error;
        }
    }
}
