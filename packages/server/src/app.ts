import express from 'express';
import nodeRouter from './routes/nodeDefinitions.js';
import vectorRouter from './routes/vectorRoutes.js';
import uiRouter from './routes/uiRoutes.js';
import { loadPlugins } from './plugins-register.js';
import { logger } from '@mintflow/common';
import feRouter from './routes/flowEngineRoutes.js';
import { QueueManager } from './queues/queueManager.js';
import listenerRouter from './routes/listenerRoutes.js';
import flowRouter from './routes/flowRoutes.js';
import tenantRouter from './routes/tenantRoutes.js';

export async function createApp(): Promise<express.Express> {
    const app = express();
    app.use(express.json());

    // Health check
    app.get('/', (req: express.Request, res: express.Response) => {
        res.send('Node Orchestrator / Runner / Providers / UI is running.');
    });


    // Flow routes (Node & Python tasks)
    app.use('/flow', flowRouter);
    app.use('/tenant', tenantRouter);
    app.use('/listener', listenerRouter);
    app.use('engine', feRouter)
    app.use('/node', nodeRouter);
    app.use('/vector', vectorRouter);
    app.use('/ui', uiRouter);

    await loadPlugins();
    QueueManager.getInstance().getTenantQueue('default');
    QueueManager.getInstance().attachBullBoard(app);
    // Basic error handler
    app.use((err: any, req: any, res: any, next: any) => {
        logger.error('[App] Uncaught error in middleware', { error: err });
        res.status(500).json({ error: err.message || 'Internal server error' });
    });

    return app;
}
