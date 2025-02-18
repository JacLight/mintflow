import express from 'express';
import flowRouter from './routes/flowRoutes';
import vectorRouter from './routes/vectorRoutes';
import uiRouter from './routes/uiRoutes';
import { logger } from './utils/logger';
import feRouter from './routes/flowEngineRoutes';
import listenerRouter from './routes/listenerRoutes';
import nodeRouter from './routes/nodeDefinitions';

export function createApp() {
    const app = express();
    app.use(express.json());

    // Health check
    app.get('/', (req, res) => {
        res.send('Node Orchestrator / Runner / Providers / UI is running.');
    });

    // app.use('engine', feRouter)

    // Flow routes (Node & Python tasks)
    // app.use('/flow', flowRouter);

    // app.use('/listener', listenerRouter);

    app.use('/node', nodeRouter);
    app.use('/vector', vectorRouter);
    app.use('/ui', uiRouter);

    // Basic error handler
    app.use((err: any, req: any, res: any, next: any) => {
        logger.error('[App] Uncaught error in middleware', { error: err });
        res.status(500).json({ error: err.message || 'Internal server error' });
    });

    return app;
}
