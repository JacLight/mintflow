import { logger } from '@mintflow/common';
import { createApp } from './app.js';
import { ENV } from './config/env.js';
import { Server } from 'socket.io';
import http from 'http';
import { setupServerConsole } from './cli/index.js';

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

        const io = new Server(server);
        io.on('connection', (socket) => {
            logger.info(`[Socket] Client connected: ${socket.id}`);
        });

        server.listen(ENV.PORT, () => {
            logger.info(`[Server] Listening on port ${ENV.PORT}`);
            setupServerConsole();  // Sta
        });

    } catch (err: any) {
        logger.error('[Main] Fatal startup error', { error: err });
        process.exit(1);
    }
}

main();
