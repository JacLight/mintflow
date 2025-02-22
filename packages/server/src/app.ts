import express from 'express';
import { loadPlugins } from './plugins-register.js';
import { logger } from '@mintflow/common';
import { QueueManager } from './queues/queueManager.js';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import userRouter from './routes/userRoutes.js';
import flowRouter from './routes/flowRoutes.js';
import flowRunRouter from './routes/flowRunRoutes.js';
import logRouter from './routes/logRoutes.js';
import nodeRouter from './routes/nodeRoutes.js';
import tenantRouter from './routes/tenantRoutes.js';


export async function createApp(): Promise<express.Express> {
    const app = express();
    app.use(express.json());
    app.use(cors());
    app.use(helmet());
    app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));


    // Health check
    app.get('/', (req: express.Request, res: express.Response) => {
        res.send('Node Orchestrator / Runner / Providers / UI is running.');
    });


    // Flow routes (Node & Python tasks)
    // app.use('/flow', flowRouter);
    // app.use('/tenant', tenantRouter);
    // app.use('/listener', listenerRouter);
    // app.use('engine', feRouter)
    // app.use('/vector', vectorRouter);
    // app.use('/ui', uiRouter);

    app.use('/api/nodes', nodeRouter);
    app.use('/api/tenants', tenantRouter);
    app.use('/api/users', userRouter);
    app.use('/api/flows', flowRouter);
    app.use('/api/flow-runs', flowRunRouter);
    app.use('/api/logs', logRouter);



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
