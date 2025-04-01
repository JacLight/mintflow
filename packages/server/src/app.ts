import express from 'express';
import { loadPlugins } from './plugins-register.js';
import { logger } from '@mintflow/common';
import { QueueManager } from './queues/queueManager.js';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { authMiddleware } from './middlewares/authMiddleware.js';
import userRouter from './routes/userRoutes.js';
import flowRouter from './routes/flowRoutes.js';
import flowRunRouter from './routes/flowRunRoutes.js';
import logRouter from './routes/logRoutes.js';
import nodeRouter from './routes/nodeRoutes.js';
import tenantRouter from './routes/tenantRoutes.js';
import metricsRouter from './routes/metricsRoutes.js';
import adminRouter from './routes/adminRoutes.js';
import executionsRouter from './routes/executionsRoutes.js';
import authRouter from './routes/authRoutes.js';


export async function createApp(): Promise<express.Express> {
    const app = express();
    app.use(express.json());
    app.use(cors());
    app.use(helmet());
    app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));


    // Health check - public route
    app.get('/', (req: express.Request, res: express.Response) => {
        res.send('Node Orchestrator / Runner / Providers / UI is running.');
    });

    // Authentication routes
    app.use('/api/auth', authRouter);

    // Protected routes - require authentication
    app.use('/api/nodes', authMiddleware, nodeRouter);
    app.use('/api/tenants', authMiddleware, tenantRouter);
    app.use('/api/users', authMiddleware, userRouter);
    app.use('/api/flows', authMiddleware, flowRouter);
    app.use('/api/flow-runs', authMiddleware, flowRunRouter);
    app.use('/api/logs', authMiddleware, logRouter);
    app.use('/api/metrics', authMiddleware, metricsRouter);
    app.use('/api/admin', authMiddleware, adminRouter);
    app.use('/api/admin/executions', authMiddleware, executionsRouter);



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
