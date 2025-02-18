import Bull from 'bull';
import { RedisOptions } from 'ioredis';
import { logger } from '../utils/logger';
import { ENV } from '../config/env';

/**
 * A singleton that manages creation of per-tenant Bull queues.
 */
export class QueueManager {
    private static instance: QueueManager;
    private queues = new Map<string, Bull.Queue>();
    private redisOptions: RedisOptions;

    private constructor() {
        this.redisOptions = {
            host: ENV.REDIS_HOST,
            port: ENV.REDIS_PORT,
        };
        logger.info('[QueueManager] Initialized with redisOptions', this.redisOptions);
    }

    public static getInstance(): QueueManager {
        if (!QueueManager.instance) {
            QueueManager.instance = new QueueManager();
        }
        return QueueManager.instance;
    }

    public getTenantQueue(tenantId: string): Bull.Queue {
        if (!this.queues.has(tenantId)) {
            const queueName = `queue_${tenantId}`;
            const queue = new Bull(queueName, { redis: this.redisOptions });
            this.queues.set(tenantId, queue);
            logger.info('[QueueManager] Created new Bull queue', { queueName });
        }
        return this.queues.get(tenantId)!;
    }
}
