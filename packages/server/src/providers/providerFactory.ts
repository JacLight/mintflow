import { logger } from "@mintflow/common";
import { ENV } from "../config/env.js";
import { IDatabaseProvider } from "../interfaces/IDatabaseProvider.js";
import { IVectorDbProvider } from "../interfaces/IVectorDbProvider.js";
import { MongoProvider } from "./database/mongoProvider.js";
import { PostgresProvider } from "./database/postgresProvider.js";
import { WeaviateProvider } from "./vectorDb/weaviateProvider.js";
import { PineconeProvider } from "./vectorDb/pineconeProvider.js";

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

    public static async getVectorDbProvider(): Promise<IVectorDbProvider> {
        if (!this.vectorInstance) {
            if (ENV.VECTOR_DB_PROVIDER === 'weaviate') {
                this.vectorInstance = await WeaviateProvider.getInstance();
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
