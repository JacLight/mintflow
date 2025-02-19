import { ENV } from '../../config/env.js';
import { logger } from '@mintflow/common';
import { IVectorDbProvider } from '../../interfaces/IVectorDbProvider.js';
import weaviate, { WeaviateClient } from 'weaviate-client'

/**
 * A robust Weaviate provider. Demonstrates schema creation, storeVector, search, etc.
 */
export class WeaviateProvider implements IVectorDbProvider {
    private static instance: WeaviateProvider;
    private className = 'PhdItem';
    private client: any

    private constructor() {

    }

    public static async getInstance(): Promise<WeaviateProvider> {
        if (!WeaviateProvider.instance) {
            WeaviateProvider.instance = new WeaviateProvider();

            const scheme = ENV.WEAVIATE_HOST.startsWith('https') ? 'https' : 'http';
            const host = ENV.WEAVIATE_HOST.replace(/^https?:\/\//, '');
            const apiKey = ENV.WEAVIATE_HOST.replace(/^https?:\/\//, '');

            WeaviateProvider.instance.client = await weaviate.connectToWeaviateCloud(
                host, {
                authCredentials: new weaviate.ApiKey(apiKey),
                headers: {
                    'X-OpenAI-Api-Key': process.env.OPENAI_API_KEY || '',
                }
            }
            )
        }
        return WeaviateProvider.instance;
    }

    public async initSchema(): Promise<void> {
        try {
            const currentSchema = await this.client.schema.getter().do();
            const existingClass = currentSchema.classes?.find(
                (c: any) => c.class === this.className
            );
            if (!existingClass) {
                // Create a minimal class
                await this.client.schema.classCreator().withClass({
                    class: this.className,
                    vectorizer: 'none',
                    properties: [
                        { name: 'title', dataType: ['string'] },
                        { name: 'metadata', dataType: ['string'] },
                    ],
                }).do();
                logger.info('[WeaviateProvider] Created class', { className: this.className });
            } else {
                logger.info('[WeaviateProvider] Class already exists', { className: this.className });
            }
        } catch (err) {
            logger.error('[WeaviateProvider] initSchema error', { error: err });
            throw err;
        }
    }

    public async storeVector(data: {
        id: string;
        vector: number[];
        title?: string;
        metadata?: string;
    }): Promise<any> {
        try {
            const resp = await this.client.data
                .creator()
                .withClassName(this.className)
                .withId(data.id)
                .withProperties({
                    title: data.title || 'Untitled',
                    metadata: data.metadata || 'No metadata',
                })
                .withVector(data.vector)
                .do();
            logger.info('[WeaviateProvider] storeVector success', { id: data.id });
            return resp;
        } catch (err) {
            logger.error('[WeaviateProvider] storeVector error', { error: err, data });
            throw err;
        }
    }

    public async searchByVector(vector: number[], limit = 3): Promise<any> {
        try {
            const result = await this.client.graphql
                .get()
                .withClassName(this.className)
                .withFields('title metadata _additional { id distance }')
                .withNearVector({ vector })
                .withLimit(limit)
                .do();
            logger.info('[WeaviateProvider] searchByVector success', { vector, limit });
            return result.data.Get[this.className] || [];
        } catch (err) {
            logger.error('[WeaviateProvider] searchByVector error', { error: err, vector });
            throw err;
        }
    }

    public async deleteById(id: string): Promise<void> {
        try {
            await this.client.data
                .deleter()
                .withClassName(this.className)
                .withId(id)
                .do();
            logger.info('[WeaviateProvider] Deleted object', { id });
        } catch (err) {
            logger.error('[WeaviateProvider] deleteById error', { error: err, id });
            throw err;
        }
    }

    public async updateById(id: string, data: any): Promise<void> {
        try {
            await this.client.data
                .updater()
                .withClassName(this.className)
                .withId(id)
                .withProperties(data)
                .do();
            logger.info('[WeaviateProvider] Updated object', { id, data });
        } catch (err) {
            logger.error('[WeaviateProvider] updateById error', { error: err, id, data });
            throw err;
        }
    }
}
