import axios from 'axios';
import { ENV } from '../../config/env.js';
import { logger } from '@mintflow/common';
import { IVectorDbProvider } from '../../interfaces/IVectorDbProvider.js';

/**
 * A Pinecone-based provider for storing & querying vectors.
 * Expects you have an existing index named ENV.PINECONE_INDEX.
 */
export class PineconeProvider implements IVectorDbProvider {
    private static instance: PineconeProvider;

    private constructor() { }

    public static getInstance(): PineconeProvider {
        if (!PineconeProvider.instance) {
            PineconeProvider.instance = new PineconeProvider();
        }
        return PineconeProvider.instance;
    }

    public async initSchema(): Promise<void> {
        // Pinecone doesn't do "schema" in the same sense. 
        logger.info('[PineconeProvider] initSchema => no-op. Ensure index is created externally.');
    }

    public async storeVector(data: {
        id: string; vector: number[];
        [key: string]: any;
    }): Promise<any> {
        const { PINECONE_API_KEY, PINECONE_ENV, PINECONE_INDEX } = ENV;
        if (!PINECONE_API_KEY || !PINECONE_ENV) {
            throw new Error('[PineconeProvider] Missing Pinecone API key or ENV');
        }
        const upsertUrl = `https://${PINECONE_INDEX}-${PINECONE_ENV}.svc.pinecone.io/v1/vectors/upsert`;
        const payload = {
            vectors: [
                {
                    id: data.id,
                    values: data.vector,
                    metadata: data
                }
            ]
        };
        try {
            const resp = await axios.post(upsertUrl, payload, {
                headers: {
                    'Api-Key': PINECONE_API_KEY,
                    'Content-Type': 'application/json'
                }
            });
            logger.info('[PineconeProvider] storeVector success', { id: data.id });
            return resp.data;
        } catch (err) {
            logger.error('[PineconeProvider] storeVector error', { error: err, data });
            throw err;
        }
    }

    public async searchByVector(vector: number[], limit = 3): Promise<any> {
        const { PINECONE_API_KEY, PINECONE_ENV, PINECONE_INDEX } = ENV;
        const queryUrl = `https://${PINECONE_INDEX}-${PINECONE_ENV}.svc.pinecone.io/v1/vectors/query`;
        const payload = {
            vector,
            topK: limit,
            includeMetadata: true
        };
        try {
            const resp = await axios.post(queryUrl, payload, {
                headers: {
                    'Api-Key': PINECONE_API_KEY,
                    'Content-Type': 'application/json'
                }
            });
            logger.info('[PineconeProvider] searchByVector success', { vector, limit });
            return resp.data.matches || [];
        } catch (err) {
            logger.error('[PineconeProvider] searchByVector error', { error: err, vector });
            throw err;
        }
    }

    public async deleteById(id: string): Promise<void> {
        const { PINECONE_API_KEY, PINECONE_ENV, PINECONE_INDEX } = ENV;
        const delUrl = `https://${PINECONE_INDEX}-${PINECONE_ENV}.svc.pinecone.io/v1/vectors/delete`;
        const payload = { ids: [id] };
        try {
            await axios.post(delUrl, payload, {
                headers: {
                    'Api-Key': PINECONE_API_KEY,
                    'Content-Type': 'application/json'
                }
            });
            logger.info('[PineconeProvider] Deleted vector', { id });
        } catch (err) {
            logger.error('[PineconeProvider] deleteById error', { error: err, id });
            throw err;
        }
    }

    public async updateById(id: string, data: any): Promise<void> {
        logger.info('[PineconeProvider] updateById => no direct partial update. Re-upsert needed.', { id, data });
        // You would typically retrieve the old vector & metadata, then upsert a new version.
    }
}
