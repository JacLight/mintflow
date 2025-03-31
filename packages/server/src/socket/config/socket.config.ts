import { createAdapter } from '@socket.io/redis-adapter';
import { Redis } from 'ioredis';
import { logger } from '@mintflow/common';
import { ENV } from '../../config/env.js';

/**
 * Creates a Redis adapter for Socket.IO to support multi-node deployments
 * This ensures that events emitted on one node are properly broadcast to clients connected to other nodes
 */
export const createRedisAdapter = () => {
    try {
        // Check if Redis is configured
        if (!ENV.REDIS_HOST) {
            logger.warn('[Socket] Redis not configured, multi-node Socket.IO support will not be available');
            return undefined;
        }

        const pubClient = new Redis({
            host: ENV.REDIS_HOST,
            port: parseInt(ENV.REDIS_PORT || '6379'),
            password: ENV.REDIS_PASSWORD,
            retryStrategy: (times) => {
                const delay = Math.min(times * 50, 2000);
                logger.info(`[Socket] Redis connection retry in ${delay}ms`);
                return delay;
            }
        });

        const subClient = pubClient.duplicate();

        // Handle connection events
        pubClient.on('error', (err) => {
            logger.error('[Socket] Redis pub client error', { error: err.message });
        });

        subClient.on('error', (err) => {
            logger.error('[Socket] Redis sub client error', { error: err.message });
        });

        pubClient.on('connect', () => {
            logger.info('[Socket] Redis pub client connected');
        });

        subClient.on('connect', () => {
            logger.info('[Socket] Redis sub client connected');
        });

        return createAdapter(pubClient, subClient);
    } catch (error: any) {
        logger.error('[Socket] Failed to create Redis adapter', { error: error.message });
        return undefined;
    }
};
