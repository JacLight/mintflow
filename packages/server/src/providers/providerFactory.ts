import { logger } from '../utils/logger';
import { ENV } from '../config/env';

import { IDatabaseProvider } from '../interfaces/IDatabaseProvider';
import { IVectorDbProvider } from '../interfaces/IVectorDbProvider';

// DB Providers
import { MongoProvider } from './database/mongoProvider';
import { PostgresProvider } from './database/postgresProvider';

// Vector DB Providers
import { WeaviateProvider } from './vectorDb/weaviateProvider';
import { PineconeProvider } from './vectorDb/pineconeProvider';

/**
 * A factory that instantiates DB/VectorDB providers based on env variables.
 */
export class ProviderFactory {
    private static dbInstance: IDatabaseProvider;
    private static vectorInstance: IVectorDbProvider;

    public static getDatabaseProvider(): IDatabaseProvider {
        if (!this.dbInstance) {
            if (ENV.DB_PROVIDER === 'mongo') {
                this.dbInstance = MongoProvider.getInstance();
                logger.info('[ProviderFactory] Using MongoProvider');
            } else if (ENV.DB_PROVIDER === 'postgres') {
                this.dbInstance = PostgresProvider.getInstance();
                logger.info('[ProviderFactory] Using PostgresProvider');
            } else {
                throw new Error(`[ProviderFactory] Unknown DB_PROVIDER: ${ENV.DB_PROVIDER}`);
            }
        }
        return this.dbInstance;
    }

    public static getVectorDbProvider(): IVectorDbProvider {
        if (!this.vectorInstance) {
            if (ENV.VECTOR_DB_PROVIDER === 'weaviate') {
                this.vectorInstance = WeaviateProvider.getInstance();
                logger.info('[ProviderFactory] Using WeaviateProvider');
            } else if (ENV.VECTOR_DB_PROVIDER === 'pinecone') {
                this.vectorInstance = PineconeProvider.getInstance();
                logger.info('[ProviderFactory] Using PineconeProvider');
            } else {
                throw new Error(`[ProviderFactory] Unknown VECTOR_DB_PROVIDER: ${ENV.VECTOR_DB_PROVIDER}`);
            }
        }
        return this.vectorInstance;
    }
}
