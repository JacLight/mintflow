import { ENV } from './config/env';
import { logger } from './utils/logger';
import { ProviderFactory } from './providers/providerFactory';
import { createApp } from './app';

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
        const app = createApp();
        app.listen(ENV.PORT, () => {
            logger.info(`[Server] Listening on port ${ENV.PORT}`);
        });
    } catch (err: any) {
        logger.error('[Main] Fatal startup error', { error: err });
        process.exit(1);
    }
}

main();
