import { Router, Request, Response } from 'express';
import { ProviderFactory } from '../providers/providerFactory';
import { logger } from '../utils/logger';

const vectorRouter = Router();

/**
 * Demonstrates using the chosen vector DB (Weaviate or Pinecone) at runtime.
 */

// POST /vector/initSchema
vectorRouter.post('/initSchema', async (req: Request, res: Response) => {
    try {
        const vecDb = ProviderFactory.getVectorDbProvider();
        await vecDb.initSchema();
        logger.info('[vectorRoutes] initSchema success');
        res.json({ message: 'Vector DB schema initialized.' });
    } catch (err: any) {
        logger.error('[vectorRoutes] initSchema error', { error: err });
        res.status(500).json({ error: err.message });
    }
});

// POST /vector/store
// body: { id, vector: [], title?, metadata? }
vectorRouter.post('/store', async (req: Request, res: Response) => {
    try {
        const vecDb = ProviderFactory.getVectorDbProvider();
        const result = await vecDb.storeVector(req.body);
        res.json({ message: 'Vector stored', result });
    } catch (err: any) {
        logger.error('[vectorRoutes] store error', { error: err });
        res.status(500).json({ error: err.message });
    }
});

// POST /vector/search
// body: { vector: number[], limit?: number }
vectorRouter.post('/search', async (req: Request, res: Response) => {
    try {
        const { vector, limit } = req.body;
        const vecDb = ProviderFactory.getVectorDbProvider();
        const results = await vecDb.searchByVector(vector, limit);
        res.json({ message: 'Search results', results });
    } catch (err: any) {
        logger.error('[vectorRoutes] search error', { error: err });
        res.status(500).json({ error: err.message });
    }
});

export default vectorRouter;
