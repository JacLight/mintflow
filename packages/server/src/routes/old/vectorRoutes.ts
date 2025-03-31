import { Router, Request, Response } from 'express';
import { logger } from "@mintflow/common";
import { VectorDBService } from '../../services/VectorDBService.js';

const vectorRoutes: Router = Router();

/**
 * Demonstrates using the chosen vector DB (Weaviate or Pinecone) at runtime.
 */

// POST /vector/initSchema
vectorRoutes.post('/initSchema', async (req: Request, res: Response) => {
    try {
        const vecDb = await VectorDBService.getInstance();
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
vectorRoutes.post('/store', async (req: Request, res: Response) => {
    try {
        const { id, vector, title, metadata } = req.body;
        const vecDb = await VectorDBService.getInstance();
        const result = await vecDb.storeVector(req.body);
        res.json({ message: 'Vector stored', result });
    } catch (err: any) {
        logger.error('[vectorRoutes] store error', { error: err });
        res.status(500).json({ error: err.message });
    }
});

// POST /vector/search
// body: { vector: number[], limit?: number }
vectorRoutes.post('/search', async (req: Request, res: Response) => {
    try {
        const { vector, limit } = req.body;
        const vecDb = await VectorDBService.getInstance();
        const results = await vecDb.searchByVector(vector, limit);
        res.json({ message: 'Search results', results });
    } catch (err: any) {
        logger.error('[vectorRoutes] search error', { error: err });
        res.status(500).json({ error: err.message });
    }
});

export default vectorRoutes;
