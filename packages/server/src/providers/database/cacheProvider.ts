import { logger } from '@mintflow/common';
import { Redis } from 'ioredis';
import { ENV } from '../../config/env.js';

export class RepositoryProviderRedis {
    private static instance: RepositoryProviderRedis;
    private redis: Redis;

    getInstance(): RepositoryProviderRedis {
        if (!RepositoryProviderRedis.instance) {
            logger.info('Redis repository provider initialized.');
            RepositoryProviderRedis.instance = new RepositoryProviderRedis();
        }
        return RepositoryProviderRedis.instance;
    }

    constructor() {
        if (!RepositoryProviderRedis.instance) {
            logger.info('Redis repository provider initialized.');
            RepositoryProviderRedis.instance = this;
        }
        this.redis = new Redis({
            host: ENV.REDIS_HOST,
            port: ENV.REDIS_PORT,
            db: 0
        });
    }

    getClient() {
        return this.redis
    }

    private getTenantKey(tenantId: string, key: string): string {
        return `${tenantId}:${key}`;
    }

    async exists(tenantId: string, key: string): Promise<boolean> {
        const tenantKey = this.getTenantKey(tenantId, key);
        const exists = await this.redis.exists(tenantKey);
        logger.info(`Key ${tenantKey} exists: ${exists}`);
        return exists === 1;
    }

    async keys(tenantId: string, pattern: string): Promise<string[]> {
        const tenantPattern = this.getTenantKey(tenantId, pattern);
        const keys = await this.redis.keys(tenantPattern);
        logger.info(`Keys found for pattern ${tenantPattern}: ${keys.length}`);
        return keys;
    }

    async set(tenantId: string, key: string, value: string, ttl?: number): Promise<void> {
        const tenantKey = this.getTenantKey(tenantId, key);
        if (ttl) {
            await this.redis.set(tenantKey, value, 'EX', ttl);
        } else {
            await this.redis.set(tenantKey, value);
        }
        logger.info(`Key ${tenantKey} set.`);
    }

    async get(tenantId: string, key: string): Promise<string | null> {
        const tenantKey = this.getTenantKey(tenantId, key);
        const value = await this.redis.get(tenantKey);
        logger.info(`Key ${tenantKey} retrieved.`);
        return value;
    }

    async delete(tenantId: string, key: string): Promise<number> {
        const tenantKey = this.getTenantKey(tenantId, key);
        const result = await this.redis.del(tenantKey);
        logger.info(`Key ${tenantKey} deleted.`);
        return result;
    }

    async clearTenantData(tenantId: string, key?: string): Promise<number> {
        const pattern = key ? `${tenantId}:${key}*` : `${tenantId}:*`;
        const keys = await this.redis.keys(pattern);
        const promises = keys.map(key => this.redis.del(key));
        const results = await Promise.all(promises);
        logger.info(`All keys for tenant ${tenantId} cleared.`);
        return results.length;
    }
}