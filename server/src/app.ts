import express from 'express';
import flowRouter from './routes/flowRoutes';
import vectorRouter from './routes/vectorRoutes';
import uiRouter from './routes/uiRoutes';
import { logger } from './utils/logger';

export function createApp() {
    const app = express();
    app.use(express.json());

    // Health check
    app.get('/', (req, res) => {
        res.send('Node Orchestrator / Runner / Providers / UI is running.');
    });

    // Flow routes (Node & Python tasks)
    // app.use('/flow', flowRouter);

    // Vector DB routes (Weaviate/Pinecone)
    // app.use('/vector', vectorRouter);
    // UI routes for designing flows
    // app.use('/ui', uiRouter);

    // Basic error handler
    app.use((err: any, req: any, res: any, next: any) => {
        logger.error('[App] Uncaught error in middleware', { error: err });
        res.status(500).json({ error: err.message || 'Internal server error' });
    });

    return app;
}
