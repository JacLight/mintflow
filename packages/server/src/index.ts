import { logger } from '@mintflow/common';
import { createApp } from './app.js';
import { ENV } from './config/env.js';
import http from 'http';
import { setupServerConsole } from './cli/index.js';
import { SocketManager } from './socket/SocketManager.js';

async function main() {
    try {
        // 1) Initialize chosen DB provider
        // const dbProvider = ProviderFactory.getDatabaseProvider();
        // await dbProvider.connect();

        // 2) Initialize chosen vector DB provider
        // const vectorDb = ProviderFactory.getVectorDbProvider();
        // await vectorDb.initSchema(); // Weaviate creates a class, Pinecone is no-op

        // 3) Spawn Node-based runners
        // initializeAllNodeRunners();

        // 4) Start Express server
        const app = await createApp();
        const server = http.createServer(app);

        // 5) Initialize Socket.IO
        const socketManager = SocketManager.initialize(server);
        socketManager.initializeNamespaces();

        logger.info('[Socket] Socket.IO server initialized');

        // 6) Start HTTP server
        server.listen(ENV.PORT, () => {
            logger.info(`[Server] Listening on port ${ENV.PORT}`);
            setupServerConsole();
        });

        // 7) Handle graceful shutdown
        const shutdown = async () => {
            logger.info('[Server] Shutting down...');

            try {
                // Close Socket.IO connections
                await socketManager.close();

                // Close HTTP server
                server.close(() => {
                    logger.info('[Server] HTTP server closed');
                    process.exit(0);
                });

                // Force exit after timeout
                setTimeout(() => {
                    logger.error('[Server] Forced shutdown after timeout');
                    process.exit(1);
                }, 5000);
            } catch (err: any) {
                logger.error('[Server] Error during shutdown', { error: err.message });
                process.exit(1);
            }
        };

        // Handle termination signals
        process.on('SIGTERM', shutdown);
        process.on('SIGINT', shutdown);

    } catch (err: any) {
        logger.error('[Main] Fatal startup error', { error: err });
        process.exit(1);
    }
}

main();
