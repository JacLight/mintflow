import dotenv from 'dotenv';
import { logger } from "@mintflow/common/helpers";

dotenv.config(); // Loads from .env if present

/**
 * Environment variables controlling the providers & services.
 * For production, ensure these are set in your deployment environment or secrets manager.
 */
export const ENV = {
    PORT: process.env.PORT || '7001',

    // DB provider
    DB_PROVIDER: process.env.DB_PROVIDER || 'mongo',
    MONGO_URI: process.env.MONGO_URI || 'mongodb://localhost:27017/phd_db',
    POSTGRES_URI: process.env.POSTGRES_URI || 'postgres://user:pass@localhost:5432/phd_db',

    // Redis
    REDIS_HOST: process.env.REDIS_HOST || 'localhost',
    REDIS_PORT: parseInt(process.env.REDIS_PORT || '6379', 10),

    // Vector DB provider
    VECTOR_DB_PROVIDER: process.env.VECTOR_DB_PROVIDER || 'weaviate',
    WEAVIATE_HOST: process.env.WEAVIATE_HOST || 'http://localhost:8080',

    PINECONE_API_KEY: process.env.PINECONE_API_KEY || '',
    PINECONE_ENV: process.env.PINECONE_ENV || '',
    PINECONE_INDEX: process.env.PINECONE_INDEX || 'phd-index',
};

// Quick log to confirm environment config
logger.info('[ENV] Loaded environment config', { ENV });