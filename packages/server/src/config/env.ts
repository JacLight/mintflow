import dotenv from 'dotenv';
import { logger } from "@mintflow/common";

dotenv.config(); // Load .env variables

/**
 * Environment variables controlling the providers & services.
 * For production, ensure these are set in your deployment environment or secrets manager.
 */
export const ENV = {
    // 🌍 Application Configuration
    PORT: process.env.PORT || '7001',
    NODE_ENV: process.env.NODE_ENV || 'development',
    LOG_LEVEL: process.env.LOG_LEVEL || 'info',

    // 🛢️ Database Configuration
    DB_NAME: process.env.DB_NAME || 'mintflow',
    DB_PROVIDER: process.env.DB_PROVIDER || 'mongo',

    // MongoDB Configuration
    MONGO_URI: process.env.MONGO_URI || 'mongodb://admin:admin@localhost:27017/mintflow',

    // PostgreSQL Configuration
    POSTGRES_USER: process.env.POSTGRES_USER || 'admin',
    POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD || 'admin',
    POSTGRES_DB: process.env.POSTGRES_DB || 'mintflow',
    POSTGRES_URI: process.env.POSTGRES_URI || `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@localhost:5432/${process.env.POSTGRES_DB}`,

    // 🚀 Redis/KeyDB Configuration
    REDIS_HOST: process.env.REDIS_HOST || 'localhost',
    REDIS_PORT: parseInt(process.env.REDIS_PORT || '6379', 10),
    REDIS_PASSWORD: process.env.REDIS_PASSWORD || '',
    REDIS_DB: parseInt(process.env.REDIS_DB || '0', 10),

    // 🧠 Vector Database Configuration
    VECTOR_DB_PROVIDER: process.env.VECTOR_DB_PROVIDER || 'weaviate',

    // Weaviate Configuration
    WEAVIATE_HOST: process.env.WEAVIATE_HOST || 'http://localhost:8080',
    WEAVIATE_API_KEY: process.env.WEAVIATE_API_KEY || '',

    // Pinecone Configuration (If using Pinecone)
    PINECONE_API_KEY: process.env.PINECONE_API_KEY || '',
    PINECONE_ENV: process.env.PINECONE_ENV || '',
    PINECONE_INDEX: process.env.PINECONE_INDEX || 'phd-index',

    // 🔑 Security & Authentication
    JWT_SECRET: process.env.JWT_SECRET || 'your_jwt_secret',
    ACCESS_TOKEN_EXPIRY: process.env.ACCESS_TOKEN_EXPIRY || '1h',
    REFRESH_TOKEN_EXPIRY: process.env.REFRESH_TOKEN_EXPIRY || '7d',

    // 📡 API Keys (if required)
    OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
    OPENAI_BASE_URL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
    OPENAI_DEFAULT_MODEL: process.env.OPENAI_DEFAULT_MODEL || 'gpt-4o',
    OPENAI_SYSTEM_PROMPT: process.env.OPENAI_SYSTEM_PROMPT || 'You are a helpful personal assistant for MintFlow users. Help them get things done efficiently.',
    GOOGLE_API_KEY: process.env.GOOGLE_API_KEY || '',

    METRICS_ENABLED: process.env.METRICS_ENABLED === 'true',
    MQTT_URL: process.env.MQTT_URL || 'mqtt://localhost:1883',

    // 🔌 Socket.IO Configuration
    SOCKET_AUTH_REQUIRED: process.env.SOCKET_AUTH_REQUIRED === 'true',
    SOCKET_PATH: process.env.SOCKET_PATH || '/socket.io',
    SOCKET_CORS_ORIGIN: process.env.SOCKET_CORS_ORIGIN || '*',
    SOCKET_CORS_METHODS: process.env.SOCKET_CORS_METHODS || 'GET,POST,PUT,DELETE',
    SOCKET_CORS_CREDENTIALS: process.env.SOCKET_CORS_CREDENTIALS === 'true'
};

// Quick log to confirm environment config (but avoid logging secrets)
logger.info('[ENV] Loaded environment config', {
    PORT: ENV.PORT,
    DB_PROVIDER: ENV.DB_PROVIDER,
    VECTOR_DB_PROVIDER: ENV.VECTOR_DB_PROVIDER,
    NODE_ENV: ENV.NODE_ENV,
    LOG_LEVEL: ENV.LOG_LEVEL
});
